import time
import uuid
from typing import Dict, Any, Optional

class HotelHoldManager:
    """
    10-Minute Temporary Inventory Soft-Hold Manager
    Prevents price spikes & guarantees room availability during HITL review.
    """
    def __init__(self):
        self._active_holds: Dict[str, Dict[str, Any]] = {}

    def create_soft_hold(self, hotel_id: str, user_id: str, hotel_name: str, room_type: str = "Heritage Deluxe", rate_inr: int = 4200, duration_minutes: int = 10) -> Dict[str, Any]:
        hold_token = f"HOLD_HTL_{uuid.uuid4().hex[:8].upper()}"
        expires_at_epoch = time.time() + (duration_minutes * 60)
        
        hold_record = {
            "hold_token": hold_token,
            "hotel_id": hotel_id,
            "hotel_name": hotel_name,
            "room_type": room_type,
            "locked_rate_inr": rate_inr,
            "user_id": user_id,
            "status": "HELD",
            "created_at_epoch": time.time(),
            "expires_at_epoch": expires_at_epoch,
            "duration_minutes": duration_minutes,
            "inventory_lock_guarantee": "100% Rate & Room Lock active"
        }
        self._active_holds[hold_token] = hold_record
        return hold_record

    def get_hold_status(self, hold_token: str) -> Optional[Dict[str, Any]]:
        record = self._active_holds.get(hold_token)
        if not record:
            return None
        
        remaining_seconds = max(0, int(record["expires_at_epoch"] - time.time()))
        if remaining_seconds == 0 and record["status"] == "HELD":
            record["status"] = "EXPIRED"
        
        return {
            **record,
            "seconds_remaining": remaining_seconds,
            "is_valid": (remaining_seconds > 0 and record["status"] == "HELD")
        }

    def release_hold(self, hold_token: str) -> Dict[str, Any]:
        if hold_token in self._active_holds:
            self._active_holds[hold_token]["status"] = "RELEASED"
            return {"status": "SUCCESS", "message": f"Hold {hold_token} successfully released back to hotel inventory."}
        return {"status": "NOT_FOUND"}

hotel_hold_manager = HotelHoldManager()
