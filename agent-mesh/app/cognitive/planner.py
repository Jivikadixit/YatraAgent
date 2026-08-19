import json
import re
from typing import Dict, Any, List, Optional
from app.cognitive.cultural_rag import cultural_rag
from app.cognitive.memory_engine import memory_engine
from app.config import settings

class CognitivePlanner:
    """
    Cognitive Travel & Cultural Itinerary Planner powered by Gemini 2.5 Flash / Pro
    and Grounded with Curated Cultural RAG datasets.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    def plan_itinerary(self, 
                       prompt: str, 
                       origin: str = "Delhi", 
                       destination: str = "Varanasi", 
                       duration_days: int = 3, 
                       budget_inr: int = 25000, 
                       dietary_pref: str = "Jain / Pure Veg", 
                       traveler_count: int = 2,
                       user_id: str = "demo_user_01") -> Dict[str, Any]:
        
        # 1. Fetch Episodic Memory & Taste Vector
        user_profile = memory_engine.get_user_taste_profile(user_id)
        
        # 2. Query RAG context for cultural rules & regional cuisine accurately matched
        temple_rules = cultural_rag.query_temple_rules(destination)
        culinary_picks = cultural_rag.query_culinary_recommendations(destination, dietary_pref)
        dest_context = cultural_rag.query_destination_context(destination)
        
        # 3. Generate structured itinerary
        # Check if Gemini API client is configured
        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                system_prompt = f"""
                You are YatraAgent, an elite cultural and multi-modal travel planner for India.
                Generate a highly structured JSON travel plan matching the user's requirements.
                Destination: {destination} (from {origin})
                Duration: {duration_days} days
                Budget: ₹{budget_inr}
                Dietary Preference: {dietary_pref}
                Travelers: {traveler_count}
                User Profile Strictness: {user_profile.get('cultural_strictness_score', 0.8)}
                
                Cultural context: {json.dumps(temple_rules)}
                Culinary context: {json.dumps(culinary_picks)}
                """
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[system_prompt, prompt]
                )
                raw_text = response.text
                json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(0))
            except Exception as e:
                print(f"Gemini API fallback to deterministic synthesizer: {e}")

        # 4. Deterministic Rich Synthesizer (Fast, Resilient, Zero-Latency)
        return self._synthesize_rich_itinerary(
            prompt=prompt,
            origin=origin,
            destination=destination,
            duration_days=duration_days,
            budget_inr=budget_inr,
            dietary_pref=dietary_pref,
            traveler_count=traveler_count,
            temple_rules=temple_rules,
            culinary_picks=culinary_picks,
            dest_context=dest_context,
            user_profile=user_profile
        )

    def _synthesize_rich_itinerary(self,
                                   prompt: str,
                                   origin: str,
                                   destination: str,
                                   duration_days: int,
                                   budget_inr: int,
                                   dietary_pref: str,
                                   traveler_count: int,
                                   temple_rules: List[Dict[str, Any]],
                                   culinary_picks: List[Dict[str, Any]],
                                   dest_context: Optional[Dict[str, Any]],
                                   user_profile: Dict[str, Any]) -> Dict[str, Any]:
        
        dest_lower = destination.lower()
        is_varanasi = any(k in dest_lower for k in ["varanasi", "kashi", "banaras", "sarnath"])
        is_madurai = any(k in dest_lower for k in ["madurai", "meenakshi", "chettinad"])
        is_rameshwaram = any(k in dest_lower for k in ["rameshwaram", "rameswaram", "dhanushkodi"])
        is_amritsar = any(k in dest_lower for k in ["amritsar", "golden temple", "punjab"])
        is_tirupati = any(k in dest_lower for k in ["tirupati", "tirumala", "balaji"])
        is_kerala = any(k in dest_lower for k in ["kerala", "trivandrum", "padmanabhaswamy"])

        # Extract available dishes for daily meal insertion
        available_dishes = []
        for pick in culinary_picks:
            for d in pick.get("dishes", []):
                available_dishes.append(d)

        def get_dish_name(idx: int, default: str) -> str:
            if idx < len(available_dishes):
                return available_dishes[idx]["name"]
            return default

        # Build Day-by-Day schedule
        days = []
        for d in range(1, duration_days + 1):
            if is_varanasi:
                if d == 1:
                    day_title = "Sacred River Arrival & Ganga Aarti at Dashashwamedh"
                    slots = [
                        {"time": "06:30 AM", "activity": "Early Morning Sunrise Boat Ride on Ganges (Assi to Manikarnika Ghat)", "type": "spiritual", "vibe": "Serene"},
                        {"time": "08:30 AM", "activity": f"Traditional Morning Breakfast: {get_dish_name(0, 'Banarasi Tamatar Chaat & Poori')} ({dietary_pref} compliant)", "type": "culinary", "location": "Godowlia Chowk"},
                        {"time": "10:30 AM", "activity": "Kashi Vishwanath Corridor & Sparsh Darshan (Strict Dhoti/Saree protocol)", "type": "cultural_sanctum", "alert": "No leather belts/wallets or mobile phones permitted inside sanctum"},
                        {"time": "06:30 PM", "activity": "Grand Evening Ganga Maha Aarti from reserved VIP Bajra boat", "type": "spiritual_highlight", "vibe": "Awe-inspiring"}
                    ]
                elif d == 2:
                    day_title = "Ancient Sarnath Heritage & Silk Weavers Guild"
                    slots = [
                        {"time": "08:00 AM", "activity": "Excursion to Sarnath Dhamek Stupa & Archaeological Museum (Ashoka Pillar)", "type": "heritage"},
                        {"time": "01:00 PM", "activity": f"Authentic Sattvic Lunch: {get_dish_name(2, 'Banarasi Sattvic Thali')} adhering to {dietary_pref}", "type": "culinary"},
                        {"time": "04:00 PM", "activity": "Banarasi Handloom Silk Weavers Colony walkthrough in Madanpura", "type": "cultural_craft"},
                        {"time": "08:30 PM", "activity": f"Dessert Experience: Famous {get_dish_name(1, 'Malaiyyo (Makhan Malai)')} at Thatheri Bazar", "type": "culinary"}
                    ]
                else:
                    day_title = "Hidden Ghats, Akhada Culture & Departure"
                    slots = [
                        {"time": "06:00 AM", "activity": "Traditional Tulsi Akhada wrestling & Vedic Yoga session on Tulsi Ghat", "type": "culture"},
                        {"time": "10:00 AM", "activity": "Sankat Mochan Temple & Kal Bhairav Temple visit", "type": "spiritual"},
                        {"time": "03:00 PM", "activity": "Procure GI-tagged Banarasi sweetmeats and wooden crafts before departure", "type": "shopping"}
                    ]
            elif is_madurai or is_rameshwaram:
                if d == 1:
                    day_title = "Meenakshi Sundareswarar Grand Darshan & Hall of Thousand Pillars"
                    slots = [
                        {"time": "06:00 AM", "activity": "Meenakshi Amman East Tower Entry (Barefoot, Dhoti/Saree mandatory)", "type": "cultural_sanctum", "alert": "Mobile phones strictly banned by court order in temple corridor"},
                        {"time": "09:00 AM", "activity": f"Iconic Breakfast: {get_dish_name(1, 'Murugan Ghee Podi Idli & Vadai')} at West Masi St", "type": "culinary"},
                        {"time": "02:00 PM", "activity": "Thirumalai Nayakkar Palace Light & Sound Architecture Walk", "type": "heritage"},
                        {"time": "07:30 PM", "activity": f"Cooling Refreshment: Famous {get_dish_name(0, 'Madurai Famous Jigarthanda')}", "type": "culinary"}
                    ]
                elif d == 2:
                    day_title = "Pamban Sea Bridge Crossing & Rameshwaram Theerthams"
                    slots = [
                        {"time": "06:30 AM", "activity": "Scenic Coastal Transit across Pamban Sea Bridge to Rameshwaram Island", "type": "transit_scenic"},
                        {"time": "10:30 AM", "activity": "22 Sacred Theertham Wells Snanam followed by Ramanathaswamy Darshan", "type": "cultural_sanctum", "alert": "Change of dry traditional clothing required after theertham bath"},
                        {"time": "01:30 PM", "activity": f"Sacred Lunch: {get_dish_name(0, 'Traditional South Indian Brahmin Meals')} on Banana Leaf", "type": "culinary"},
                        {"time": "04:30 PM", "activity": "Dhanushkodi Land's End & Ghost Town coastal drive", "type": "nature"}
                    ]
                else:
                    day_title = "Heritage Temple Corridor Walk & Spice Market"
                    slots = [
                        {"time": "07:00 AM", "activity": "Kalam National Memorial & Coastal Heritage exploration", "type": "heritage"},
                        {"time": "12:30 PM", "activity": f"Traditional Lunch: {get_dish_name(2, 'Chettinad Saiva Sapadu')} ({dietary_pref})", "type": "culinary"}
                    ]
            elif is_amritsar:
                if d == 1:
                    day_title = "Harmandir Sahib Devotion & Sacred Langar"
                    slots = [
                        {"time": "05:00 AM", "activity": "Palki Sahib ceremony at Golden Temple (Head covered with Rumal)", "type": "spiritual"},
                        {"time": "08:30 AM", "activity": f"Iconic Breakfast: {get_dish_name(1, 'Amritsari Stuffed Kulcha & Chole')}", "type": "culinary"},
                        {"time": "12:30 PM", "activity": f"Sacred Community Feast: {get_dish_name(0, 'Guru Ka Langar Mah Di Dal & Kheer')}", "type": "culinary"},
                        {"time": "04:30 PM", "activity": "Wagah Border Beating Retreat Ceremony", "type": "heritage"}
                    ]
                else:
                    day_title = "Jallianwala Bagh & Historic Bazar Gastronomy"
                    slots = [
                        {"time": "09:00 AM", "activity": "Jallianwala Bagh Memorial & Partition Museum walkthrough", "type": "heritage"},
                        {"time": "01:00 PM", "activity": f"Century-old Lunch: {get_dish_name(2, 'Kesar Da Dhaba Kali Dal & Firni')}", "type": "culinary"}
                    ]
            else:
                day_title = f"{destination} Cultural Exploration (Day {d})"
                slots = [
                    {"time": "08:00 AM", "activity": f"Morning sacred darshan and heritage walk in {destination}", "type": "heritage"},
                    {"time": "01:00 PM", "activity": f"Regional Specialty Lunch: {get_dish_name(0, 'Traditional Regional Thali')} compliant with {dietary_pref}", "type": "culinary"},
                    {"time": "05:30 PM", "activity": "Sunset cultural bazaar & evening Aarti ceremony", "type": "cultural_highlight"}
                ]

            days.append({
                "day_number": d,
                "title": day_title,
                "schedule": slots
            })

        # Hotels matched
        hotels = [
            {
                "hotel_id": f"htl_{destination.lower()[:3]}_01",
                "name": f"Taj Ganges & Heritage Retreat" if is_varanasi else f"Heritage Madurai Palace & Spa" if is_madurai else f"Grand Heritage {destination}",
                "category": "Heritage Premium",
                "rating": 4.85,
                "price_per_night_inr": int(budget_inr * 0.35 / duration_days),
                "distance_to_core_temple": "1.2 km",
                "amenities": ["Sattvic/Pure Veg Kitchen", "Temple Shuttle", "Ayurvedic Spa", "Free High-Speed Wi-Fi"],
                "soft_hold_available": True
            },
            {
                "hotel_id": f"htl_{destination.lower()[:3]}_02",
                "name": f"BrijRama Palace Heritage Ghat" if is_varanasi else f"Regency Madurai by GRT" if is_madurai else f"Comfort Residency {destination}",
                "category": "Value Boutique",
                "rating": 4.70,
                "price_per_night_inr": int(budget_inr * 0.22 / duration_days),
                "distance_to_core_temple": "0.4 km",
                "amenities": ["Direct River/Sanctum View", "Jain Meal Option", "Cultural Evening Sitar Recitals"],
                "soft_hold_available": True
            }
        ]

        # Transit route graph
        route_graph = [
            {"from": origin, "to": destination, "mode": "VANDE_BHARAT / FLIGHT", "distance_km": 780, "est_time_hrs": "4.5h flight / 8h train"},
            {"from": f"{destination} Hub", "to": "Ghats / Main Sanctum", "mode": "E-RICKSHAW / HERITAGE SHUTTLE", "distance_km": 4.5, "est_time_hrs": "20 mins"},
            {"from": "Inner Corridor", "to": "Cultural Enclave", "mode": "PEDESTRIAN WALKWAY", "distance_km": 1.2, "est_time_hrs": "15 mins"}
        ]

        return {
            "trip_id": f"yatra_{destination.lower()[:3]}_{duration_days}d",
            "summary": f"Culturally immersive {duration_days}-day pilgrimage & culinary journey from {origin} to {destination} tailored for {traveler_count} travelers ({dietary_pref}).",
            "destination": destination,
            "origin": origin,
            "duration_days": duration_days,
            "total_budget_inr": budget_inr,
            "dietary_preference": dietary_pref,
            "travelers": traveler_count,
            "attire_and_cultural_guidelines": temple_rules,
            "culinary_guide": culinary_picks,
            "climate_and_vibe": dest_context,
            "route_graph": route_graph,
            "daily_itinerary": days,
            "recommended_hotels": hotels,
            "estimated_cost_breakdown": {
                "transit_inr": int(budget_inr * 0.40),
                "accommodation_inr": int(budget_inr * 0.35),
                "food_and_experiences_inr": int(budget_inr * 0.20),
                "buffer_inr": int(budget_inr * 0.05)
            }
        }

cognitive_planner = CognitivePlanner()
