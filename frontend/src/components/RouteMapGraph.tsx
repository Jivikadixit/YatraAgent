import React from 'react';
import { MapPin, Navigation, Utensils, Sun, Moon, Calendar, ChevronRight, Check, Sparkles } from 'lucide-react';

interface Props {
  itinerary: any;
}

export const RouteMapGraph: React.FC<Props> = ({ itinerary }) => {
  if (!itinerary) return null;

  const days = itinerary.daily_itinerary || [];
  const routeGraph = itinerary.route_graph || [];
  const culinaryGuide = itinerary.culinary_guide || [];

  return (
    <div className="space-y-6">
      {/* Route Transit Node Graph */}
      <div className="glass-panel rounded-xl p-4 border border-sky-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-sky-400" />
          <h4 className="font-bold text-slate-100 text-sm">Step-by-Step Route Transit Graph</h4>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {routeGraph.map((leg: any, idx: number) => (
            <React.Fragment key={idx}>
              <div className="flex-1 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs card-hover-lift">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold text-sky-400">Leg {idx + 1}</span>
                  <span className="text-[10px] font-mono text-cyan-300">{leg.distance_km} km</span>
                </div>
                <div className="font-bold text-slate-100 text-sm">{leg.from} ➔ {leg.to}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span className="text-sky-300">{leg.mode}</span>
                  <span className="text-emerald-400 font-medium">{leg.est_time_hrs}</span>
                </div>
              </div>
              {idx < routeGraph.length - 1 && (
                <div className="hidden md:flex text-sky-600 font-bold">➔</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Day by Day Schedule */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <h4 className="font-bold text-slate-100 text-sm">Curated Day-by-Day Journey & Cultural Rituals</h4>
        </div>

        <div className="space-y-4">
          {days.map((day: any) => (
            <div key={day.day_number} className="glass-panel rounded-xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                    {day.day_number}
                  </span>
                  <h5 className="font-bold text-slate-100 text-sm">{day.title}</h5>
                </div>
              </div>

              <div className="space-y-3">
                {day.schedule.map((slot: any, sidx: number) => (
                  <div key={sidx} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-sky-400 font-semibold shrink-0 pt-0.5 w-16">
                      {slot.time}
                    </span>
                    <div className="flex-1 bg-slate-900/70 rounded-lg p-2.5 border border-slate-800/80">
                      <div className="text-slate-200 font-medium">{slot.activity}</div>
                      {slot.alert && (
                        <div className="text-[11px] text-cyan-300 mt-1 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                          ℹ️ {slot.alert}
                        </div>
                      )}
                      {slot.vibe && (
                        <span className="inline-block text-[10px] text-cyan-200 mt-1 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                          ✨ {slot.vibe}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Regional Culinary Spots (RAG matched) */}
      {culinaryGuide && culinaryGuide.length > 0 && (
        <div className="glass-panel rounded-xl p-4 border border-teal-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-cyan-400" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Authentic Regional Gastronomy & Dietary Compliance</h4>
              <p className="text-xs text-slate-400">Strictly filtered for {itinerary.dietary_preference}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {culinaryGuide.flatMap((item: any) =>
              (item.dishes || []).map((dish: any, didx: number) => (
                <div key={didx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs card-hover-lift">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sky-200 text-xs">{dish.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
                      {dish.dietary_type}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] my-1.5">{dish.description}</p>
                  <div className="text-[10px] text-slate-400">
                    <strong className="text-slate-300">Iconic Places:</strong> {(dish.best_places || []).join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
