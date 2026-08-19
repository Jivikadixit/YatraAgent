from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.cognitive.planner import cognitive_planner
from app.cognitive.cultural_rag import cultural_rag
from app.cognitive.memory_engine import memory_engine
from app.mcp.flight_finder import flight_finder
from app.mcp.train_finder import train_finder
from app.mcp.bus_finder import bus_finder
from app.mcp.optimizer import transit_optimizer
from app.mcp.hotel_hold import hotel_hold_manager
from app.security.kms_service import kms_service
from app.analytics.bq_predictor import bq_predictor
from app.saga.orchestrator import saga_orchestrator

app = FastAPI(
    title="YatraAgent Serverless Agent Mesh",
    description="Culturally aware, autonomous travel planning and multi-modal booking platform on Google Cloud Stack",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Schemas
class PlanTripRequest(BaseModel):
    prompt: str = Field(..., example="4-day spiritual and culinary journey to Varanasi under ₹25,000 with Jain dietary food.")
    origin: str = "Delhi"
    destination: str = "Varanasi"
    duration_days: int = 3
    budget_inr: int = 25000
    dietary_preference: str = "Jain / Pure Veg"
    travelers: int = 2
    user_id: str = "demo_user_01"

class TransitSearchRequest(BaseModel):
    origin: str = "Delhi"
    destination: str = "Varanasi"
    travel_date: str = "2026-09-15"
    target_budget_inr: int = 15000

class HotelHoldRequest(BaseModel):
    hotel_id: str
    user_id: str = "demo_user_01"
    hotel_name: str
    room_type: str = "Heritage Deluxe"
    rate_inr: int = 4200
    duration_minutes: int = 10

class TokenizePIIRequest(BaseModel):
    id_type: str = "Aadhaar" # or "Passport"
    raw_id_value: str = "458912349876"
    passenger_name: str = "Aarav Sharma"

class SagaBookingRequest(BaseModel):
    user_id: str = "demo_user_01"
    trip_id: str
    hotel_id: Optional[str] = None
    hotel_name: Optional[str] = None
    transit_id: Optional[str] = None
    transit_type: Optional[str] = None
    transit_name: Optional[str] = None
    total_amount_inr: int
    kms_payment_token: str
    include_hotel: bool = False
    booking_type: str = "TRANSIT" # "HOTEL_ONLY", "TRANSIT", "COMBINED"
    simulate_failure_step: Optional[str] = None # 'HOTEL_HOLD', 'TRANSIT_RESERVE', 'PAYMENT_SETTLE'

@app.get("/")
def health_check():
    return {
        "service": "YatraAgent Agent Mesh",
        "status": "HEALTHY",
        "cloud_region": "asia-south1",
        "runtime": "Cloud Run Serverless Mesh"
    }

# 1. Cognitive Itinerary & Cultural RAG
@app.post("/api/plan-itinerary")
def plan_itinerary(req: PlanTripRequest):
    plan = cognitive_planner.plan_itinerary(
        prompt=req.prompt,
        origin=req.origin,
        destination=req.destination,
        duration_days=req.duration_days,
        budget_inr=req.budget_inr,
        dietary_pref=req.dietary_preference,
        traveler_count=req.travelers,
        user_id=req.user_id
    )
    # Record in 30-day episodic memory
    session = memory_engine.get_or_create_session(req.user_id)
    memory_engine.record_interaction(session["session_id"], req.prompt, plan.get("summary", ""))
    return plan

# 2. MCP Tools
@app.post("/api/mcp/transit/search")
def search_transit(req: TransitSearchRequest):
    return transit_optimizer.find_optimal_transit(
        origin=req.origin,
        destination=req.destination,
        travel_date=req.travel_date,
        target_budget_inr=req.target_budget_inr
    )

@app.post("/api/mcp/hotel/hold")
def hold_hotel(req: HotelHoldRequest):
    return hotel_hold_manager.create_soft_hold(
        hotel_id=req.hotel_id,
        user_id=req.user_id,
        hotel_name=req.hotel_name,
        room_type=req.room_type,
        rate_inr=req.rate_inr,
        duration_minutes=req.duration_minutes
    )

@app.get("/api/mcp/hotel/hold/{hold_token}")
def get_hotel_hold_status(hold_token: str):
    res = hotel_hold_manager.get_hold_status(hold_token)
    if not res:
        raise HTTPException(status_code=404, detail="Hold token not found")
    return res

# 3. Security & KMS
@app.post("/api/security/tokenize-pii")
def tokenize_passenger(req: TokenizePIIRequest):
    return kms_service.tokenize_passenger_id(
        id_type=req.id_type,
        raw_id_value=req.raw_id_value,
        passenger_name=req.passenger_name
    )

@app.post("/api/security/request-delegated-payment")
def request_payment_delegation(user_id: str = "demo_user_01", max_spend_limit_inr: int = 30000):
    return kms_service.generate_delegated_payment_token(
        user_id=user_id,
        max_spend_limit_inr=max_spend_limit_inr
    )

# 4. Distributed Saga Pattern Execution
@app.post("/api/saga/execute")
def execute_saga_booking(req: SagaBookingRequest):
    return saga_orchestrator.initiate_saga(
        user_id=req.user_id,
        trip_id=req.trip_id,
        hotel_id=req.hotel_id,
        hotel_name=req.hotel_name,
        transit_id=req.transit_id,
        transit_type=req.transit_type,
        transit_name=req.transit_name,
        total_amount_inr=req.total_amount_inr,
        kms_payment_token=req.kms_payment_token,
        include_hotel=req.include_hotel,
        booking_type=req.booking_type,
        simulate_failure_step=req.simulate_failure_step
    )

# 5. BigQuery ML Analytics & Prediction
@app.get("/api/analytics/predict-waitlist")
def predict_train_waitlist(train_number: str = "22436", travel_class: str = "CC", current_wl: int = 14, days_to_departure: int = 4):
    return bq_predictor.predict_waitlist_confirmation(
        train_number=train_number,
        travel_class=travel_class,
        current_waitlist_number=current_wl,
        days_to_departure=days_to_departure
    )

@app.get("/api/analytics/dynamic-fare-forecast")
def get_fare_forecast(route_id: str = "DEL-VNS-6E", base_fare: int = 4500):
    return bq_predictor.forecast_dynamic_fares(route_id=route_id, base_fare_inr=base_fare)

# 6. Episodic & Taste Memory Profile
@app.get("/api/memory/profile/{user_id}")
def get_user_memory_profile(user_id: str = "demo_user_01"):
    session = memory_engine.get_or_create_session(user_id)
    return session
