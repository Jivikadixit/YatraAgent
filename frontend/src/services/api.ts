const API_BASE = "http://localhost:8000";

export interface PlanTripParams {
  prompt: string;
  origin: string;
  destination: string;
  duration_days: number;
  budget_inr: number;
  dietary_preference: string;
  travelers: number;
  user_id?: string;
}

export const api = {
  async planItinerary(params: PlanTripParams) {
    try {
      const res = await fetch(`${API_BASE}/api/plan-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("Falling back to local client execution for plan:", e);
      return null;
    }
  },

  async searchTransit(origin: string, destination: string, travelDate: string, targetBudget: number) {
    try {
      const res = await fetch(`${API_BASE}/api/mcp/transit/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          travel_date: travelDate,
          target_budget_inr: targetBudget
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("Transit API fallback:", e);
      return null;
    }
  },

  async holdHotel(hotelId: string, hotelName: string, rateInr: number) {
    try {
      const res = await fetch(`${API_BASE}/api/mcp/hotel/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_id: hotelId,
          hotel_name: hotelName,
          rate_inr: rateInr,
          duration_minutes: 10
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("Hotel Hold API fallback:", e);
      return null;
    }
  },

  async executeSagaBooking(payload: {
    trip_id: string;
    hotel_id: string;
    hotel_name: string;
    transit_id: string;
    transit_type: string;
    transit_name: string;
    total_amount_inr: number;
    kms_payment_token: string;
    simulate_failure_step?: string | null;
  }) {
    try {
      const res = await fetch(`${API_BASE}/api/saga/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn("Saga Booking API fallback:", e);
      return null;
    }
  },

  async getMemoryProfile(userId: string = "demo_user_01") {
    try {
      const res = await fetch(`${API_BASE}/api/memory/profile/${userId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getWaitlistPrediction(trainNumber: string, travelClass: string, currentWl: number, daysToDept: number) {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/predict-waitlist?train_number=${trainNumber}&travel_class=${travelClass}&current_wl=${currentWl}&days_to_departure=${daysToDept}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getDynamicFareForecast(routeId: string, baseFare: number) {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/dynamic-fare-forecast?route_id=${routeId}&base_fare=${baseFare}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};
