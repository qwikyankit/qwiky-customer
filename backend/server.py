from fastapi import FastAPI, APIRouter, HTTPException, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Qwiky API configuration
QWIKY_BASE_URL = "https://api.qwiky.in/qwiky-service/api/v1"
DEFAULT_HOOD_ID = "4dd4d3a6-c0b3-4042-8e01-5b9299273ee1"

# Default Bearer token
DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJtb2JpbGUiOiI5NjYwNzY2MjI3Iiwicm9sZXMiOlsiU1VQRVJfQURNSU4iLCJDVVNUT01FUiJdLCJ1c2VySWQiOiJjZGZiZDJmZC04OTkxLTRiNzMtOGZmYS1jNzE1MzZiOGI4MDkiLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwic3ViIjoiY2RmYmQyZmQtODk5MS00YjczLThmZmEtYzcxNTM2YjhiODA5IiwiaWF0IjoxNzcxMDU4MzE0LCJleHAiOjIwODIwOTgzMTR9.AukXaAriiGHGlwgEwRhleN2kzC0emcEoys7H3JG7PA4"


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


# Helper function to extract token
def get_auth_token(authorization: Optional[str] = None) -> str:
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return DEFAULT_TOKEN


# Proxy routes for Qwiky API
@api_router.get("/qwiky/bookings")
async def get_bookings(authorization: Optional[str] = Header(None)):
    """Proxy to fetch all bookings from Qwiky API"""
    token = get_auth_token(authorization)
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            response = await http_client.get(
                f"{QWIKY_BASE_URL}/admin/booking/hood/{DEFAULT_HOOD_ID}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/qwiky/user/{user_id}")
async def get_user_details(user_id: str, authorization: Optional[str] = Header(None)):
    """Proxy to fetch user details from Qwiky API"""
    token = get_auth_token(authorization)
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            response = await http_client.get(
                f"{QWIKY_BASE_URL}/user/{user_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/qwiky/booking/{booking_id}/cancel")
async def cancel_booking(booking_id: str, authorization: Optional[str] = Header(None)):
    """Proxy to cancel a booking via Qwiky API"""
    token = get_auth_token(authorization)
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            response = await http_client.post(
                f"{QWIKY_BASE_URL}/admin/booking/{booking_id}/cancel",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/qwiky/booking/{booking_id}/settled")
async def settle_booking(booking_id: str, authorization: Optional[str] = Header(None)):
    """Proxy to settle a booking via Qwiky API"""
    token = get_auth_token(authorization)
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            response = await http_client.post(
                f"{QWIKY_BASE_URL}/admin/booking/{booking_id}/settled",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Qwiky Admin API Proxy"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
