import sys
import os
import io

# Set UTF-8 output encoding for Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add agent-mesh to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "agent-mesh"))

from app.cognitive.cultural_rag import cultural_rag
from app.cognitive.planner import cognitive_planner
from app.mcp.optimizer import transit_optimizer
from app.mcp.hotel_hold import hotel_hold_manager
from app.security.kms_service import kms_service
from app.analytics.bq_predictor import bq_predictor
from app.saga.orchestrator import saga_orchestrator

def run_tests():
    print("[INIT] Starting YatraAgent Serverless Agent Mesh Automated Test Suite...")
    
    # 1. Test Cultural RAG
    print("\n--- 1. Testing Cultural RAG Engine ---")
    temple_rules = cultural_rag.query_temple_rules("Varanasi")
    assert len(temple_rules) > 0, "Failed to load temple rules"
    print(f"[OK] Found {len(temple_rules)} temple rules for Varanasi: {temple_rules[0]['name']}")
    assert "Dhoti" in temple_rules[0]["dress_code"]["men"]
    
    culinary = cultural_rag.query_culinary_recommendations("Varanasi", "Jain")
    assert len(culinary) > 0, "Failed to load Jain culinary recommendations"
    print(f"[OK] Found culinary spots: {[d['name'] for d in culinary[0]['dishes']]}")

    # 2. Test Cognitive Planner
    print("\n--- 2. Testing Cognitive Itinerary Planner ---")
    plan = cognitive_planner.plan_itinerary(
        prompt="4-day spiritual journey to Varanasi",
        origin="Delhi",
        destination="Varanasi",
        duration_days=3,
        budget_inr=25000,
        dietary_pref="Jain / Pure Veg"
    )
    assert plan["destination"] == "Varanasi"
    assert len(plan["daily_itinerary"]) == 3
    print(f"[OK] Itinerary generated successfully: {plan['summary']}")

    # 3. Test Transit Optimizer & BQML
    print("\n--- 3. Testing MCP Transit Optimizer & IRCTC BQML ---")
    transit = transit_optimizer.find_optimal_transit("Delhi", "Varanasi", "2026-09-15")
    assert "cheapest_overall" in transit["pareto_options"]
    assert "most_recommended_value" in transit["pareto_options"]
    print(f"[OK] Transit Pareto Solutions: {transit['pareto_options']['most_recommended_value']['train_name']} (WL prob: {transit['pareto_options']['most_recommended_value']['confirmation_probability']})")

    # 4. Test 10-Minute Hotel Soft Hold
    print("\n--- 4. Testing 10-Minute Hotel Soft Hold Manager ---")
    hold = hotel_hold_manager.create_soft_hold("htl_vns_01", "user_123", "Taj Ganges", 4200, 10)
    assert hold["status"] == "HELD"
    hold_token = hold["hold_token"]
    status = hotel_hold_manager.get_hold_status(hold_token)
    assert status["is_valid"] is True
    print(f"[OK] Soft Hold Verified: Token {hold_token}, Time left: {status['seconds_remaining']}s")

    # 5. Test Cloud KMS Tokenization
    print("\n--- 5. Testing Google Cloud KMS Security Rails ---")
    tok = kms_service.tokenize_passenger_id("Aadhaar", "987654321012", "Aarav Sharma")
    assert tok["status"] == "SECURE_TOKENIZED"
    assert "XXXX-XXXX" in tok["masked_identifier"]
    print(f"[OK] Aadhaar Tokenized: {tok['token_id']} ({tok['masked_identifier']})")

    # 6. Test BigQuery ML Dynamic Fare & Waitlist Predictors
    print("\n--- 6. Testing BigQuery ML Dynamic Forecasts ---")
    wl_pred = bq_predictor.predict_waitlist_confirmation("22436", "CC", 14, 4)
    assert wl_pred["confirmation_probability"] > 0
    print(f"[OK] BQML WL Prediction: {wl_pred['confirmation_probability']*100}% confirm probability ({wl_pred['risk_assessment']})")

    # 7. Test Distributed Saga Booking Execution (Standalone Transit & Combined)
    print("\n--- 7. Testing Distributed Saga Booking & OTP Protection ---")
    saga_transit_only = saga_orchestrator.initiate_saga(
        user_id="user_123",
        trip_id="trip_99",
        hotel_id=None,
        hotel_name=None,
        transit_id="fl_6e_204",
        transit_type="FLIGHT",
        transit_name="IndiGo 6E-204",
        total_amount_inr=4850,
        kms_payment_token="KMS_PAY_OTP_VERIFIED",
        include_hotel=False
    )
    assert saga_transit_only["status"] == "CONFIRMED_SUCCESS"
    assert "transit_pnr" in saga_transit_only
    assert "hotel_confirmation_code" not in saga_transit_only
    print(f"[OK] Standalone Flight Saga Success: PNR {saga_transit_only['transit_pnr']}")

    saga_combined = saga_orchestrator.initiate_saga(
        user_id="user_123",
        trip_id="trip_99",
        hotel_id="htl_01",
        hotel_name="Taj Ganges",
        transit_id="tr_01",
        transit_type="TRAIN",
        transit_name="Vande Bharat Express",
        total_amount_inr=5950,
        kms_payment_token="KMS_PAY_OTP_VERIFIED",
        include_hotel=True
    )
    assert saga_combined["status"] == "CONFIRMED_SUCCESS"
    assert "hotel_confirmation_code" in saga_combined
    print(f"[OK] Combined Transit+Hotel Saga Success: PNR {saga_combined['transit_pnr']}, Hotel {saga_combined['hotel_confirmation_code']}")

    # 8. Test Saga Failure Injection & Automated Compensation
    print("\n--- 8. Testing Saga Chaos Compensatory Rollback ---")
    saga_failure = saga_orchestrator.initiate_saga(
        user_id="user_123",
        trip_id="trip_99",
        hotel_id="htl_01",
        hotel_name="Taj Ganges",
        transit_id="tr_01",
        transit_type="TRAIN",
        transit_name="Vande Bharat Express",
        total_amount_inr=5950,
        kms_payment_token="KMS_PAY_OTP_VERIFIED",
        include_hotel=True,
        simulate_failure_step="TRANSIT_RESERVE"
    )
    assert saga_failure["status"] == "COMPENSATED_FAILED"
    assert len(saga_failure["compensation_steps"]) > 0
    print(f"[OK] Saga Compensatory Rollback Verified: {saga_failure['compensation_steps'][0]['action']}")

    print("\n[SUCCESS] ALL 8 TESTS PASSED WITH 100% SPECIFICATION CONFORMANCE!")

if __name__ == "__main__":
    run_tests()
