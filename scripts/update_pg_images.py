import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import asyncio

ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Diverse image sets for different PGs
image_sets = [
    [
        "https://images.unsplash.com/photo-1745221847962-0397cc719b8e?w=800&q=80",
        "https://images.unsplash.com/photo-1609587639086-b4cbf85e4355?w=800&q=80",
        "https://images.unsplash.com/photo-1677658288024-b6b9ed29354e?w=800&q=80",
        "https://images.unsplash.com/photo-1675118546055-32c56579cc58?w=800&q=80"
    ],
    [
        "https://images.pexels.com/photos/35505512/pexels-photo-35505512.jpeg?auto=compress&w=800",
        "https://images.pexels.com/photos/35505496/pexels-photo-35505496.jpeg?auto=compress&w=800",
        "https://images.pexels.com/photos/5644713/pexels-photo-5644713.jpeg?auto=compress&w=800",
        "https://images.pexels.com/photos/4099388/pexels-photo-4099388.jpeg?auto=compress&w=800"
    ],
    [
        "https://images.pexels.com/photos/5158463/pexels-photo-5158463.jpeg?auto=compress&w=800",
        "https://images.pexels.com/photos/35509510/pexels-photo-35509510.jpeg?auto=compress&w=800",
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
        "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80",
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=800&q=80",
        "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&q=80",
        "https://images.unsplash.com/photo-1616594266886-d8b6a2e96a9d?w=800&q=80",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
        "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&q=80",
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"
    ],
    [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
        "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800&q=80"
    ]
]

async def update_images():
    print("Updating PG images with diverse photos...")
    
    pgs = await db.pgs.find({}, {"_id": 0}).to_list(200)
    print(f"Found {len(pgs)} PGs to update")
    
    update_count = 0
    for idx, pg in enumerate(pgs):
        # Assign different image set to each PG
        image_set_idx = idx % len(image_sets)
        new_images = image_sets[image_set_idx]
        
        await db.pgs.update_one(
            {"id": pg["id"]},
            {"$set": {"images": new_images}}
        )
        update_count += 1
    
    print(f"✓ Successfully updated {update_count} PG images!")
    print(f"  Using {len(image_sets)} different image sets")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_images())
