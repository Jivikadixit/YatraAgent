from typing import List, Dict, Any

class BusFinderMCP:
    """
    MCP Wrapper for redBus / AbhiBus Intercity Coach Gateway
    """
    def search_buses(self, origin: str, destination: str, travel_date: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": "bus_intrcity_01",
                "operator": "IntrCity SmartBus (Lounge Access)",
                "bus_type": "Bharat Benz AC Sleeper (2+1)",
                "departure_time": "09:30 PM",
                "arrival_time": "07:30 AM (Next Day)",
                "duration": "10h 00m",
                "fare_inr": 1150,
                "rating": 4.8,
                "amenities": ["Air Purification", "Charging Point", "Water Bottle", "Blanket", "GPS Live Track"],
                "seats_available": 14,
                "pickup_point": "Kashmere Gate / ISBT Counter 12"
            },
            {
                "id": "bus_zing_02",
                "operator": "Zingbus Electric Premium",
                "bus_type": "Volvo 9600 Multi-Axle Semi-Sleeper",
                "departure_time": "10:15 PM",
                "arrival_time": "08:15 AM (Next Day)",
                "duration": "10h 00m",
                "fare_inr": 980,
                "rating": 4.6,
                "amenities": ["Emergency SOS", "USB Charging", "Zero Emission EV"],
                "seats_available": 8,
                "pickup_point": "Akshardham Metro Station"
            },
            {
                "id": "bus_upsrtc_03",
                "operator": "UPSRTC Royal Cruiser",
                "bus_type": "Scania Multi-Axle AC Executive",
                "departure_time": "07:00 PM",
                "arrival_time": "05:30 AM (Next Day)",
                "duration": "10h 30m",
                "fare_inr": 1320,
                "rating": 4.3,
                "amenities": ["Govt Verified Driver", "Mineral Water"],
                "seats_available": 21,
                "pickup_point": "Anand Vihar ISBT"
            }
        ]

bus_finder = BusFinderMCP()
