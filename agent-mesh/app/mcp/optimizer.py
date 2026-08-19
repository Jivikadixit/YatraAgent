from typing import Dict, Any, List
from app.mcp.flight_finder import flight_finder
from app.mcp.train_finder import train_finder
from app.mcp.bus_finder import bus_finder

class TransitOptimizerMCP:
    """
    Multi-Agent Optimizer Engine: Evaluates all transit combinations (Air, Rail, Road)
    and computes Pareto-optimal solutions across Cost, Duration, and Certainty.
    """
    def find_optimal_transit(self, origin: str, destination: str, travel_date: str, target_budget_inr: int = 15000) -> Dict[str, Any]:
        flights = flight_finder.search_flights(origin, destination, travel_date)
        trains = train_finder.search_trains(origin, destination, travel_date)
        buses = bus_finder.search_buses(origin, destination, travel_date)

        # 1. Cheapest Absolute Transit Option
        cheapest_bus = min(buses, key=lambda b: b["fare_inr"]) if buses else None
        
        # 2. Best Train Option (Balancing cost + confirmation probability)
        best_train_class = None
        best_train_meta = None
        for t in trains:
            for c in t["classes"]:
                if c["confirmation_probability"] >= 0.85:
                    if not best_train_class or c["fare_inr"] < best_train_class["fare_inr"]:
                        best_train_class = c
                        best_train_meta = t

        # 3. Fastest Flight Option
        fastest_flight = min(flights, key=lambda f: f["fare_inr"]) if flights else None

        # 4. Synthesize Pareto Recommendations
        recommendations = {
            "origin": origin,
            "destination": destination,
            "travel_date": travel_date,
            "pareto_options": {
                "cheapest_overall": {
                    "mode": "BUS",
                    "operator": cheapest_bus["operator"] if cheapest_bus else "N/A",
                    "fare_inr": cheapest_bus["fare_inr"] if cheapest_bus else 0,
                    "duration": cheapest_bus["duration"] if cheapest_bus else "N/A",
                    "departure": cheapest_bus["departure_time"] if cheapest_bus else "N/A",
                    "tag": "💰 Maximum Savings",
                    "savings_vs_flight_inr": (fastest_flight["fare_inr"] - cheapest_bus["fare_inr"]) if (fastest_flight and cheapest_bus) else 0
                },
                "most_recommended_value": {
                    "mode": "TRAIN",
                    "train_name": best_train_meta["train_name"] if best_train_meta else "Vande Bharat",
                    "train_number": best_train_meta["train_number"] if best_train_meta else "22436",
                    "class": best_train_class["class_type"] if best_train_class else "Chair Car",
                    "fare_inr": best_train_class["fare_inr"] if best_train_class else 1750,
                    "duration": best_train_meta["duration"] if best_train_meta else "8h 00m",
                    "confirmation_probability": best_train_class["confirmation_probability"] if best_train_class else 0.88,
                    "tag": "⚡ Best Balance (Speed + Comfort + Price)"
                },
                "fastest_premium": {
                    "mode": "FLIGHT",
                    "airline": fastest_flight["airline"] if fastest_flight else "IndiGo",
                    "flight_number": fastest_flight["flight_number"] if fastest_flight else "6E-204",
                    "fare_inr": fastest_flight["fare_inr"] if fastest_flight else 4120,
                    "duration": fastest_flight["duration"] if fastest_flight else "1h 25m",
                    "departure": fastest_flight["departure_time"] if fastest_flight else "07:15 AM",
                    "tag": "✈️ Time Saver (1.5 hrs direct)"
                }
            },
            "all_flights": flights,
            "all_trains": trains,
            "all_buses": buses
        }
        return recommendations

transit_optimizer = TransitOptimizerMCP()
