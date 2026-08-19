import time
import uuid
import random
from typing import Dict, Any, Optional
from app.mcp.hotel_hold import hotel_hold_manager
from app.security.kms_service import kms_service
from app.saga.compensator import saga_compensator

class BookingSagaOrchestrator:
    """
    Distributed Saga Pattern Coordinator for Autonomous Travel Bookings.
    Supports:
      1. Standalone Hotel Bookings (Heritage Stays & Soft Hold)
      2. Standalone Transit Bookings (Flight, Train, Bus)
      3. Combined Multi-Leg Bookings
    """
    def __init__(self):
        self._saga_registry: Dict[str, Dict[str, Any]] = {}

    def initiate_saga(self, 
                      user_id: str, 
                      trip_id: str, 
                      hotel_id: Optional[str], 
                      hotel_name: Optional[str], 
                      transit_id: Optional[str], 
                      transit_type: Optional[str], 
                      transit_name: Optional[str], 
                      total_amount_inr: int, 
                      kms_payment_token: str,
                      include_hotel: bool = False,
                      booking_type: str = "TRANSIT", # "HOTEL_ONLY", "TRANSIT", "COMBINED"
                      simulate_failure_step: Optional[str] = None) -> Dict[str, Any]:
        
        saga_id = f"SAGA_{uuid.uuid4().hex[:10].upper()}"
        
        is_hotel_only = booking_type == "HOTEL_ONLY" or (hotel_id and not transit_id) or (transit_type == "HOTEL_ONLY")
        
        saga_state = {
            "saga_id": saga_id,
            "user_id": user_id,
            "trip_id": trip_id,
            "status": "IN_PROGRESS",
            "booking_type": "HOTEL_ONLY" if is_hotel_only else ("COMBINED" if include_hotel else "TRANSIT_ONLY"),
            "transit_type": transit_type if not is_hotel_only else None,
            "transit_name": transit_name if not is_hotel_only else None,
            "hotel_id": hotel_id,
            "hotel_name": hotel_name,
            "total_amount_inr": total_amount_inr,
            "created_at": time.time(),
            "hotel_held": False,
            "transit_reserved": False,
            "payment_captured": False,
            "steps_executed": [],
            "tokens": {}
        }
        self._saga_registry[saga_id] = saga_state
        step_counter = 1

        # CASE 1: STANDALONE HOTEL BOOKING
        if is_hotel_only:
            if simulate_failure_step == "HOTEL_HOLD":
                return saga_compensator.execute_compensation(saga_state, f"Rooms at {hotel_name} sold out.")

            hotel_confirm_code = f"HTL_CONF_{uuid.uuid4().hex[:6].upper()}"
            saga_state["hotel_confirmation_code"] = hotel_confirm_code
            saga_state["hotel_held"] = True
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "HOTEL_ROOM_LOCK",
                "status": "SUCCESS",
                "details": f"Heritage suite locked at {hotel_name}."
            })
            step_counter += 1

            # Settle Payment
            settlement = kms_service.settle_tokenized_payment(
                payment_token=kms_payment_token,
                amount_inr=total_amount_inr,
                merchant_ref=f"Yatra_{saga_id}"
            )
            saga_state["payment_captured"] = True
            saga_state["transaction_id"] = settlement["transaction_id"]
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "KMS_PAYMENT_SETTLEMENT",
                "status": "SUCCESS",
                "txn_id": settlement["transaction_id"],
                "details": f"₹{total_amount_inr} settled via OTP authorization for {hotel_name} stay."
            })
            step_counter += 1

            # Issue Hotel Voucher
            saga_state["status"] = "CONFIRMED_SUCCESS"
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "HOTEL_VOUCHER_ISSUANCE",
                "status": "SUCCESS",
                "details": f"Official digital hotel voucher generated: {hotel_confirm_code} at {hotel_name}."
            })
            saga_state["completed_at"] = time.time()
            return saga_state

        # CASE 2: TRANSIT (AND OPTIONAL HOTEL)
        if include_hotel and hotel_id and hotel_name:
            if simulate_failure_step == "HOTEL_HOLD":
                return saga_compensator.execute_compensation(saga_state, "Hotel inventory exhausted during hold attempt.")
            
            hotel_hold = hotel_hold_manager.create_soft_hold(
                hotel_id=hotel_id,
                user_id=user_id,
                hotel_name=hotel_name,
                rate_inr=int(total_amount_inr * 0.45)
            )
            saga_state["hotel_held"] = True
            saga_state["hotel_hold_token"] = hotel_hold["hold_token"]
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "HOTEL_SOFT_HOLD",
                "status": "SUCCESS",
                "token": hotel_hold["hold_token"],
                "details": f"10-min inventory lock secured at {hotel_name}."
            })
            step_counter += 1

        # Reserve Transit
        if simulate_failure_step == "TRANSIT_RESERVE":
            return saga_compensator.execute_compensation(saga_state, f"Seats on {transit_name} suddenly sold out during GDS lock.")
        
        is_flight = transit_type and (transit_type.upper() == "FLIGHT" or "flight" in transit_name.lower() or any(a in transit_name.lower() for a in ["indigo", "air india", "akasa", "spicejet", "6e", "ai", "qp"]))
        
        if is_flight:
            airline_code = "6E" if "indigo" in transit_name.lower() or "6e" in transit_name.lower() else ("AI" if "air india" in transit_name.lower() else "QP")
            transit_pnr = f"{airline_code}-{uuid.uuid4().hex[:6].upper()}"
            eticket_no = f"ETKT-098-{random.randint(100000000, 999999999)}"
            seat_no = f"{random.randint(4, 28)}{random.choice(['A', 'C', 'D', 'F'])}"
            terminal = "T3 Terminal (Gate 14B)" if airline_code == "AI" else "T2 Terminal (Gate 08A)"
            
            saga_state["transit_pnr"] = transit_pnr
            saga_state["flight_details"] = {
                "pnr": transit_pnr,
                "eticket_number": eticket_no,
                "seat_assignment": f"{seat_no} (Auto-Checked In)",
                "terminal": terminal,
                "baggage_allowance": "15 kg Check-in + 7 kg Cabin",
                "airline_gds": "Amadeus / Google Flights GDS Rail",
                "boarding_pass_status": "READY_FOR_DOWNLOAD"
            }
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "AUTONOMOUS_FLIGHT_BOOKING",
                "status": "SUCCESS",
                "pnr": transit_pnr,
                "details": f"Flight seat confirmed on {transit_name}. E-Ticket: {eticket_no}, Seat: {seat_no}."
            })
        else:
            transit_pnr = f"PNR_{transit_type[:2].upper() if transit_type else 'TR'}_{uuid.uuid4().hex[:6].upper()}"
            saga_state["transit_pnr"] = transit_pnr
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "TRANSIT_SEAT_RESERVATION",
                "status": "SUCCESS",
                "pnr": transit_pnr,
                "details": f"Reserved confirmed seat on {transit_name} ({transit_type})."
            })
        
        saga_state["transit_reserved"] = True
        step_counter += 1

        # Settle Payment
        if simulate_failure_step == "PAYMENT_SETTLE":
            return saga_compensator.execute_compensation(saga_state, "Cloud KMS payment token rejected by issuing bank.")
        
        settlement = kms_service.settle_tokenized_payment(
            payment_token=kms_payment_token,
            amount_inr=total_amount_inr,
            merchant_ref=f"Yatra_{saga_id}"
        )
        saga_state["payment_captured"] = True
        saga_state["transaction_id"] = settlement["transaction_id"]
        saga_state["steps_executed"].append({
            "step": step_counter,
            "action": "KMS_PAYMENT_SETTLEMENT",
            "status": "SUCCESS",
            "txn_id": settlement["transaction_id"],
            "details": f"₹{total_amount_inr} securely settled via OTP authorization."
        })
        step_counter += 1

        # Final Confirmation
        saga_state["status"] = "CONFIRMED_SUCCESS"
        if include_hotel and hotel_id:
            hotel_confirm_code = f"HTL_CONF_{uuid.uuid4().hex[:6].upper()}"
            saga_state["hotel_confirmation_code"] = hotel_confirm_code
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "TICKET_ISSUANCE",
                "status": "SUCCESS",
                "details": f"All vouchers issued: {transit_name} PNR {transit_pnr}, Hotel Voucher {hotel_confirm_code}."
            })
        else:
            saga_state["steps_executed"].append({
                "step": step_counter,
                "action": "TICKET_ISSUANCE",
                "status": "SUCCESS",
                "details": f"E-Ticket and boarding confirmation issued: {transit_name} PNR {transit_pnr}."
            })
            
        saga_state["completed_at"] = time.time()
        return saga_state

    def get_saga_state(self, saga_id: str) -> Optional[Dict[str, Any]]:
        return self._saga_registry.get(saga_id)

saga_orchestrator = BookingSagaOrchestrator()
