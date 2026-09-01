import React from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Flame,
  Binary,
  Layers,
} from 'lucide-react';
import { InvestigationResult } from '../types';

interface MetricsCardsProps {
  result: InvestigationResult | null;
  isProcessing: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ result, isProcessing }) => {
  const eventsCount = result?.ingestedCount ?? 0;
  const suspiciousCount = result?.suspiciousFindings?.length ?? 0;
  const incidentCount = result?.incidents?.length ?? 0;
  const criticalCount = result?.incidents?.filter((i) => i.severity === 'Critical').length ?? 0;
  const totalDuration = result?.processingMetrics?.totalTimeMs ?? 0;
  const eventsPerSec = result?.processingMetrics?.eventsPerSec ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* Metric 1: Events Ingested */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-bold uppercase tracking-wider">Events Ingested</span>
          <Binary className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {isProcessing ? '...' : eventsCount}
          </span>
          <span className="text-[11px] text-slate-500">normalized</span>
        </div>
        <div className="mt-1 text-[11px] text-cyan-400 font-mono">
          Log Analysis Agent ✓
        </div>
      </div>

      {/* Metric 2: Suspicious Findings */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-bold uppercase tracking-wider">Threat Triggers</span>
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-400">
            {isProcessing ? '...' : suspiciousCount}
          </span>
          <span className="text-[11px] text-slate-500">rule flags</span>
        </div>
        <div className="mt-1 text-[11px] text-amber-400 font-mono">
          Deterministic Engine
        </div>
      </div>

      {/* Metric 3: Correlated Incidents */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-bold uppercase tracking-wider">Correlated Incidents</span>
          <Layers className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-indigo-400">
            {isProcessing ? '...' : incidentCount}
          </span>
          <span className="text-[11px] text-slate-500">synthesized</span>
        </div>
        <div className="mt-1 text-[11px] text-indigo-400/80 font-mono">
          Threat Agent Graph
        </div>
      </div>

      {/* Metric 4: Critical Severity */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-bold uppercase tracking-wider">Critical Threats</span>
          <Flame className="h-4 w-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-rose-400">
            {isProcessing ? '...' : criticalCount}
          </span>
          <span className="text-[11px] text-slate-500">high impact</span>
        </div>
        <div className="mt-1 text-[11px] text-rose-400 font-mono">
          Immediate Containment
        </div>
      </div>

      {/* Metric 5: Multi-Agent Velocity */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-bold uppercase tracking-wider">Agent Latency</span>
          <Zap className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {isProcessing ? '...' : `${totalDuration}ms`}
          </span>
          <span className="text-[11px] text-slate-500">pipeline</span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-400 font-mono">
          {eventsPerSec > 0 ? `${eventsPerSec} ev/sec` : 'Sub-second triage'}
        </div>
      </div>
    </div>
  );
};
