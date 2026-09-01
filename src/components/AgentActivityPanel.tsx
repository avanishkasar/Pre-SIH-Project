import React from 'react';
import {
  Cpu,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { AgentActivityLog, InvestigationResult } from '../types';

interface AgentActivityPanelProps {
  logs: AgentActivityLog[];
  result: InvestigationResult | null;
  isProcessing: boolean;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  logs,
  result,
  isProcessing,
}) => {
  const logAgentLogs = logs.filter((l) => l.agentName === 'Log Analysis Agent');
  const threatAgentLogs = logs.filter((l) => l.agentName === 'Threat Investigation Agent');
  const reportingLogs = logs.filter((l) => l.agentName === 'Incident Reporting Agent');

  const metrics = result?.processingMetrics;

  return (
    <div className="space-y-4">
      {/* Pipeline Performance Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-lg border border-slate-800 shadow-sm">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">
            Total Pipeline Latency
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            {metrics ? `${metrics.totalTimeMs} ms` : isProcessing ? 'Processing...' : '0 ms'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">End-to-end multi-agent</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">
            Log Analysis Agent
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
            {metrics ? `${metrics.logAgentTimeMs} ms` : isProcessing ? '...' : '0 ms'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Ingest & Rule Detection</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">
            Threat Investigation
          </div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
            {metrics ? `${metrics.threatAgentTimeMs} ms` : isProcessing ? '...' : '0 ms'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Correlation & AI Reasoning</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">
            Throughput Velocity
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
            {metrics && metrics.eventsPerSec > 0 ? `${metrics.eventsPerSec} ev/s` : 'Real-time'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Normalized processing</div>
        </div>
      </div>

      {/* Agents Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Log Analysis Agent */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Log Analysis Agent
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 font-semibold">
              Deterministic
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Ingests heterogeneous log streams, validates schemas, extracts entities, and runs rule-based pattern checks.
          </p>

          <div className="space-y-2 pt-1">
            {logAgentLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg bg-slate-950 p-2.5 text-xs font-mono border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-cyan-400 font-semibold uppercase">[{log.stage}]</span>
                  <span>{log.durationMs !== undefined ? `${log.durationMs}ms` : 'active'}</span>
                </div>
                <div className="text-slate-300 text-[11px]">{log.message}</div>
                {log.metrics && (
                  <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-500">
                    {Object.entries(log.metrics).map(([k, v]) => (
                      <span key={k} className="bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {k}: <strong className="text-white">{v}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {logAgentLogs.length === 0 && (
              <div className="text-center py-6 text-slate-600 text-xs font-mono">
                Awaiting log telemetry payload...
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Threat Investigation Agent */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Threat Investigation Agent
              </h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 font-semibold">
              Correlation + AI
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Performs multi-dimensional graph correlation, calculates transparent risk scoring, aligns MITRE ATT&CK, and derives kill-chain narratives.
          </p>

          <div className="space-y-2 pt-1">
            {threatAgentLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg bg-slate-950 p-2.5 text-xs font-mono border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-indigo-400 font-semibold uppercase">[{log.stage}]</span>
                  <span>{log.durationMs !== undefined ? `${log.durationMs}ms` : 'active'}</span>
                </div>
                <div className="text-slate-300 text-[11px]">{log.message}</div>
                {log.metrics && (
                  <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-500">
                    {Object.entries(log.metrics).map(([k, v]) => (
                      <span key={k} className="bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {k}: <strong className="text-white">{v}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {threatAgentLogs.length === 0 && (
              <div className="text-center py-6 text-slate-600 text-xs font-mono">
                Awaiting correlation triggers...
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Incident Reporting Agent */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Incident Reporting Agent
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
              Audit Ready
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Synthesizes executive briefings, evidence tables, actionable remediation playbooks, and exports PDF/JSON reports.
          </p>

          <div className="space-y-2 pt-1">
            {reportingLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg bg-slate-950 p-2.5 text-xs font-mono border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-emerald-400 font-semibold uppercase">[{log.stage}]</span>
                  <span>{log.durationMs !== undefined ? `${log.durationMs}ms` : 'active'}</span>
                </div>
                <div className="text-slate-300 text-[11px]">{log.message}</div>
              </div>
            ))}

            {reportingLogs.length === 0 && (
              <div className="text-center py-6 text-slate-600 text-xs font-mono">
                Awaiting final incident synthesis...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
