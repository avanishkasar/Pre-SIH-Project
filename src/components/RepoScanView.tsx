import React, { useState } from 'react';
import {
  Code,
  Key,
  Package,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { Vulnerability } from '../types/matrix';

interface RepoScanViewProps {
  repoUrl: string;
  findings: Vulnerability[];
  scannedFiles: string[];
  onTriggerSelfHeal?: (finding: Vulnerability) => void;
}

export const RepoScanView: React.FC<RepoScanViewProps> = ({
  repoUrl,
  findings,
  scannedFiles,
  onTriggerSelfHeal,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'secrets' | 'sast' | 'deps'>('all');
  const [expandedFindingId, setExpandedFindingId] = useState<number | null>(findings[0]?.id || null);

  const secrets = findings.filter(
    (f) =>
      f.vulnerability_type.toLowerCase().includes('secret') ||
      f.vulnerability_type.toLowerCase().includes('key') ||
      f.vulnerability_type.toLowerCase().includes('token')
  );

  const dependencies = findings.filter(
    (f) =>
      f.vulnerability_type.toLowerCase().includes('dependency') ||
      f.vulnerability_type.toLowerCase().includes('cve') ||
      f.vulnerability_type.toLowerCase().includes('package')
  );

  const sastIssues = findings.filter(
    (f) => !secrets.includes(f) && !dependencies.includes(f)
  );

  const filtered =
    activeTab === 'secrets'
      ? secrets
      : activeTab === 'deps'
      ? dependencies
      : activeTab === 'sast'
      ? sastIssues
      : findings;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Repository</div>
          <div className="text-sm font-semibold text-text-primary mt-1 truncate font-mono">
            {repoUrl.replace('https://github.com/', '')}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('sast')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'sast' ? 'ring-2 ring-accent-primary bg-accent-primary/5' : 'glass-card'
          }`}
        >
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Code Flaws (SAST)</span>
            <Code className="w-3.5 h-3.5 text-accent-primary" />
          </div>
          <div className="text-2xl font-serif font-bold text-text-primary mt-1">{sastIssues.length}</div>
        </button>

        <button
          onClick={() => setActiveTab('secrets')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'secrets' ? 'ring-2 ring-red-500 bg-red-500/5' : 'glass-card'
          }`}
        >
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Exposed Secrets</span>
            <Key className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-red-600 mt-1">{secrets.length}</div>
        </button>

        <button
          onClick={() => setActiveTab('deps')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'deps' ? 'ring-2 ring-amber-500 bg-amber-500/5' : 'glass-card'
          }`}
        >
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Vulnerable Deps</span>
            <Package className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-600 mt-1">{dependencies.length}</div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-warm-300 pb-2">
        {[
          { id: 'all', label: `All Issues (${findings.length})` },
          { id: 'sast', label: `Static Analysis (${sastIssues.length})` },
          { id: 'secrets', label: `Hardcoded Secrets (${secrets.length})` },
          { id: 'deps', label: `Dependencies (${dependencies.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-accent-primary hover:bg-warm-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isExpanded = expandedFindingId === item.id;
          return (
            <div
              key={item.id}
              className="glass-card overflow-hidden border border-warm-300 transition-all hover:border-accent-primary/50"
            >
              <div
                onClick={() => setExpandedFindingId(isExpanded ? null : item.id)}
                className="p-4 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-warm-100/40"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      item.severity === 'critical'
                        ? 'severity-critical'
                        : item.severity === 'high'
                        ? 'severity-high'
                        : 'severity-medium'
                    }`}
                  >
                    {item.severity}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                      {item.cwe_id && (
                        <span className="px-1.5 py-0.5 bg-warm-200 text-text-muted rounded text-[10px] font-mono">
                          {item.cwe_id}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-text-muted font-mono">
                      <FileCode className="w-3.5 h-3.5 text-accent-primary" />
                      <span className="text-text-primary font-semibold">
                        {item.file_path || 'src/controllers/auth.ts:42'}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="p-1 text-text-muted">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-5 pt-2 border-t border-warm-200 bg-warm-50/50 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                      Finding Details
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
                  </div>

                  {item.evidence && (
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-accent-primary" />
                        Code Evidence / Offending Snippet
                      </h5>
                      <pre className="p-3 rounded-xl bg-[#2C2416] text-[#E8D5BC] font-mono text-xs overflow-x-auto">
                        {item.evidence}
                      </pre>
                    </div>
                  )}

                  {item.remediation && (
                    <div className="space-y-2">
                      <div className="p-3.5 bg-accent-primary/5 rounded-xl border border-accent-primary/20">
                        <div className="text-xs font-semibold text-accent-primary flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                          <span>AI Remediation Guideline</span>
                        </div>
                        <p className="text-xs text-text-secondary">{item.remediation}</p>
                      </div>

                      {item.remediation_code && (
                        <div>
                          <div className="text-[11px] font-mono text-text-muted mb-1">
                            Suggested Unified Diff:
                          </div>
                          <pre className="p-3 rounded-xl bg-[#2C2416] text-[#7EC699] font-mono text-xs overflow-x-auto">
                            {item.remediation_code}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {onTriggerSelfHeal && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onTriggerSelfHeal(item)}
                        className="btn-primary text-xs py-2 px-3.5 gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Dispatch Autonomous Self-Heal PR</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RepoScanView;
