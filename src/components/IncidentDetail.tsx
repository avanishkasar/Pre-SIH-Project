import React, { useState } from 'react';
import {
  ShieldAlert,
  Download,
  AlertTriangle,
  Server,
  User,
  Network,
  Cpu,
  Terminal,
  CheckCircle2,
  Lock,
  Flame,
  ArrowRight,
  Eye,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CorrelatedIncident, NormalizedEvent } from '../types';

interface IncidentDetailProps {
  incident: CorrelatedIncident;
  events: NormalizedEvent[];
  onDownloadReport: (incident: CorrelatedIncident) => void;
  onExecuteMitigation: (actionId: string, actionTitle: string, targetEntity: string) => void;
  mitigationLoadingId: string | null;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  events,
  onDownloadReport,
  onExecuteMitigation,
  mitigationLoadingId,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'risk' | 'mitigation'>('timeline');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const eventMap = new Map<string, NormalizedEvent>();
  events.forEach((e) => eventMap.set(e.id, e));

  const correlatedEvents = incident.correlatedEventIds
    .map((id) => eventMap.get(id))
    .filter(Boolean) as NormalizedEvent[];

  const evidenceEvents = incident.evidenceEventIds
    .map((id) => eventMap.get(id))
    .filter(Boolean) as NormalizedEvent[];

  return (
    <div className="space-y-4">
      {/* Header Card: Title, Threat Class, Actions */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-400">
                {incident.id}
              </span>
              <span className="rounded bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                {incident.threatCategory}
              </span>
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                  incident.severity === 'Critical'
                    ? 'bg-rose-600 text-white'
                    : incident.severity === 'High'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {incident.severity}
              </span>
              <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-500/30">
                Confidence: {incident.confidenceScore}%
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {incident.title}
            </h1>

            {/* Affected Entities Line */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                <User className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-slate-500">User:</span>
                <span className="font-semibold text-white font-mono">
                  {incident.affectedEntities.users.join(', ') || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                <Server className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-slate-500">Host:</span>
                <span className="font-semibold text-white font-mono">
                  {incident.affectedEntities.hosts.join(', ') || 'N/A'}
                </span>
              </div>
              {incident.affectedEntities.ips.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                  <Network className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-slate-500">IP:</span>
                  <span className="font-semibold text-white font-mono">
                    {incident.affectedEntities.ips.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Download Report Button & Risk Score */}
          <div className="flex items-center gap-4 self-start">
            <div className="text-right pr-2">
              <div className="text-3xl font-bold text-white font-mono">
                {incident.riskScore}
                <span className="text-sm text-slate-500">/100</span>
              </div>
              <div className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">
                Risk Score
              </div>
            </div>

            <button
              id="btn-download-pdf-incident"
              onClick={() => onDownloadReport(incident)}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 text-xs font-semibold shadow-lg shadow-cyan-900/20 border border-cyan-500 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Full Report (PDF)</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-400 mb-1 text-[11px]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Executive Forensic Briefing</span>
          </div>
          <p className="text-slate-300">{incident.executiveSummary}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'timeline'
              ? 'bg-slate-800 text-white font-semibold border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span>Attack Sequence Timeline ({correlatedEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'evidence'
              ? 'bg-slate-800 text-white font-semibold border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="h-3.5 w-3.5 text-cyan-400" />
          <span>Evidence Chain ({evidenceEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'risk'
              ? 'bg-slate-800 text-white font-semibold border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>Risk Model ({incident.riskScore}/100)</span>
        </button>

        <button
          onClick={() => setActiveTab('mitigation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'mitigation'
              ? 'bg-slate-800 text-white font-semibold border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Response Playbook ({incident.recommendations.length})</span>
        </button>
      </div>

      {/* Tab 1: Attack Sequence Timeline */}
      {activeTab === 'timeline' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Attack Timeline & Evidence Correlation
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">
              Confidence: {incident.confidenceScore}%
            </span>
          </div>

          <div className="border border-slate-800 bg-slate-950 rounded-lg p-4 space-y-4 overflow-hidden">
            {correlatedEvents.map((evt, idx) => {
              const isCrit = evt.severity === 'Critical';
              const isHigh = evt.severity === 'High';
              const isFail = evt.status === 'FAILURE';

              return (
                <div key={evt.id} className="flex gap-4 relative">
                  {/* Vertical connector */}
                  {idx < correlatedEvents.length - 1 && (
                    <div className="absolute left-1.5 top-3 bottom-0 w-px bg-slate-800" />
                  )}
                  {/* Node Dot */}
                  <div
                    className={`w-3 h-3 rounded-full relative z-10 mt-1 flex-none ${
                      isCrit
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                        : isHigh
                        ? 'bg-orange-500 shadow-sm shadow-orange-500/50'
                        : isFail
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                  />

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-mono text-slate-500">
                        {evt.timestamp.includes('T') ? evt.timestamp.split('T')[1].split('.')[0] : evt.timestamp}
                      </p>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-300 border border-slate-700">
                        {evt.id}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          evt.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : evt.status === 'FAILURE'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {evt.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        host: <strong className="text-slate-200">{evt.host}</strong>
                      </span>
                    </div>

                    <p className="text-sm mt-1 text-slate-200 leading-relaxed">
                      {isCrit || isHigh ? (
                        <span className="font-bold text-rose-400">{evt.action || evt.event_type}: </span>
                      ) : isFail ? (
                        <span className="font-bold text-amber-400">{evt.action || evt.event_type}: </span>
                      ) : (
                        <span className="font-semibold text-white">{evt.action || evt.event_type}: </span>
                      )}
                      <span className="text-slate-300 font-mono text-xs">{evt.message}</span>
                    </p>

                    {evt.process && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700 w-fit">
                        <Terminal className="h-3 w-3 text-cyan-400" />
                        <span>Process: {evt.process}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Evidence Chain */}
      {activeTab === 'evidence' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Why This Is Suspicious (Deterministic Evidence Chain)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {incident.whySuspicious}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/80 overflow-hidden">
            <div className="border-b border-slate-800 px-4 py-3 bg-slate-900/90 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                Verified Direct Evidence Records ({evidenceEvents.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Extracted directly from input telemetry
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {evidenceEvents.map((ev) => {
                const isExpanded = expandedEventId === ev.id;

                return (
                  <div key={ev.id} className="p-3.5 hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {ev.id}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {ev.action}
                        </span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                          {ev.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-slate-500 text-[11px]">
                          {ev.timestamp}
                        </span>
                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode className="h-3 w-3" />
                          <span>{isExpanded ? 'Hide Raw' : 'View Raw'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-1.5 text-xs text-slate-200 font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                      {ev.message}
                    </div>

                    {isExpanded && (
                      <div className="mt-2 text-[11px] font-mono bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 overflow-x-auto">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                          Raw Telemetry Stream
                        </div>
                        <pre className="whitespace-pre-wrap break-all text-slate-300">{ev.raw_event}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Transparent Risk Model */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Transparent Risk Scoring Model</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deterministic mathematical score based on attack category, correlation volume, privileges, threat intel, and kill-chain depth.
                </p>
              </div>

              <div className="flex items-baseline gap-2 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                <span className="text-2xl font-bold font-mono text-rose-400">
                  {incident.riskScore}
                </span>
                <span className="text-xs text-slate-500">/ 100 Risk</span>
              </div>
            </div>

            {/* Risk Factors Breakdown */}
            <div className="mt-4 space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Scoring Factor Breakdown
              </h4>

              <div className="space-y-2">
                {incident.riskFactors.map((rf, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{rf.factor}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono border border-slate-700">
                          {rf.weight} Weight
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{rf.description}</p>
                    </div>

                    <div className="font-mono font-bold text-rose-400 self-end sm:self-center">
                      +{rf.scoreContribution} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MITRE ATT&CK Matrix Alignment */}
            {incident.mitreTactics.length > 0 && (
              <div className="mt-5 border-t border-slate-800 pt-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  MITRE ATT&CK Framework Mapping
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {incident.mitreTactics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="font-mono text-cyan-400 font-bold">{m.techniqueId}</div>
                      <div className="font-semibold text-slate-200">{m.techniqueName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">
                        Tactic: {m.tactic}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Response Playbook & Interactive Containment */}
      {activeTab === 'mitigation' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-4">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Recommended Actions
              </h2>
              <p className="text-xs text-slate-400">
                Targeted defensive containment steps produced by Threat Investigation Agent.
              </p>
            </div>

            <div className="space-y-3">
              {incident.recommendations.map((rec, idx) => {
                const actionState = incident.mitigationActions.find((m) => m.id === `MIT-${incident.id}-${idx + 1}`) || incident.mitigationActions[idx];
                const isApplied = actionState?.status === 'Applied';
                const isExecuting = mitigationLoadingId === actionState?.id;

                return (
                  <div
                    key={rec.id}
                    className={`rounded-lg border p-4 transition-all ${
                      isApplied
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center text-[10px] text-cyan-400 font-bold flex-none">
                            {idx + 1}
                          </div>
                          <h4 className="text-xs font-bold text-white">{rec.action}</h4>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono ${
                              rec.priority === 'Immediate'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rec.reason} • <span className="text-slate-400">Impact: {rec.potentialImpact}</span>
                        </p>

                        {rec.suggestedCommandOrPlaybook && (
                          <div className="mt-2 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-cyan-300">
                            <span className="text-slate-500">$ </span>
                            {rec.suggestedCommandOrPlaybook}
                          </div>
                        )}
                      </div>

                      {/* Containment Button */}
                      <div className="self-start sm:self-center">
                        <button
                          id={`btn-mitigate-${idx}`}
                          onClick={() =>
                            onExecuteMitigation(
                              actionState?.id || `MIT-${incident.id}-${idx + 1}`,
                              rec.action,
                              rec.targetEntity || incident.affectedEntities.hosts[0] || 'System'
                            )
                          }
                          disabled={isApplied || isExecuting}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isApplied
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : isExecuting
                              ? 'bg-slate-800 text-slate-400 cursor-wait'
                              : 'bg-rose-500/10 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Action Applied</span>
                            </>
                          ) : isExecuting ? (
                            <>
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                              <span>Executing...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              <span>Execute Action</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Agent Reasoning Collaboration Panel */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Collaborating Agents Reasoning Ledger
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 relative pl-4 border-l-2 border-l-cyan-500">
            <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <span>Log Analysis Agent (Finding Synthesis)</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
              {incident.agentReasoning.logAgentAnalysis}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 relative pl-4 border-l-2 border-l-amber-500">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span>Threat Investigation Agent (Forensic Assessment)</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
              {incident.agentReasoning.threatAgentAssessment}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
