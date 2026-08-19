import React from 'react';
import { CheckCircle2, Clock, Accessibility, Ban, ShieldCheck, Info } from 'lucide-react';

interface TempleRule {
  id: string;
  name: string;
  city: string;
  dress_code: {
    men: string;
    women: string;
    strictness_level: string;
    footwear_policy: string;
  };
  customs_and_etiquette: string[];
  best_visiting_hours: string;
  wheelchair_accessible: boolean;
}

interface Props {
  temples: TempleRule[];
}

export const CulturalAttireAlert: React.FC<Props> = ({ temples }) => {
  if (!temples || temples.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Temple Dress Codes & Cultural Guidelines
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
                Visitor Guidelines
              </span>
            </h3>
            <p className="text-xs text-slate-400">Recommended attire, visiting hours, and customs for shrines on your itinerary</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {temples.map((temple) => (
          <div 
            key={temple.id} 
            className="glass-panel card-hover-lift rounded-xl p-4 border border-sky-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-sky-200 text-sm">{temple.name}</h4>
                <p className="text-xs text-slate-400">{temple.city}</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-sky-950/80 text-cyan-300 border border-sky-500/30 font-medium shadow-sm">
                {temple.dress_code.strictness_level}
              </span>
            </div>

            {/* Dress code breakdown */}
            <div className="space-y-2 mb-3 bg-slate-900/80 rounded-lg p-3 border border-slate-800">
              <div className="text-xs">
                <span className="text-sky-400 font-medium">Men: </span>
                <span className="text-slate-300">{temple.dress_code.men}</span>
              </div>
              <div className="text-xs">
                <span className="text-sky-400 font-medium">Women: </span>
                <span className="text-slate-300">{temple.dress_code.women}</span>
              </div>
              <div className="text-xs flex items-center gap-1.5 text-slate-400 pt-1 border-t border-slate-800">
                <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{temple.dress_code.footwear_policy}</span>
              </div>
            </div>

            {/* Etiquette highlights */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400">Key Customs & Ceremonies:</div>
              {temple.customs_and_etiquette.map((custom, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{custom}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Best Hours: {temple.best_visiting_hours}</span>
              </div>
              <div className="flex items-center gap-1">
                <Accessibility className="w-3.5 h-3.5 text-sky-400" />
                <span>{temple.wheelchair_accessible ? 'Wheelchair Accessible' : 'Heritage Steps Terrain'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
