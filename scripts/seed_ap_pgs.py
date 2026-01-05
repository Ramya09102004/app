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

# Andhra Pradesh cities and locations
ap_locations = {
    "Vijayawada": ["Benz Circle", "MG Road", "Governorpet", "Payakapuram", "Gunadala", "Auto Nagar", "Patamata"],
    "Guntur": ["Arundelpet", "Brodipet", "Lakshmipuram", "Ashok Nagar", "Kothapeta", "Nallapadu"],
    "Visakhapatnam": ["MVP Colony", "Dwaraka Nagar", "Gajuwaka", "Madhurawada", "Rushikonda"],
    "Tirupati": ["Air Bypass Road", "Renigunta Road", "Sri Venkateswara University Area", "Kapila Theertham Road"],
    "Nellore": ["Dargamitta", "Ranganayakulapet", "Vedayapalem", "Pogathota"],
    "Kakinada": ["Main Road", "Jawahar Street", "RTC Complex Area", "Sarpavaram"],
    "Rajahmundry": ["Danavaipeta", "T Nagar", "Innispeta", "Morampudi"]
}

amenities_pool = [
    ["WiFi", "AC", "Attached Bathroom", "Power Backup", "Security", "Study Table"],
    ["WiFi", "TV", "Fridge", "Washing Machine", "Power Backup", "Hot Water"],
    ["WiFi", "AC", "Hot Water", "Parking", "Security", "24x7 Water"],
    ["WiFi", "Attached Bathroom", "Hot Water", "Security", "TV", "Laundry"],
    ["WiFi", "AC", "Fridge", "Power Backup", "Security", "RO Water"],
    ["WiFi", "Power Backup", "Security", "Parking", "Hot Water", "CCTV"],
    ["WiFi", "AC", "TV", "Attached Bathroom", "Security", "Housekeeping"],
    ["WiFi", "Hot Water", "Power Backup", "Parking", "Security", "Meal Service"]
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
    "Well-Maintained PG in {location}",
    "Student-Friendly PG at {location}",
    "Professional PG near {location}"
]

descriptions_templates = [
    "Well-maintained PG with all modern amenities. Close to colleges and IT parks. Safe and secure environment for students and professionals.",
    "Spacious rooms with excellent facilities. Located in a prime area with easy access to public transport. Perfect for working professionals.",
    "Comfortable accommodation in a peaceful locality. All basic amenities provided. Vegetarian and non-vegetarian food available.",
    "Modern PG with homely atmosphere. Near shopping centers and restaurants. Ideal for students and young professionals.",
    "Quality accommodation with top-notch facilities. Located in a well-connected area with excellent transport links.",
    "Affordable PG with clean rooms and good facilities. Safe neighborhood with 24/7 security. Close to educational institutions and companies.",
    "Newly furnished PG with modern interiors. All rooms well-ventilated and spacious. Great location with easy commute options.",
    "Homely environment with caring staff. Regular housekeeping and maintenance. Perfect for those new to the city.",
    "Conveniently located PG with all essential amenities. Walking distance to supermarkets and hospitals. Peaceful residential area.",
    "Comfortable stay with modern facilities. Close to bus stops and railway station. Suitable for both students and working professionals."
]

images_pool = [
    "https://images.unsplash.com/photo-1745221847962-0397cc719b8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1609587639086-b4cbf85e4355?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1677658288024-b6b9ed29354e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1675118546055-32c56579cc58?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGV4dGVyaW9yJTIwc3Vubnl8ZW58MHx8fHwxNzY3NjE2MTI1fDA&ixlib=rb-4.1.0&q=85"
]

available_dates = ["2024-02-01", "2024-02-15", "2024-03-01", "2024-01-25", "2024-02-10"]

async def create_ap_pgs():
    print("Creating Andhra Pradesh PG listings...")
    
    # Get or create owner
    owner = await db.users.find_one({"email": "owner@example.com"}, {"_id": 0})
    if not owner:
        owner_id = str(uuid.uuid4())
        owner = {
            "id": owner_id,
            "name": "Sample Owner",
            "email": "owner@example.com",
            "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYPxq7JQGKu",
            "phone": "+91 9876543210",
            "role": "owner",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(owner)
    else:
        owner_id = owner["id"]
    
    pgs = []
    pg_count = 0
    
    for city, locations in ap_locations.items():
        for location in locations:
            # Create 2-3 PGs per location
            for j in range(2 if pg_count % 2 == 0 else 3):
                pg_count += 1
                title = titles_templates[pg_count % len(titles_templates)].format(location=location)
                description = descriptions_templates[pg_count % len(descriptions_templates)]
                room_type = room_types[pg_count % len(room_types)]
                gender_pref = gender_prefs[pg_count % len(gender_prefs)]
                food_included = pg_count % 3 == 0
                
                # Pricing for Andhra Pradesh cities
                base_price = 6000
                if city in ["Vijayawada", "Visakhapatnam", "Tirupati"]:
                    base_price = 7000
                elif city == "Guntur":
                    base_price = 6500
                
                if room_type == "single":
                    price = base_price + (pg_count % 5) * 800
                elif room_type == "double":
                    price = base_price - 1500 + (pg_count % 4) * 600
                else:
                    price = base_price - 2000 + (pg_count % 3) * 500
                
                pg = {
                    "id": str(uuid.uuid4()),
                    "owner_id": owner_id,
                    "owner_name": "Sample Owner",
                    "title": title,
                    "description": description,
                    "address": f"{j+1}/{pg_count}, {location}",
                    "city": city,
                    "price": float(price),
                    "room_type": room_type,
                    "amenities": amenities_pool[pg_count % len(amenities_pool)],
                    "images": images_pool,
                    "available_from": available_dates[pg_count % len(available_dates)],
                    "food_included": food_included,
                    "gender_preference": gender_pref,
                    "rating": round(3.5 + (pg_count % 15) * 0.1, 1),
                    "review_count": pg_count % 8,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                pgs.append(pg)
    
    # Insert all Andhra Pradesh PGs
    if pgs:
        await db.pgs.insert_many(pgs)
        print(f"✓ Successfully created {len(pgs)} Andhra Pradesh PG listings!")
        print(f"\nCity-wise breakdown:")
        for city in ap_locations.keys():
            city_count = len([pg for pg in pgs if pg['city'] == city])
            print(f"  {city}: {city_count} PGs")
        print(f"\nPrice range: ₹{min([pg['price'] for pg in pgs])} - ₹{max([pg['price'] for pg in pgs])}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_ap_pgs())
