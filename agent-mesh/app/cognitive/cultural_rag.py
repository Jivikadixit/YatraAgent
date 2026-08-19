import os
import json
from typing import List, Dict, Any, Optional

class CulturalRAGEngine:
    def __init__(self):
        self.base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "cultural-data")
        self.temples_data = self._load_json("temples_dress_codes.json")
        self.culinary_data = self._load_json("culinary_heritage.json")
        self.vibes_data = self._load_json("destination_vibes.json")

    def _load_json(self, filename: str) -> Dict[str, Any]:
        file_path = os.path.join(self.base_path, filename)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def query_temple_rules(self, destination: str) -> List[Dict[str, Any]]:
        results = []
        dest_lower = destination.lower()
        temples = self.temples_data.get("temples", [])
        for temple in temples:
            city_match = temple.get("city", "").lower() in dest_lower or dest_lower in temple.get("city", "").lower()
            name_match = temple.get("name", "").lower() in dest_lower or dest_lower in temple.get("name", "").lower()
            id_match = temple.get("id", "").lower() in dest_lower
            if city_match or name_match or id_match:
                results.append(temple)
        return results

    def query_culinary_recommendations(self, destination: str, dietary_preference: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        dest_lower = destination.lower()
        cuisines = self.culinary_data.get("cuisines", [])
        
        # Match only regions that belong to the queried destination
        matched_regions = []
        for item in cuisines:
            keywords = item.get("city_keywords", [])
            region_name = item.get("region", "").lower()
            item_id = item.get("id", "").lower()
            
            # Check if this region matches the destination
            is_match = (
                item_id in dest_lower or
                any(kw in dest_lower for kw in keywords) or
                any(dest_part in region_name for dest_part in dest_lower.split())
            )
            
            if is_match:
                matched_regions.append(item)

        # Fallback if specific city keyword not found: default to the closest or first available
        if not matched_regions and cuisines:
            for item in cuisines:
                if any(kw in dest_lower for kw in item.get("city_keywords", [])):
                    matched_regions.append(item)
            if not matched_regions:
                # If completely custom destination, pick the most relevant
                matched_regions = [cuisines[0]]

        for item in matched_regions:
            matched_dishes = []
            for dish in item.get("iconic_dishes", []):
                # Filter based on dietary restrictions
                if dietary_preference:
                    diet_pref_lower = dietary_preference.lower()
                    
                    # Jain rule: must be jain_customizable and vegetarian
                    if "jain" in diet_pref_lower:
                        if not dish.get("jain_customizable", False) or not dish.get("is_vegetarian", True):
                            continue
                    
                    # Sattvic / Pure Veg / South Indian Veg: exclude non-veg
                    elif any(v in diet_pref_lower for v in ["veg", "sattvic"]):
                        if not dish.get("is_vegetarian", True):
                            continue
                
                matched_dishes.append(dish)
            
            if matched_dishes:
                results.append({
                    "id": item.get("id"),
                    "region": item.get("region"),
                    "tradition": item.get("culinary_tradition"),
                    "dietary_attributes": item.get("dietary_attributes"),
                    "dishes": matched_dishes
                })
        return results

    def query_destination_context(self, destination: str) -> Optional[Dict[str, Any]]:
        dest_lower = destination.lower()
        for dest in self.vibes_data.get("destinations", []):
            if (dest.get("id", "").lower() in dest_lower or 
                dest.get("name", "").lower() in dest_lower or
                dest_lower in dest.get("name", "").lower()):
                return dest
        return None

cultural_rag = CulturalRAGEngine()
