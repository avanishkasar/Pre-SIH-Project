import React from 'react';
import {
  Download,
  Printer,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  Lock,
  User,
  Server,
  Network,
  Clock,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';
import { CorrelatedIncident, NormalizedEvent } from '../types';
import { ReportingAgent } from '../pipeline/agents/reportingAgent';
import { ReportGenerator } from '../utils/pdfGenerator';

interface ReportViewerProps {
  incident: CorrelatedIncident | null;
  events: NormalizedEvent[];
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ incident, events }) => {
  if (!incident) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-8 text-center shadow-sm">
        <FileText className="mx-auto h-10 w-10 text-slate-600 mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">No Incident Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Run an investigation and select an incident to generate and preview the complete SOC investigation dossier.
        </p>
      </div>
    );
  }

  const { report } = ReportingAgent.generateReport(incident, events);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Official SOC Incident Dossier ({report.incidentId})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Synthesized by Incident Reporting Agent • Audit-compliant SIEM documentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => ReportGenerator.downloadJson(report)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print View</span>
          </button>

          <button
            id="btn-download-pdf-dossier"
            onClick={() => ReportGenerator.downloadPdf(report)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-lg shadow-cyan-900/20 border border-cyan-500 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Vector PDF</span>
          </button>
        </div>
      </div>

      {/* Printable / Viewable Report Canvas */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl font-sans text-slate-100">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-wider uppercase font-mono">
              <ShieldAlert className="h-4 w-4" />
              <span>Smart India Hackathon 2026 • Problem Statement SIH26S01</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Automated Threat Investigation & Incident Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Incident ID: <strong className="text-white font-mono">{report.incidentId}</strong> • Generated: {new Date(report.generatedAt).toUTCString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Risk Score</div>
              <div className="text-lg font-bold font-mono text-rose-400">{report.riskScore}/100</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Confidence</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{report.confidenceScore}%</div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            1. Executive Summary
          </h3>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 leading-relaxed font-sans">
            {report.executiveSummary}
          </div>
        </div>

        {/* Section 2: Why It Is Suspicious */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            2. Investigation Analysis & Reasoning
          </h3>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 leading-relaxed font-sans">
            {report.whySuspicious}
          </div>
        </div>

        {/* Section 3: Affected Entities */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            3. Impacted Entities & Indicators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 font-medium">Target User(s)</div>
              <div className="font-mono text-white font-bold mt-1">
                {report.affectedEntities.users.join(', ') || 'N/A'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 font-medium">Target Host(s)</div>
              <div className="font-mono text-white font-bold mt-1">
                {report.affectedEntities.hosts.join(', ') || 'N/A'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 font-medium">Observed IP(s)</div>
              <div className="font-mono text-white font-bold mt-1">
                {report.affectedEntities.ips.join(', ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: MITRE ATT&CK Matrix */}
        {report.mitreTactics.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              4. MITRE ATT&CK Matrix Alignment
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 font-mono text-[11px] text-slate-500 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-2.5">Technique ID</th>
                    <th className="p-2.5">Technique Name</th>
                    <th className="p-2.5">Tactic Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950 font-mono">
                  {report.mitreTactics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-cyan-400 font-bold">{m.techniqueId}</td>
                      <td className="p-2.5 text-slate-200">{m.techniqueName}</td>
                      <td className="p-2.5 text-slate-400">{m.tactic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 5: Risk Scoring Model */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            5. Transparent Risk Factor Contributions
          </h3>
          <div className="space-y-2">
            {report.riskFactors.map((rf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{rf.factor}</div>
                  <div className="text-[11px] text-slate-400">{rf.description}</div>
                </div>
                <div className="font-mono font-bold text-rose-400 pl-4">
                  +{rf.scoreContribution} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Actionable Response Recommendations */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            6. Prioritized Remediation Playbook
          </h3>
          <div className="space-y-2.5">
            {report.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 text-[10px] font-bold font-mono">
                    {rec.priority}
                  </span>
                  <strong className="text-white font-semibold">{rec.action}</strong>
                </div>
                <div className="text-slate-300 text-[11px]">
                  <strong>Reason:</strong> {rec.reason}
                </div>
                <div className="text-slate-400 text-[11px]">
                  <strong>Impact:</strong> {rec.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Multi-Agent Audit Trail */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            7. Multi-Agent Autonomous Audit Trail
          </h3>
          <div className="space-y-1.5 text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <strong className="text-cyan-400">Log Analysis Agent:</strong>{' '}
              {report.agentContributions.logAnalysisAgent}
            </div>
            <div>
              <strong className="text-indigo-400">Threat Investigation Agent:</strong>{' '}
              {report.agentContributions.threatInvestigationAgent}
            </div>
            <div>
              <strong className="text-emerald-400">Reporting Agent:</strong>{' '}
              {report.agentContributions.reportingAgent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
