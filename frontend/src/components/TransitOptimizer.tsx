import React, { useState } from 'react';
import { Plane, Train, Bus, Sparkles, TrendingUp, Zap, Clock, ShieldCheck, ArrowRight, Tag, Info, Check } from 'lucide-react';

interface Props {
  transitData: any;
  selectedTransit: any;
  onSelectTransit: (transit: any) => void;
  onInstantBook?: (transit: any) => void;
}

export const TransitOptimizer: React.FC<Props> = ({ transitData, selectedTransit, onSelectTransit, onInstantBook }) => {
  const [activeTab, setActiveTab] = useState<'pareto' | 'flights' | 'trains' | 'buses'>('pareto');

  if (!transitData) return null;

  const pareto = transitData.pareto_options || {};

  return (
    <div className="space-y-4">
      {/* Header with Responsive Tab Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              Cheapest Available Flights, Trains & Buses
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30 hidden sm:inline-block">
                Lowest Fare Comparison
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live price and schedule breakdown with instant autonomous booking
            </p>
          </div>
        </div>

        {/* View Mode Tabs (Scrollable on mobile) */}
        <div className="flex overflow-x-auto no-scrollbar bg-slate-900/90 p-1 rounded-lg border border-slate-800 self-start text-xs shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pareto')}
            className={`px-3 py-1.5 rounded-md transition-all duration-200 shrink-0 ${activeTab === 'pareto' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Best Value (Top 3)
          </button>
          <button
            onClick={() => setActiveTab('flights')}
            className={`px-3 py-1.5 rounded-md transition-all duration-200 shrink-0 ${activeTab === 'flights' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Flights (Auto-Booking)
          </button>
          <button
            onClick={() => setActiveTab('trains')}
            className={`px-3 py-1.5 rounded-md transition-all duration-200 shrink-0 ${activeTab === 'trains' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Trains
          </button>
          <button
            onClick={() => setActiveTab('buses')}
            className={`px-3 py-1.5 rounded-md transition-all duration-200 shrink-0 ${activeTab === 'buses' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Buses
          </button>
        </div>
      </div>

      {/* TOP 3 COMPARISON VIEW */}
      {activeTab === 'pareto' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Option 1: Cheapest Overall (Bus) */}
          {pareto.cheapest_overall && (
            <div 
              onClick={() => onSelectTransit({ ...pareto.cheapest_overall, id: "tr_opt_bus", type: "BUS", name: pareto.cheapest_overall.operator })}
              className={`glass-panel card-hover-lift rounded-xl p-4 cursor-pointer transition-all border relative overflow-hidden flex flex-col justify-between ${
                selectedTransit?.type === "BUS" ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/15' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    💰 Lowest Price (Bus)
                  </span>
                  <Bus className="w-4 h-4 text-emerald-400" />
                </div>
                
                <h4 className="font-bold text-slate-100 text-sm">{pareto.cheapest_overall.operator}</h4>
                <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                  <div><strong>Coach:</strong> Volvo Multi-Axle AC Sleeper (2+1)</div>
                  <div><strong>Departure:</strong> {pareto.cheapest_overall.departure || '09:30 PM'}</div>
                  <div><strong>Duration:</strong> {pareto.cheapest_overall.duration} (Overnight)</div>
                </div>

                {/* Detailed Price Box */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Fare:</span>
                    <span>₹{pareto.cheapest_overall.fare_inr - 95}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST & Toll Fee:</span>
                    <span>₹95</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
                    <span>Total All-Inclusive:</span>
                    <span>₹{pareto.cheapest_overall.fare_inr}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-medium">
                  {pareto.cheapest_overall.savings_vs_flight_inr > 0 ? `Saves ₹${pareto.cheapest_overall.savings_vs_flight_inr} vs Flight` : 'Zero Surge'}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  selectedTransit?.type === 'BUS' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-sky-300'
                }`}>
                  {selectedTransit?.type === 'BUS' ? '✓ Selected' : 'Select Bus'}
                </span>
              </div>
            </div>
          )}

          {/* Option 2: Value Champion (Vande Bharat Train) */}
          {pareto.most_recommended_value && (
            <div 
              onClick={() => onSelectTransit({ ...pareto.most_recommended_value, id: "tr_opt_train", type: "TRAIN", name: pareto.most_recommended_value.train_name })}
              className={`glass-panel card-hover-lift rounded-xl p-4 cursor-pointer transition-all border relative overflow-hidden flex flex-col justify-between ${
                selectedTransit?.type === "TRAIN" ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/15' : 'border-sky-500/20 hover:border-sky-400/50'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    ⚡ Best Value (Train)
                  </span>
                  <Train className="w-4 h-4 text-sky-400" />
                </div>

                <h4 className="font-bold text-slate-100 text-sm">
                  {pareto.most_recommended_value.train_name} (#{pareto.most_recommended_value.train_number})
                </h4>
                <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                  <div><strong>Class:</strong> {pareto.most_recommended_value.class} (Catering Included)</div>
                  <div><strong>Duration:</strong> {pareto.most_recommended_value.duration} (High-Speed Corridor)</div>
                  <div><strong>On-Time Record:</strong> 98% (Punctual)</div>
                </div>

                {/* IRCTC Confirmation Box */}
                <div className="mt-2.5 p-2 rounded bg-sky-950/40 border border-sky-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Confirm Chance:
                  </span>
                  <span className="font-bold text-cyan-300">
                    {Math.round((pareto.most_recommended_value.confirmation_probability || 0.88) * 100)}% (High)
                  </span>
                </div>

                {/* Detailed Price Box */}
                <div className="mt-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Fare + Meal:</span>
                    <span>₹{pareto.most_recommended_value.fare_inr - 120}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IRCTC Booking Charge:</span>
                    <span>₹120</span>
                  </div>
                  <div className="flex justify-between font-bold text-sky-300 pt-1 border-t border-slate-800">
                    <span>Total Ticket Fare:</span>
                    <span>₹{pareto.most_recommended_value.fare_inr}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-cyan-300 font-medium">Recommended</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  selectedTransit?.type === 'TRAIN' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-sky-300'
                }`}>
                  {selectedTransit?.type === 'TRAIN' ? '✓ Selected' : 'Select Train'}
                </span>
              </div>
            </div>
          )}

          {/* Option 3: Fastest (Direct Flight with Instant Auto-Book) */}
          {pareto.fastest_premium && (
            <div 
              onClick={() => onSelectTransit({ ...pareto.fastest_premium, id: "tr_opt_flight", type: "FLIGHT", name: `${pareto.fastest_premium.airline} ${pareto.fastest_premium.flight_number}` })}
              className={`glass-panel card-hover-lift rounded-xl p-4 cursor-pointer transition-all border relative overflow-hidden flex flex-col justify-between ${
                selectedTransit?.type === "FLIGHT" ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/15' : 'border-sky-500/20 hover:border-sky-400/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    ✈️ Fastest Direct (Flight)
                  </span>
                  <Plane className="w-4 h-4 text-sky-400" />
                </div>

                <h4 className="font-bold text-slate-100 text-sm">
                  {pareto.fastest_premium.airline} ({pareto.fastest_premium.flight_number})
                </h4>
                <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                  <div><strong>Flight:</strong> Non-Stop Direct</div>
                  <div><strong>Departure:</strong> {pareto.fastest_premium.departure}</div>
                  <div><strong>Duration:</strong> {pareto.fastest_premium.duration}</div>
                  <div><strong>Baggage:</strong> 15 kg Check-in + 7 kg Cabin</div>
                </div>

                {/* Detailed Price Box */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Airfare:</span>
                    <span>₹{pareto.fastest_premium.fare_inr - 650}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Airport Taxes & UDF:</span>
                    <span>₹650</span>
                  </div>
                  <div className="flex justify-between font-bold text-cyan-300 pt-1 border-t border-slate-800">
                    <span>Total Airfare:</span>
                    <span>₹{pareto.fastest_premium.fare_inr}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-cyan-300 font-medium">Saves 6.5 Hours</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const flightObj = { ...pareto.fastest_premium, id: "tr_opt_flight", type: "FLIGHT", name: `${pareto.fastest_premium.airline} ${pareto.fastest_premium.flight_number}` };
                    onSelectTransit(flightObj);
                    if (onInstantBook) onInstantBook(flightObj);
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold rounded-md shadow-sm flex items-center gap-1 transition-transform hover:scale-105"
                >
                  <Zap className="w-3 h-3" /> Auto-Book
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL FLIGHTS LIST WITH 1-CLICK AUTONOMOUS BOOKING */}
      {activeTab === 'flights' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300 font-medium">
                Live Airline Fares: Instant e-ticket confirmation and automatic seat assignment.
              </span>
            </div>
            <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-semibold border border-cyan-500/30 shrink-0 hidden sm:inline-block">
              Live Fare Feed
            </span>
          </div>

          {(transitData.all_flights || []).map((fl: any) => {
            const isSelected = selectedTransit?.type === 'FLIGHT' && selectedTransit?.name?.includes(fl.airline);
            const flightPayload = { id: fl.id, type: "FLIGHT", name: `${fl.airline} ${fl.flight_number}`, fare_inr: fl.fare_inr, duration: fl.duration };
            
            return (
              <div 
                key={fl.id}
                onClick={() => onSelectTransit(flightPayload)}
                className={`glass-panel card-hover-lift rounded-xl p-4 border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isSelected ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/20' : 'border-slate-800 hover:border-sky-400/60'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{fl.airline}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-800 font-mono font-bold">
                        {fl.flight_number}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Dep: <strong className="text-slate-200">{fl.departure_time}</strong> ➔ Arr: <strong className="text-slate-200">{fl.arrival_time}</strong> • {fl.duration}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Baggage: {fl.baggage} • {fl.seats_left} seats left
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col justify-between sm:items-end sm:border-l sm:border-slate-800 sm:pl-4 gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="text-left sm:text-right">
                    <div className="text-base sm:text-lg font-black text-cyan-300">₹{fl.fare_inr}</div>
                    <div className="text-[10px] text-slate-400">All-Inclusive</div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTransit(flightPayload);
                      if (onInstantBook) onInstantBook(flightPayload);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 hover:scale-105 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Auto-Book Flight
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL TRAINS LIST */}
      {activeTab === 'trains' && (
        <div className="space-y-3">
          {(transitData.all_trains || []).map((t: any) => (
            <div key={t.id} className="glass-panel rounded-xl p-4 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{t.train_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-800 font-mono">
                      #{t.train_number}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Departs: {t.departure_time} ➔ Arrives: {t.arrival_time} • {t.duration} Total
                  </div>
                </div>
                <div className="text-xs text-emerald-400 font-medium bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20 self-start sm:self-auto">
                  On-Time: {t.on_time_performance} • {t.catering_included ? 'Meals Included' : 'No Meals'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                {t.classes.map((cls: any, cidx: number) => {
                  const isSelected = selectedTransit?.name?.includes(t.train_name) && selectedTransit?.fare_inr === cls.fare_inr;
                  return (
                    <div 
                      key={cidx}
                      onClick={() => onSelectTransit({ id: `${t.id}_${cidx}`, type: "TRAIN", name: `${t.train_name} (${cls.class_type})`, fare_inr: cls.fare_inr, duration: t.duration, confirmation_probability: cls.confirmation_probability })}
                      className={`p-3 rounded-lg bg-slate-900/90 border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected ? 'border-sky-400 ring-2 ring-sky-400/30' : 'border-slate-800 hover:border-sky-400/60'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-100">{cls.class_type}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Status: <span className={cls.status.includes('WL') ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>{cls.status}</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium mt-1">
                          Confirmation: {Math.round((cls.confirmation_probability || 0.88) * 100)}% Chance
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-sky-300">₹{cls.fare_inr}</div>
                        <div className="text-[10px] text-slate-400">All-Inclusive</div>
                        <span className={`text-[11px] font-semibold mt-1 inline-block ${isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                          {isSelected ? '✓ Selected' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL BUSES LIST */}
      {activeTab === 'buses' && (
        <div className="space-y-3">
          {(transitData.all_buses || []).map((b: any) => {
            const isSelected = selectedTransit?.type === 'BUS' && selectedTransit?.name?.includes(b.operator);
            return (
              <div 
                key={b.id}
                onClick={() => onSelectTransit({ id: b.id, type: "BUS", name: b.operator, fare_inr: b.fare_inr, duration: b.duration })}
                className={`glass-panel rounded-xl p-4 border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isSelected ? 'border-sky-400 ring-2 ring-sky-400/30' : 'border-slate-800 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{b.operator}</div>
                    <div className="text-xs text-slate-400">{b.bus_type} • Dep: {b.departure_time} ➔ Arr: {b.arrival_time}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Boarding: {b.pickup_point} • Rating: ⭐ {b.rating}
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col justify-between sm:items-end sm:border-l sm:border-slate-800 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="text-left sm:text-right">
                    <div className="text-base sm:text-lg font-black text-emerald-400">₹{b.fare_inr}</div>
                    <div className="text-[10px] text-slate-400">Incl. Taxes & Toll</div>
                  </div>
                  <span className="text-xs text-sky-300 font-semibold px-2 py-1 rounded bg-sky-950 border border-sky-500/30">
                    {isSelected ? '✓ Selected' : 'Select Bus'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
