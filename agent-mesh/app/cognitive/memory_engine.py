import datetime
from typing import Dict, Any, List, Optional
import numpy as np

class MemoryEngine:
    """
    30-Day Sliding Window Episodic & Semantic Taste Vector Memory Engine
    Emulates Firestore TTL collections + AlloyDB pgvector taste embeddings.
    """
    def __init__(self):
        self._sessions_store: Dict[str, Dict[str, Any]] = {}
        self._user_profiles: Dict[str, Dict[str, Any]] = {
            "demo_user_01": {
                "user_id": "demo_user_01",
                "name": "Aarav Sharma",
                "dietary_profile": "Jain / Pure Veg",
                "budget_tier": "Value_Optimizer",
                "transit_preference": "Vande Bharat Express / 2A Train or Direct Flights",
                "cultural_strictness_score": 0.85,
                "taste_vector": [0.85, 0.90, 0.35, 0.80, 0.95, 0.70, 0.40, 0.88], # [veg_strictness, heritage_bias, luxury_bias, pace_relaxed, temple_affinity, transit_comfort, adventure_bias, culinary_curiosity]
                "past_trips": [
                    {
                        "destination": "Varanasi & Sarnath",
                        "date": "2026-05-10",
                        "satisfaction_rating": 4.9,
                        "notes": "Appreciated early morning Mangala Aarti passes and Sattvic Chaat guide."
                    }
                ],
                "saved_watchlists": [
                    {
                        "route": "DEL -> BSB",
                        "mode": "TRAIN",
                        "target_price_inr": 1800,
                        "alert_active": True
                    }
                ]
            }
        }

    def get_or_create_session(self, user_id: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = now + datetime.timedelta(days=30)
        
        sid = session_id or f"sess_{user_id}_{int(now.timestamp())}"
        if sid not in self._sessions_store:
            user_profile = self._user_profiles.get(user_id, {
                "user_id": user_id,
                "name": "Pilgrim Explorer",
                "dietary_profile": "Pure Vegetarian",
                "budget_tier": "Value_Optimizer",
                "transit_preference": "Train (2A/3A) & Direct Flight",
                "cultural_strictness_score": 0.75,
                "taste_vector": [0.80, 0.85, 0.50, 0.70, 0.80, 0.75, 0.30, 0.80],
                "past_trips": [],
                "saved_watchlists": []
            })
            self._sessions_store[sid] = {
                "session_id": sid,
                "user_id": user_id,
                "created_at": now.isoformat(),
                "expires_at": expires_at.isoformat(),
                "profile": user_profile,
                "interaction_history": [],
                "active_itinerary": None
            }
        return self._sessions_store[sid]

    def record_interaction(self, session_id: str, prompt: str, generated_plan_summary: str):
        if session_id in self._sessions_store:
            self._sessions_store[session_id]["interaction_history"].append({
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "prompt": prompt,
                "summary": generated_plan_summary
            })

    def get_user_taste_profile(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self._user_profiles:
            return self.get_or_create_session(user_id)["profile"]
        return self._user_profiles[user_id]

    def compute_taste_affinity_score(self, user_vector: List[float], destination_vector: List[float]) -> float:
        """Compute cosine similarity between user taste vector and candidate itinerary node"""
        u = np.array(user_vector)
        v = np.array(destination_vector)
        dot = np.dot(u, v)
        norm = (np.linalg.norm(u) * np.linalg.norm(v))
        if norm == 0:
            return 0.0
        return float(dot / norm)

memory_engine = MemoryEngine()
