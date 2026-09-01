import React from 'react';
import {
  ShieldAlert,
  ChevronRight,
  Shield,
  Clock,
  User,
  Server,
  Network,
  CheckCircle,
} from 'lucide-react';
import { CorrelatedIncident, Severity } from '../types';

interface IncidentListProps {
  incidents: CorrelatedIncident[];
  selectedIncidentId: string | null;
  onSelectIncident: (incidentId: string) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}) => {
  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/40">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-300 border border-orange-500/40">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300 border border-blue-500/40">
            Low
          </span>
        );
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (score >= 60) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (score >= 35) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  };

  if (incidents.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-8 text-center">
        <Shield className="mx-auto h-10 w-10 text-slate-600 mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">No Incidents Detected Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Ingest raw logs or click &quot;Run Demo Investigation&quot; to execute the multi-agent detection and correlation pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Active Security Incidents ({incidents.length})
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Correlated by Threat Investigation Agent
        </span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {incidents.map((incident) => {
          const isSelected = selectedIncidentId === incident.id;
          const isMitigated = incident.mitigationActions.some((m) => m.status === 'Applied');

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident.id)}
              className={`p-4 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-800/80 border-l-4 border-l-cyan-500'
                  : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
              }`}
            >
              {/* Left Column: ID, Title, Threat Category, Target */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {incident.id}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                    {incident.threatCategory}
                  </span>
                  {getSeverityBadge(incident.severity)}
                  {isMitigated && (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/40">
                      <CheckCircle className="h-3 w-3" />
                      Mitigation Active
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white tracking-tight truncate">
                  {incident.title}
                </h3>

                {/* Entity Pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span>{incident.affectedEntities.users.join(', ') || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Server className="h-3 w-3 text-slate-500" />
                    <span>{incident.affectedEntities.hosts.join(', ') || 'N/A'}</span>
                  </div>
                  {incident.affectedEntities.ips.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Network className="h-3 w-3 text-slate-500" />
                      <span className="font-mono">{incident.affectedEntities.ips[0]}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>
                      {incident.timestamp.includes('T')
                        ? incident.timestamp.split('T')[1].split('.')[0] + ' UTC'
                        : incident.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Risk Score & Action */}
              <div className="flex items-center gap-4 self-end md:self-center">
                {/* Risk Score Pill */}
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Risk Score</div>
                  <div className="flex items-baseline justify-end gap-1">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-sm font-bold border ${getRiskScoreColor(
                        incident.riskScore
                      )}`}
                    >
                      {incident.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Confidence</div>
                  <div className="font-mono text-xs font-bold text-slate-200">
                    {incident.confidenceScore}%
                  </div>
                </div>

                {/* Correlated Events Counter */}
                <div className="text-right hidden md:block">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Evidence</div>
                  <div className="font-mono text-xs text-cyan-400">
                    {incident.evidenceEventIds.length} events
                  </div>
                </div>

                <div className="flex items-center text-slate-500 hover:text-cyan-400">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
