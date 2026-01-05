import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import asyncio
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", 
    "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Indore"
]

locations = {
    "Mumbai": ["Andheri", "Bandra", "Powai", "Thane", "Malad", "Goregaon"],
    "Delhi": ["Dwarka", "Rohini", "Lajpat Nagar", "Karol Bagh", "Hauz Khas"],
    "Bangalore": ["Koramangala", "HSR Layout", "Whitefield", "Marathahalli", "BTM Layout"],
    "Hyderabad": ["Hitech City", "Gachibowli", "Madhapur", "Kukatpally", "Ameerpet"],
    "Pune": ["Hinjewadi", "Viman Nagar", "Kothrud", "Aundh", "Baner"],
    "Chennai": ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "Porur"],
    "Kolkata": ["Salt Lake", "Park Street", "Rajarhat", "Ballygunge"],
    "Ahmedabad": ["Satellite", "Vastrapur", "Maninagar", "Bopal"],
    "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Mansarovar"],
    "Lucknow": ["Gomti Nagar", "Hazratganj", "Indira Nagar"],
    "Chandigarh": ["Sector 17", "Sector 22", "Sector 35"],
    "Indore": ["Vijay Nagar", "Palasia", "AB Road"]
}

amenities_pool = [
    ["WiFi", "AC", "Attached Bathroom", "Power Backup", "Security"],
    ["WiFi", "TV", "Fridge", "Washing Machine", "Power Backup"],
    ["WiFi", "AC", "Hot Water", "Parking", "Security", "Elevator"],
    ["WiFi", "Attached Bathroom", "Hot Water", "Security", "TV"],
    ["WiFi", "AC", "Fridge", "Washing Machine", "Gym", "Elevator"],
    ["WiFi", "Power Backup", "Security", "Parking", "Hot Water"],
    ["WiFi", "AC", "TV", "Attached Bathroom", "Security", "Elevator"],
    ["WiFi", "Hot Water", "Power Backup", "Parking", "Security"]
]

room_types = ["single", "double", "triple"]
gender_prefs = ["male", "female", "any"]

titles_templates = [
    "Comfortable PG near {location}",
    "Modern PG in {location}",
    "Affordable PG at {location}",
    "Spacious PG near {location}",
    "Premium PG in {location}",
    "Budget-Friendly PG at {location}",
    "Cozy PG near {location}",
    "Well-Maintained PG in {location}"
]

descriptions_templates = [
    "Well-maintained PG with all modern amenities. Close to metro station and major IT parks. Safe and secure environment for students and professionals.",
    "Spacious rooms with excellent facilities. Located in a prime area with easy access to public transport. Perfect for working professionals.",
    "Comfortable accommodation in a peaceful locality. All basic amenities provided. Vegetarian food available on request.",
    "Modern PG with homely atmosphere. Near shopping centers and restaurants. Ideal for students and young professionals.",
    "Premium quality accommodation with top-notch facilities. Located in the heart of the city with excellent connectivity.",
    "Affordable PG with clean rooms and good facilities. Safe neighborhood with 24/7 security. Close to educational institutions.",
    "Newly constructed PG with modern interiors. All rooms well-ventilated and spacious. Great location with easy commute options.",
    "Homely environment with caring staff. Regular housekeeping and maintenance. Perfect for those new to the city."
]

images_pool = [
    [
        "https://images.unsplash.com/photo-1745221847962-0397cc719b8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1609587639086-b4cbf85e4355?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1677658288024-b6b9ed29354e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1675118546055-32c56579cc58?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGV4dGVyaW9yJTIwc3Vubnl8ZW58MHx8fHwxNzY3NjE2MTI1fDA&ixlib=rb-4.1.0&q=85"
    ]
]

available_dates = ["2024-01-15", "2024-02-01", "2024-01-20", "2024-02-15", "2024-01-25"]

async def create_sample_pgs():
    print("Creating sample PG listings...")
    
    # Create a sample owner if not exists
    owner = await db.users.find_one({"email": "owner@example.com"}, {"_id": 0})
    if not owner:
        owner_id = str(uuid.uuid4())
        owner = {
            "id": owner_id,
            "name": "Sample Owner",
            "email": "owner@example.com",
            "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYPxq7JQGKu",  # password: password123
            "phone": "+91 9876543210",
            "role": "owner",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(owner)
        print(f"Created sample owner: {owner['email']}")
    else:
        owner_id = owner["id"]
    
    pgs = []
    pg_count = 0
    
    for city in cities:
        city_locations = locations.get(city, [city])
        for i, location in enumerate(city_locations):
            # Create 2-3 PGs per location
            for j in range(2 if i % 2 == 0 else 3):
                pg_count += 1
                title = titles_templates[pg_count % len(titles_templates)].format(location=location)
                description = descriptions_templates[pg_count % len(descriptions_templates)]
                room_type = room_types[pg_count % len(room_types)]
                gender_pref = gender_prefs[pg_count % len(gender_prefs)]
                food_included = pg_count % 3 == 0
                
                # Vary prices based on city and room type
                base_price = 8000
                if city in ["Mumbai", "Delhi", "Bangalore"]:
                    base_price = 12000
                elif city in ["Pune", "Hyderabad", "Chennai"]:
                    base_price = 10000
                
                if room_type == "single":
                    price = base_price + (pg_count % 5) * 1000
                elif room_type == "double":
                    price = base_price - 2000 + (pg_count % 4) * 1000
                else:
                    price = base_price - 3000 + (pg_count % 3) * 1000
                
                pg = {
                    "id": str(uuid.uuid4()),
                    "owner_id": owner_id,
                    "owner_name": "Sample Owner",
                    "title": title,
                    "description": description,
                    "address": f"{j+1}/234, {location}",
                    "city": city,
                    "price": float(price),
                    "room_type": room_type,
                    "amenities": amenities_pool[pg_count % len(amenities_pool)],
                    "images": images_pool[0],
                    "available_from": available_dates[pg_count % len(available_dates)],
                    "food_included": food_included,
                    "gender_preference": gender_pref,
                    "rating": round(3.5 + (pg_count % 15) * 0.1, 1),
                    "review_count": pg_count % 8,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                pgs.append(pg)
                
                if len(pgs) >= 50:  # Create 50 PGs
                    break
            if len(pgs) >= 50:
                break
        if len(pgs) >= 50:
            break
    
    # Clear existing PGs (optional)
    await db.pgs.delete_many({})
    
    # Insert all PGs
    if pgs:
        await db.pgs.insert_many(pgs)
        print(f"✓ Successfully created {len(pgs)} PG listings!")
        print(f"  Cities covered: {len(set([pg['city'] for pg in pgs]))}")
        print(f"  Price range: ₹{min([pg['price'] for pg in pgs])} - ₹{max([pg['price'] for pg in pgs])}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_pgs())
