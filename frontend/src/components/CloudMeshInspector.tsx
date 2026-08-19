import React from 'react';
import { Cpu, Server, Database, Shield, Workflow, Terminal, Layers, ArrowUpRight } from 'lucide-react';

export const CloudMeshInspector: React.FC = () => {
  const gcpStack = [
    {
      layer: "Cognitive Layer",
      icon: Cpu,
      tech: "Google AI Studio (Gemini 2.5 Flash / Pro)",
      role: "Structured JSON itinerary generation, Cultural RAG grounding & Multi-Modal function calling.",
      status: "ACTIVE (asia-south1)",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
    },
    {
      layer: "Agent Serverless Mesh",
      icon: Server,
      tech: "Cloud Run Microservices + Model Context Protocol (MCP)",
      role: "Wrappers for Flight Finder (Amadeus), Train Finder (IRCTC), and Bus Gateway (redBus).",
      status: "HEALTHY (0 Cold Starts)",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
    },
    {
      layer: "Saga Orchestration",
      icon: Workflow,
      tech: "Google Cloud Workflows",
      role: "Autonomous multi-leg distributed saga with state machine compensation and rollback on booking failure.",
      status: "ARMED & READY",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/30"
    },
    {
      layer: "Dynamic Predictions",
      icon: Database,
      tech: "BigQuery + BigQuery ML (BQML)",
      role: "Boosted Tree classifier for IRCTC Tatkal WL ➔ CNF predictions and ARIMA_PLUS fare drop forecast.",
      status: "TRAINED (50 iter)",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    },
    {
      layer: "Security & Payments",
      icon: Shield,
      tech: "Google Cloud KMS (AES-256-GCM)",
      role: "Envelope encryption for Aadhaar/Passport PII and single-use delegated UPI AutoPay mandates.",
      status: "FIPS 140-2 L3",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30"
    },
    {
      layer: "Episodic Memory",
      icon: Layers,
      tech: "Firebase Firestore + AlloyDB pgvector",
      role: "30-Day sliding window TTL session state and 768-dim dense taste vector embeddings.",
      status: "TTL ENABLED",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">
            Google Cloud Serverless Agent Mesh Architecture
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
              Live Topology
            </span>
          </h3>
          <p className="text-xs text-slate-400">Enterprise zero-touch orchestration across Google Cloud Platform services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gcpStack.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.layer}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${item.color}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-slate-200" />
                  <h4 className="font-bold text-slate-100 text-sm">{item.tech}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.role}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
