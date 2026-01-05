from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    role: str = "seeker"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    phone: str
    role: str
    created_at: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class PGCreate(BaseModel):
    title: str
    description: str
    address: str
    city: str
    price: float
    room_type: str
    amenities: List[str]
    images: List[str]
    available_from: str
    food_included: bool = False
    gender_preference: str = "any"

class PGResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    owner_id: str
    owner_name: str
    title: str
    description: str
    address: str
    city: str
    price: float
    room_type: str
    amenities: List[str]
    images: List[str]
    available_from: str
    food_included: bool
    gender_preference: str
    rating: float
    review_count: int
    created_at: str

class InquiryCreate(BaseModel):
    pg_id: str
    message: str
    preferred_date: Optional[str] = None

class InquiryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    pg_id: str
    pg_title: str
    user_id: str
    user_name: str
    user_email: str
    user_phone: str
    message: str
    preferred_date: Optional[str]
    status: str
    created_at: str

class ReviewCreate(BaseModel):
    pg_id: str
    rating: int = Field(ge=1, le=5)
    comment: str
    stay_duration: Optional[str] = None

class ReviewResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    pg_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    stay_duration: Optional[str]
    verified: bool
    created_at: str

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user: UserRegister):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "phone": user.phone,
        "role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user.email, user.role)
    user_response = UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        created_at=user_doc["created_at"]
    )
    return AuthResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    user_response = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        phone=user["phone"],
        role=user["role"],
        created_at=user["created_at"]
    )
    return AuthResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@api_router.post("/pgs", response_model=PGResponse)
async def create_pg(pg: PGCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can create listings")
    
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    pg_id = str(uuid.uuid4())
    pg_doc = {
        "id": pg_id,
        "owner_id": current_user["user_id"],
        "owner_name": user["name"],
        "rating": 0.0,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        **pg.model_dump()
    }
    await db.pgs.insert_one(pg_doc)
    return PGResponse(**pg_doc)

@api_router.get("/pgs", response_model=List[PGResponse])
async def get_pgs(
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    room_type: Optional[str] = None,
    gender_preference: Optional[str] = None
):
    query = {}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if room_type:
        query["room_type"] = room_type
    if gender_preference:
        query["gender_preference"] = {"$in": [gender_preference, "any"]}
    
    pgs = await db.pgs.find(query, {"_id": 0}).to_list(100)
    return [PGResponse(**pg) for pg in pgs]

@api_router.get("/pgs/{pg_id}", response_model=PGResponse)
async def get_pg(pg_id: str):
    pg = await db.pgs.find_one({"id": pg_id}, {"_id": 0})
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    return PGResponse(**pg)

@api_router.put("/pgs/{pg_id}", response_model=PGResponse)
async def update_pg(pg_id: str, pg_update: PGCreate, current_user: dict = Depends(get_current_user)):
    existing_pg = await db.pgs.find_one({"id": pg_id}, {"_id": 0})
    if not existing_pg:
        raise HTTPException(status_code=404, detail="PG not found")
    if existing_pg["owner_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated_doc = {**existing_pg, **pg_update.model_dump()}
    await db.pgs.update_one({"id": pg_id}, {"$set": updated_doc})
    return PGResponse(**updated_doc)

@api_router.delete("/pgs/{pg_id}")
async def delete_pg(pg_id: str, current_user: dict = Depends(get_current_user)):
    pg = await db.pgs.find_one({"id": pg_id}, {"_id": 0})
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    if pg["owner_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.pgs.delete_one({"id": pg_id})
    return {"message": "PG deleted successfully"}

@api_router.get("/pgs/owner/my-listings", response_model=List[PGResponse])
async def get_my_listings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can view listings")
    pgs = await db.pgs.find({"owner_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    return [PGResponse(**pg) for pg in pgs]

@api_router.post("/inquiries", response_model=InquiryResponse)
async def create_inquiry(inquiry: InquiryCreate, current_user: dict = Depends(get_current_user)):
    pg = await db.pgs.find_one({"id": inquiry.pg_id}, {"_id": 0})
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    inquiry_id = str(uuid.uuid4())
    inquiry_doc = {
        "id": inquiry_id,
        "pg_id": inquiry.pg_id,
        "pg_title": pg["title"],
        "user_id": current_user["user_id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "user_phone": user["phone"],
        "message": inquiry.message,
        "preferred_date": inquiry.preferred_date,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.inquiries.insert_one(inquiry_doc)
    return InquiryResponse(**inquiry_doc)

@api_router.get("/inquiries/my-inquiries", response_model=List[InquiryResponse])
async def get_my_inquiries(current_user: dict = Depends(get_current_user)):
    inquiries = await db.inquiries.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    return [InquiryResponse(**inq) for inq in inquiries]

@api_router.get("/inquiries/received", response_model=List[InquiryResponse])
async def get_received_inquiries(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Only owners can view received inquiries")
    
    pgs = await db.pgs.find({"owner_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    pg_ids = [pg["id"] for pg in pgs]
    inquiries = await db.inquiries.find({"pg_id": {"$in": pg_ids}}, {"_id": 0}).to_list(100)
    return [InquiryResponse(**inq) for inq in inquiries]

@api_router.post("/reviews", response_model=ReviewResponse)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    pg = await db.pgs.find_one({"id": review.pg_id}, {"_id": 0})
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    
    existing_review = await db.reviews.find_one({
        "pg_id": review.pg_id,
        "user_id": current_user["user_id"]
    }, {"_id": 0})
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this PG")
    
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    review_id = str(uuid.uuid4())
    review_doc = {
        "id": review_id,
        "pg_id": review.pg_id,
        "user_id": current_user["user_id"],
        "user_name": user["name"],
        "rating": review.rating,
        "comment": review.comment,
        "stay_duration": review.stay_duration,
        "verified": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review_doc)
    
    reviews = await db.reviews.find({"pg_id": review.pg_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.pgs.update_one(
        {"id": review.pg_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(reviews)}}
    )
    
    return ReviewResponse(**review_doc)

@api_router.get("/reviews/{pg_id}", response_model=List[ReviewResponse])
async def get_reviews(pg_id: str):
    reviews = await db.reviews.find({"pg_id": pg_id}, {"_id": 0}).to_list(100)
    return [ReviewResponse(**review) for review in reviews]

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()