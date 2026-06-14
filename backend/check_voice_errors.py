import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
import asyncio
from app.services.firestore_service import firestore_service

async def get_latest_error():
    docs = await firestore_service.db.collection("voice_commands").order_by("created_at", direction="DESCENDING").limit(10).get()
    for doc in docs:
        d = doc.to_dict()
        if d.get("status") == "failed":
            print(f"LATEST ERROR: {d.get('error_message')}")
            break

asyncio.run(get_latest_error())
