import React from 'react';
import { User, History, Compass, Utensils, Award, Clock, ArrowRight, ShieldCheck, BookmarkCheck, Heart, Sparkles } from 'lucide-react';

interface Props {
  memoryData: any;
}

export const MemoryProfile: React.FC<Props> = ({ memoryData }) => {
  const profile = memoryData?.profile || {
    user_id: "demo_user_01",
    name: "Aarav Sharma",
    dietary_profile: "Jain / Pure Vegetarian",
    budget_tier: "Best Value & Comfort",
    transit_preference: "Vande Bharat Express & Direct Flights",
    past_trips: [
      {
        destination: "Varanasi & Sarnath",
        date: "May 2026",
        satisfaction_rating: 4.9,
        notes: "Preferred early morning temple visits and Sattvic Banarasi food."
      }
    ],
    saved_watchlists: [
      {
        route: "Delhi ➔ Varanasi",
        mode: "Train / Flight",
        target_price_inr: 1800,
        alert_active: true
      }
    ]
  };

  const tasteDimensions = [
    { label: "Vegetarian / Jain Food Preference", value: 92, color: "bg-cyan-400" },
    { label: "Sacred Shrines & Cultural Heritage", value: 88, color: "bg-sky-400" },
    { label: "Comfortable Travel (Vande Bharat / Flights)", value: 82, color: "bg-blue-400" },
    { label: "Relaxed & Senior-Friendly Pacing", value: 75, color: "bg-teal-400" },
    { label: "Regional Culinary Exploration", value: 90, color: "bg-indigo-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">
            Your Travel Preferences & Past Journeys
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
              Personalized Profile
            </span>
          </h3>
          <p className="text-xs text-slate-400">Customized recommendations based on your preferences and previous trips</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Travel Style Breakdown */}
        <div className="glass-panel rounded-xl p-4 border border-sky-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sky-200 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Your Travel Style & Preferences
            </h4>
            <span className="text-[11px] text-cyan-300 font-medium">Auto-Personalized</span>
          </div>

          <div className="space-y-2.5">
            {tasteDimensions.map((dim, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{dim.label}</span>
                  <span className="font-bold text-sky-300">{dim.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${dim.color} rounded-full transition-all duration-1000`} style={{ width: `${dim.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Preferred Food: <strong className="text-cyan-300">{profile.dietary_profile}</strong></span>
            <span>Style: <strong className="text-sky-300">{profile.budget_tier}</strong></span>
          </div>
        </div>

        {/* Past Journeys & Fare Alerts */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <History className="w-4 h-4 text-sky-400" />
              Past Journeys & Experiences
            </h4>
            <span className="text-[10px] bg-slate-900 text-sky-300 px-2 py-0.5 rounded border border-sky-500/20">
              Verified Trips
            </span>
          </div>

          <div className="space-y-2">
            {profile.past_trips.map((trip: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs card-hover-lift">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">{trip.destination}</span>
                  <span className="text-[10px] text-slate-400">{trip.date} • ⭐ {trip.satisfaction_rating}</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">{trip.notes}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
              Price Drop Alerts:
            </div>
            {profile.saved_watchlists.map((wl: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-sky-950/40 border border-sky-500/20 text-xs">
                <span className="font-medium text-cyan-300">{wl.route} ({wl.mode})</span>
                <span className="text-emerald-400 font-bold">Target: &lt; ₹{wl.target_price_inr}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                  Alert Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
