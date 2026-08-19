import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, ShieldCheck, Zap, User, MapPin, Check, ArrowRight, Lock, Building2, Tag, Plane, Train, Bus } from 'lucide-react';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { CulturalAttireAlert } from './components/CulturalAttireAlert';
import { TransitOptimizer } from './components/TransitOptimizer';
import { HotelHoldTimer } from './components/HotelHoldTimer';
import { RouteMapGraph } from './components/RouteMapGraph';
import { SagaBookingModal } from './components/SagaBookingModal';
import { MemoryProfile } from './components/MemoryProfile';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'transit' | 'hotels' | 'memory'>('itinerary');
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState<any>(null);
  const [transitData, setTransitData] = useState<any>(null);
  const [selectedTransit, setSelectedTransit] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [holdData, setHoldData] = useState<any>(null);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [isSagaModalOpen, setIsSagaModalOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<'TRANSIT' | 'HOTEL' | 'COMBINED'>('TRANSIT');

  // Initial load
  useEffect(() => {
    handlePlanTrip({
      prompt: '4-day spiritual and culinary journey to Varanasi under ₹25,000 with Jain dietary food and elderly parents.',
      origin: 'Delhi',
      destination: 'Varanasi',
      duration_days: 3,
      budget_inr: 25000,
      dietary_preference: 'Jain / Pure Veg',
      travelers: 2
    });
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    const mem = await api.getMemoryProfile("demo_user_01");
    if (mem) setMemoryData(mem);
  };

  const handlePlanTrip = async (params: any) => {
    setIsLoading(true);
    // 1. Fetch Itinerary Plan
    const plan = await api.planItinerary(params);
    if (plan) {
      setTripData(plan);
      if (plan.recommended_hotels?.length > 0) {
        setSelectedHotel(plan.recommended_hotels[0]);
      }
    }

    // 2. Fetch Multi-Modal Transit
    const transit = await api.searchTransit(params.origin, params.destination, "2026-09-15", params.budget_inr);
    if (transit) {
      setTransitData(transit);
      if (transit.pareto_options?.most_recommended_value) {
        setSelectedTransit({
          ...transit.pareto_options.most_recommended_value,
          id: "tr_opt_train",
          type: "TRAIN",
          name: transit.pareto_options.most_recommended_value.train_name
        });
      }
    }

    setIsLoading(false);
  };

  const handleInitiateHotelHold = async (hotel: any) => {
    const holdRes = await api.holdHotel(hotel.hotel_id, hotel.name, hotel.price_per_night_inr);
    if (holdRes) {
      setHoldData(holdRes);
    } else {
      setHoldData({
        hold_token: "HOLD_HTL_883A",
        hotel_id: hotel.hotel_id,
        hotel_name: hotel.name,
        status: "HELD"
      });
    }
  };

  const handleInstantTransitBook = (transit: any) => {
    setSelectedTransit(transit);
    setBookingMode('TRANSIT');
    setIsSagaModalOpen(true);
  };

  const handleInstantHotelBook = (hotel: any) => {
    setSelectedHotel(hotel);
    setBookingMode('HOTEL');
    setIsSagaModalOpen(true);
  };

  const isFlight = selectedTransit?.type === 'FLIGHT' || selectedTransit?.airline || selectedTransit?.name?.toLowerCase().includes('flight') || selectedTransit?.name?.toLowerCase().includes('indigo') || selectedTransit?.name?.toLowerCase().includes('air india') || selectedTransit?.name?.toLowerCase().includes('akasa');
  const isTrain = selectedTransit?.type === 'TRAIN' || selectedTransit?.name?.toLowerCase().includes('express') || selectedTransit?.name?.toLowerCase().includes('vande');
  
  const transitFare = selectedTransit?.fare_inr || (isFlight ? 4850 : 1750);
  const transitGst = Math.round(transitFare * 0.05);
  const totalTransitCost = transitFare + transitGst;

  const hotelFare = selectedHotel?.price_per_night_inr || 4200;
  const hotelGst = Math.round(hotelFare * 0.05);
  const totalHotelCost = hotelFare + hotelGst;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-slate-950">
      {/* HEADER NAVBAR */}
      <header className="glass-panel sticky top-0 z-40 border-b border-sky-500/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-400 to-cyan-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-sky-500/25 animate-float-slow">
              🪷
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-100 tracking-tight">
                YatraAgent
              </h1>
              <p className="text-xs text-slate-400">Autonomous & Culturally Aware Travel Planner</p>
            </div>
          </div>

          {/* Clean User Profile Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-sky-500/30 text-sky-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium">Aarav Sharma (Pure Veg)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto border-t border-slate-900/80 text-xs">
          {[
            { id: 'itinerary', label: 'Cultural Plan & Itinerary', icon: Compass },
            { id: 'transit', label: 'Cheapest Flights, Trains & Buses', icon: Tag },
            { id: 'hotels', label: 'Heritage Stays & Soft Hold', icon: Building2 },
            { id: 'memory', label: 'Travel Preferences & History', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2.5 px-4 border-b-2 font-medium transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'border-sky-400 text-sky-300 bg-sky-500/10 shadow-[0_4px_12px_rgba(56,189,248,0.15)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-sky-400 scale-110' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6 animate-fade-in">
        {/* Natural Language Prompt & Modifier Bar */}
        <ItineraryPlanner onPlanTrip={handlePlanTrip} isLoading={isLoading} />

        {/* TAB CONTENTS */}
        {activeTab === 'itinerary' && tripData && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Cultural Attire & Sanctum Rules */}
            <CulturalAttireAlert temples={tripData.attire_and_cultural_guidelines} />

            {/* Step-by-Step Route & Day by Day */}
            <RouteMapGraph itinerary={tripData} />
          </div>
        )}

        {activeTab === 'transit' && (
          <div className="animate-fade-in-up">
            <TransitOptimizer
              transitData={transitData}
              selectedTransit={selectedTransit}
              onSelectTransit={setSelectedTransit}
              onInstantBook={handleInstantTransitBook}
            />
          </div>
        )}

        {activeTab === 'hotels' && tripData && (
          <div className="animate-fade-in-up">
            <HotelHoldTimer
              hotels={tripData.recommended_hotels || []}
              selectedHotel={selectedHotel}
              onSelectHotel={setSelectedHotel}
              holdData={holdData}
              onInitiateHold={handleInitiateHotelHold}
              onInstantBookHotel={handleInstantHotelBook}
            />
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="animate-fade-in-up">
            <MemoryProfile memoryData={memoryData} />
          </div>
        )}
      </main>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 z-40 glass-panel-glow border-t border-sky-500/30 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm">
              {activeTab === 'hotels' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                isFlight ? <Plane className="w-5 h-5" /> : (isTrain ? <Train className="w-5 h-5" /> : <Bus className="w-5 h-5" />)
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                {activeTab === 'hotels' ? (
                  <span>Selected Stay: <strong className="text-sky-200">{selectedHotel?.name || 'Taj Ganges Heritage'}</strong></span>
                ) : (
                  <span>Selected Transit: <strong className="text-sky-200">{selectedTransit?.name || (isFlight ? 'IndiGo 6E-204' : 'Vande Bharat Express')}</strong></span>
                )}
                <span>•</span>
                <span>OTP-Protected Authorization</span>
              </div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Estimated Total: <span className="text-sky-300 font-extrabold text-base">₹{activeTab === 'hotels' ? totalHotelCost : totalTransitCost}</span>
                <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30 font-semibold">
                  Taxes Included
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'hotels') {
                setBookingMode('HOTEL');
              } else {
                setBookingMode('TRANSIT');
              }
              setIsSagaModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-black text-sm transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:scale-[1.02] flex items-center justify-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            {activeTab === 'hotels' 
              ? "Proceed to Book Heritage Stay" 
              : (isFlight ? "Proceed to Book Flight" : (isTrain ? "Proceed to Book Train" : "Proceed to Book Transit"))}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SAGA BOOKING MODAL */}
      <SagaBookingModal
        isOpen={isSagaModalOpen}
        onClose={() => setIsSagaModalOpen(false)}
        tripData={tripData}
        selectedTransit={selectedTransit}
        selectedHotel={selectedHotel}
        holdData={holdData}
        bookingMode={bookingMode}
      />
    </div>
  );
};
