import React from 'react';
import {
  Award,
  CheckCircle2,
  Layers,
  Cpu,
  Flame,
  FileText,
  ShieldAlert,
  Play,
  Binary,
} from 'lucide-react';

export const SihTraceabilityModal: React.FC = () => {
  const criteria = [
    {
      id: 'REQ-1',
      title: 'Heterogeneous Telemetry Ingestion & Canonical Preprocessing',
      requirement: 'Support JSON, JSONL, CSV, and Syslog logs. Normalize timestamps, users, hosts, IPs, and actions into a unified SIEM schema.',
      implementation: 'LogNormalizer module with auto-detecting regex engines, timestamp ISO standardization, and entity extraction.',
      status: 'Fully Implemented & Verified',
      icon: Binary,
    },
    {
      id: 'REQ-2',
      title: 'Specialized Multi-Agent Architecture (Log Analysis + Threat Investigation)',
      requirement: 'Implement at least two distinct specialized AI agents: one for log anomaly triage and one for deep threat investigation and kill-chain derivation.',
      implementation: 'LogAnalysisAgent (deterministic anomaly detection + schema validation) and ThreatInvestigationAgent (graph correlation + Gemini 3.7 Flash AI reasoning).',
      status: 'Fully Implemented & Verified',
      icon: Cpu,
    },
    {
      id: 'REQ-3',
      title: 'Event Correlation Engine & Kill-Chain Alignment',
      requirement: 'Group related events across common users, hosts, IPs, and temporal proximity. Map incident progression to MITRE ATT&CK tactics.',
      implementation: 'CorrelationEngine with multi-entity clustering and MITRE ATT&CK matrix alignment (Initial Access, Execution, Persistence, PrivEsc, C2, Exfil).',
      status: 'Fully Implemented & Verified',
      icon: Layers,
    },
    {
      id: 'REQ-4',
      title: 'Transparent, Multi-Factor Risk Scoring Model',
      requirement: 'Produce a 0–100 risk score with clear factor breakdowns (threat category, event volume, privileged account usage, known malicious IPs, kill-chain depth).',
      implementation: 'RiskScorer engine outputting explicit score contributions and confidence ratings for full explainability.',
      status: 'Fully Implemented & Verified',
      icon: Flame,
    },
    {
      id: 'REQ-5',
      title: 'Audit-Grade Incident Dossiers & Multi-Format Reporting',
      requirement: 'Generate structured incident reports featuring executive summaries, forensic evidence tables, remediation playbooks, and export to PDF/JSON.',
      implementation: 'ReportingAgent & ReportGenerator utilizing vector jsPDF for downloadable incident briefs and printable HTML views.',
      status: 'Fully Implemented & Verified',
      icon: FileText,
    },
    {
      id: 'REQ-6',
      title: 'One-Click Demo Scenarios for Evaluation & Ad-Hoc Ingestion',
      requirement: 'Include realistic pre-loaded scenarios (Brute Force to C2, Lateral Movement, Malware Dropper, Cloud Exfil) and custom file upload.',
      implementation: '4 curated SOC telemetry scenarios with 1-click execution plus custom drag-and-drop file ingestion support.',
      status: 'Fully Implemented & Verified',
      icon: Play,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 shadow-sm">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm uppercase tracking-wider font-mono">
          <Award className="h-5 w-5" />
          <span>Smart India Hackathon 2026 • Problem Statement SIH26S01</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
          Agentic AI Cybersecurity Assistant Compliance & Verification Matrix
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-1 max-w-3xl leading-relaxed">
          Comprehensive traceability map documenting how every functional deliverable, agent module, and architectural requirement mandated by SIH26S01 is engineered and verified within this application.
        </p>
      </div>

      {/* Grid of Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-3 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {item.id}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{item.title}</h3>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">
                      SIH Requirement:
                    </span>
                    <p className="mt-0.5 text-slate-200">{item.requirement}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">
                      Engineered Implementation:
                    </span>
                    <p className="mt-0.5 text-slate-400 font-mono text-[11px]">
                      {item.implementation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
