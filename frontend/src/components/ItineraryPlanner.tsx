import React, { useState } from 'react';
import { Sparkles, Compass, MapPin, Calendar, Users, Wallet, Utensils, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onPlanTrip: (params: any) => void;
  isLoading: boolean;
}

export const ItineraryPlanner: React.FC<Props> = ({ onPlanTrip, isLoading }) => {
  const [prompt, setPrompt] = useState('4-day spiritual and culinary journey to Varanasi under ₹25,000 with Jain dietary food and elderly parents.');
  const [origin, setOrigin] = useState('Delhi');
  const [destination, setDestination] = useState('Varanasi');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetInr, setBudgetInr] = useState(25000);
  const [dietaryPref, setDietaryPref] = useState('Jain / Pure Veg');
  const [travelers, setTravelers] = useState(2);

  const presets = [
    {
      title: "Kashi Ghats & Sattvic Gastronomy",
      destination: "Varanasi",
      origin: "Delhi",
      days: 3,
      budget: 25000,
      diet: "Jain / Pure Veg",
      travelers: 2,
      prompt: "4-day spiritual and culinary journey to Varanasi under ₹25,000 with Jain dietary food and elderly parents."
    },
    {
      title: "Meenakshi & Rameshwaram Theerthams",
      destination: "Madurai & Rameshwaram",
      origin: "Bangalore",
      days: 3,
      budget: 32000,
      diet: "South Indian Veg",
      travelers: 2,
      prompt: "Heritage temple & Pamban sea bridge tour to Madurai and Rameshwaram, budget ₹32,000, pure vegetarian."
    },
    {
      title: "Amritsar Golden Temple & Food Walk",
      destination: "Amritsar",
      origin: "Delhi",
      days: 2,
      budget: 18000,
      diet: "Pure Vegetarian",
      travelers: 2,
      prompt: "2-day Amritsar sacred devotion tour with Guru Ka Langar, heritage kulchas and Wagah border."
    }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setPrompt(preset.prompt);
    setDestination(preset.destination);
    setOrigin(preset.origin);
    setDurationDays(preset.days);
    setBudgetInr(preset.budget);
    setDietaryPref(preset.diet);
    setTravelers(preset.travelers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlanTrip({
      prompt,
      origin,
      destination,
      duration_days: durationDays,
      budget_inr: budgetInr,
      dietary_preference: dietaryPref,
      travelers
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-sky-500/20 shadow-2xl relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Preset Inspiration Pills */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Curated Journeys:
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetSelect(p)}
            className="text-xs px-3.5 py-1.5 rounded-full bg-slate-900/90 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-400/50 hover:bg-sky-950/40 hover:scale-105 transition-all duration-200 shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-3 h-3 text-sky-400" />
            {p.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Natural Language Prompt Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
            <span>Describe Your Dream Journey (Destinations, Travel Style, Dietary Preferences)</span>
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 text-slate-100 p-3.5 text-sm resize-none transition-all duration-200 shadow-inner"
              placeholder="Describe your destination, food preferences, budget, or family requirements..."
            />
          </div>
        </div>

        {/* Structured Modifiers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400" /> Origin City
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-400 p-2 text-slate-200 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-400 p-2 text-slate-200 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Duration
            </label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-400 p-2 text-slate-200 transition-colors"
            >
              <option value={2}>2 Days</option>
              <option value={3}>3 Days</option>
              <option value={4}>4 Days</option>
              <option value={5}>5 Days</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Budget (₹)
            </label>
            <input
              type="number"
              step={1000}
              value={budgetInr}
              onChange={(e) => setBudgetInr(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-400 p-2 text-slate-200 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-teal-400" /> Food & Diet
            </label>
            <select
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-400 p-2 text-slate-200 transition-colors"
            >
              <option value="Jain / Pure Veg">Jain (No Root Veg)</option>
              <option value="Sattvic / No Onion Garlic">Sattvic (No Onion/Garlic)</option>
              <option value="Pure Vegetarian">Pure Vegetarian</option>
              <option value="South Indian Veg">South Indian Veg</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-400" /> Travelers
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-400 p-2 text-slate-200 transition-colors"
            >
              <option value={1}>1 Solo Traveler</option>
              <option value={2}>2 Travelers (Pair/Couple)</option>
              <option value={4}>4 Travelers (Family/Group)</option>
            </select>
          </div>
        </div>

        {/* Primary Generate Button with Gradient & Glow */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-black text-sm transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              Creating Personalized Travel Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              Plan My Trip & Find Best Rates
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
