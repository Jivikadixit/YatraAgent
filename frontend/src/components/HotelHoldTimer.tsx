import React, { useState, useEffect } from 'react';
import { Building2, Lock, ShieldCheck, Timer, AlertCircle, Sparkles, Check, Zap } from 'lucide-react';

interface Hotel {
  hotel_id: string;
  name: string;
  category: string;
  rating: number;
  price_per_night_inr: number;
  distance_to_core_temple: string;
  amenities: string[];
  soft_hold_available: boolean;
}

interface Props {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  onSelectHotel: (hotel: Hotel) => void;
  holdData: any;
  onInitiateHold: (hotel: Hotel) => void;
  onInstantBookHotel?: (hotel: Hotel) => void;
}

export const HotelHoldTimer: React.FC<Props> = ({ 
  hotels, 
  selectedHotel, 
  onSelectHotel, 
  holdData, 
  onInitiateHold,
  onInstantBookHotel
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes

  useEffect(() => {
    if (!holdData) return;
    setSecondsRemaining(600);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdData]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              Heritage Stay Curation & 10-Min Soft Hold
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30">
                Rate & Room Lock
              </span>
            </h3>
            <p className="text-xs text-slate-400">Proximity-matched to core sanctum with verified Sattvic/Jain kitchen facilities</p>
          </div>
        </div>

        {/* Real-time soft hold banner */}
        {holdData && secondsRemaining > 0 && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-sky-950/90 to-cyan-950/90 border border-sky-400/40 px-3.5 py-1.5 rounded-xl shadow-lg shadow-sky-500/10 animate-pulse-slow">
            <Timer className="w-4 h-4 text-cyan-400" />
            <div className="text-xs">
              <span className="text-slate-300">Rate Lock Active: </span>
              <span className="font-mono font-bold text-cyan-300 text-sm">{formatTimer(secondsRemaining)}</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 text-sky-200 px-1.5 py-0.5 rounded font-mono border border-sky-500/30">
              {holdData.hold_token}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotels.map((hotel) => {
          const isSelected = selectedHotel?.hotel_id === hotel.hotel_id;
          const isHeld = holdData?.hotel_id === hotel.hotel_id && secondsRemaining > 0;

          return (
            <div
              key={hotel.hotel_id}
              onClick={() => onSelectHotel(hotel)}
              className={`glass-panel card-hover-lift rounded-xl p-4 cursor-pointer transition-all border relative overflow-hidden flex flex-col justify-between ${
                isSelected ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/15' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-base">{hotel.name}</h4>
                    <div className="text-xs text-sky-400 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold">⭐ {hotel.rating}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{hotel.category}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-300">{hotel.distance_to_core_temple} to sanctum</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-sky-400">₹{hotel.price_per_night_inr}</div>
                    <div className="text-[10px] text-slate-400">/ night (Taxes incl.)</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {hotel.amenities.map((am, idx) => (
                    <span key={idx} className="text-[10px] px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800">
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action row with Hold + Direct Book Now buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2.5 border-t border-slate-800 gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {isHeld ? (
                    <span className="text-cyan-400 flex items-center gap-1 font-medium text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      10-Min Hold Active
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-sky-400/80" />
                      Zero-penalty lock
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHotel(hotel);
                      onInitiateHold(hotel);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1 shadow-sm ${
                      isHeld
                        ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-400/40'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-sky-400'
                    }`}
                  >
                    {isHeld ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Held ({formatTimer(secondsRemaining)})
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Lock Rate (10m)
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHotel(hotel);
                      if (onInstantBookHotel) onInstantBookHotel(hotel);
                    }}
                    className="text-xs px-3.5 py-1.5 rounded-lg font-bold bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 shadow-md shadow-sky-500/20 hover:scale-105 transition-all flex items-center justify-center gap-1 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Book Room Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
