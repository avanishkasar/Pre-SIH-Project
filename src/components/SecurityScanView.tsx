import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Code2,
  Terminal,
  Sparkles,
  Search,
  Filter,
  Check,
  ShieldCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Scan, Vulnerability } from '../types/matrix';
import { ScanPDFExportButton } from './ScanPDFExportButton';

interface SecurityScanViewProps {
  scan: Scan;
  findings: Vulnerability[];
  onUpdateFindingStatus?: (findingId: number, update: Partial<Vulnerability>) => void;
}

export const SecurityScanView: React.FC<SecurityScanViewProps> = ({
  scan,
  findings: initialFindings,
  onUpdateFindingStatus,
}) => {
  const [findings, setFindings] = useState<Vulnerability[]>(initialFindings);
  const [activeSeverity, setActiveSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(findings[0]?.id || null);

  // Sync findings if prop changes
  React.useEffect(() => {
    setFindings(initialFindings);
  }, [initialFindings]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: findings.length,
      critical: findings.filter((f) => f.severity === 'critical' && !f.is_suppressed).length,
      high: findings.filter((f) => f.severity === 'high' && !f.is_suppressed).length,
      medium: findings.filter((f) => f.severity === 'medium' && !f.is_suppressed).length,
      low: findings.filter((f) => f.severity === 'low' && !f.is_suppressed).length,
      info: findings.filter((f) => f.severity === 'info' && !f.is_suppressed).length,
      suppressed: findings.filter((f) => f.is_suppressed).length,
    };
  }, [findings]);

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // Filter by severity
      if (activeSeverity === 'suppressed') {
        if (!f.is_suppressed) return false;
      } else if (activeSeverity !== 'all') {
        if (f.is_suppressed || f.severity !== activeSeverity) return false;
      }

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = f.title.toLowerCase().includes(q);
        const matchesType = f.vulnerability_type.toLowerCase().includes(q);
        const matchesUrl = f.url.toLowerCase().includes(q);
        const matchesCwe = f.cwe_id?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesType && !matchesUrl && !matchesCwe) return false;
      }

      return true;
    });
  }, [findings, activeSeverity, searchQuery]);

  const handleStatusToggle = (
    findingId: number,
    field: 'is_false_positive' | 'is_fixed' | 'is_suppressed'
  ) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          const updated = { ...f, [field]: !f[field] };
          if (onUpdateFindingStatus) {
            onUpdateFindingStatus(findingId, { [field]: updated[field] });
          }
          return updated;
        }
        return f;
      })
    );
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              Audit Complete
            </span>
            <span className="text-xs text-text-muted font-mono">
              Target: <strong className="text-text-primary">{scan.target_url}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary mt-1">
            Vulnerability Findings & AI Exploit Analysis
          </h2>
        </div>

        <ScanPDFExportButton scan={scan} findings={findings} />
      </div>

      {/* 5 Severity Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'critical', label: 'Critical', count: counts.critical, color: 'text-red-600', bg: 'bg-red-500/10 border-red-200' },
          { key: 'high', label: 'High', count: counts.high, color: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-200' },
          { key: 'medium', label: 'Medium', count: counts.medium, color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200' },
          { key: 'low', label: 'Low', count: counts.low, color: 'text-sky-600', bg: 'bg-sky-500/10 border-sky-200' },
          { key: 'suppressed', label: 'Suppressed', count: counts.suppressed, color: 'text-gray-600', bg: 'bg-gray-500/10 border-gray-200' },
        ].map((card) => (
          <button
            key={card.key}
            onClick={() => setActiveSeverity(card.key)}
            className={`p-3.5 rounded-xl border text-left transition-all ${card.bg} ${
              activeSeverity === card.key ? 'ring-2 ring-accent-primary shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
          >
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{card.label}</div>
            <div className={`text-2xl font-serif font-bold mt-1 ${card.color}`}>{card.count}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1 p-1 bg-warm-200/70 rounded-xl border border-warm-300 w-full sm:w-auto overflow-x-auto">
          {['all', 'critical', 'high', 'medium', 'low', 'suppressed'].map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeSeverity === sev
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {sev} {counts[sev as keyof typeof counts] !== undefined ? `(${counts[sev as keyof typeof counts]})` : ''}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, CWE, vulnerability type, parameter..."
            className="input-glass pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="glass-card p-12 text-center text-text-muted">
            <ShieldCheck className="w-12 h-12 text-accent-primary mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-serif font-semibold text-text-primary">No vulnerabilities match filter</h3>
            <p className="text-xs mt-1">Try resetting the severity tab or clearing your search criteria.</p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isExpanded = expandedId === finding.id;
            return (
              <div
                key={finding.id}
                className={`glass-card overflow-hidden transition-all border ${
                  finding.is_suppressed
                    ? 'opacity-60 border-dashed border-gray-300'
                    : 'border-warm-300 hover:border-accent-primary/40'
                }`}
              >
                {/* Finding Header Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                  className="p-4 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-warm-100/40 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${getSeverityBadgeClass(
                        finding.severity
                      )}`}
                    >
                      {finding.severity}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-text-primary truncate">
                          {finding.title}
                        </h4>
                        {finding.cvss_score && (
                          <span className="px-2 py-0.5 bg-warm-200 text-text-primary rounded text-[10px] font-mono font-bold">
                            CVSS {finding.cvss_score}
                          </span>
                        )}
                        {finding.cwe_id && (
                          <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary rounded text-[10px] font-mono">
                            {finding.cwe_id}
                          </span>
                        )}
                        {finding.is_fixed && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Fixed
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-text-muted font-mono">
                        <span className="text-accent-primary font-semibold">{finding.method}</span>
                        <span className="truncate max-w-md">{finding.url}</span>
                        {finding.parameter && (
                          <span className="bg-warm-100 px-1.5 py-0.5 rounded text-text-secondary">
                            param: <strong>{finding.parameter}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-1 rounded-lg text-text-muted hover:text-text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : finding.id);
                      }}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-2 border-t border-warm-200/80 bg-warm-50/50 space-y-4">
                    {/* Description */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Description</h5>
                      <p className="text-xs text-text-secondary leading-relaxed">{finding.description}</p>
                    </div>

                    {/* Attack Evidence & Payload */}
                    {finding.evidence && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-accent-primary" />
                          Exploit Evidence & Discovered Payload
                        </h5>
                        <pre className="terminal text-xs overflow-x-auto whitespace-pre-wrap">
                          {finding.evidence}
                        </pre>
                      </div>
                    )}

                    {/* AI Security Analysis */}
                    {finding.ai_analysis && (
                      <div className="p-3.5 bg-accent-primary/5 rounded-xl border border-accent-primary/20 space-y-1.5">
                        <div className="text-xs font-semibold text-accent-primary flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                          <span>Matrix AI Threat Reasoner Assessment</span>
                          <span className="text-[10px] font-mono text-text-muted">
                            (Confidence: {Math.round(finding.ai_confidence * 100)}%)
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                          {finding.ai_analysis}
                        </p>
                      </div>
                    )}

                    {/* Remediation & Code Patch */}
                    {finding.remediation && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Recommended Mitigation
                        </h5>
                        <p className="text-xs text-text-secondary leading-relaxed">{finding.remediation}</p>

                        {finding.remediation_code && (
                          <div className="mt-2">
                            <div className="text-[11px] font-mono text-text-muted mb-1">
                              Secured Code Patch:
                            </div>
                            <pre className="p-3 rounded-xl bg-[#2C2416] text-[#7EC699] font-mono text-xs overflow-x-auto">
                              {finding.remediation_code}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Triage Status Actions */}
                    <div className="pt-2 border-t border-warm-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusToggle(finding.id, 'is_fixed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            finding.is_fixed
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-text-secondary border-warm-300 hover:border-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{finding.is_fixed ? 'Marked Fixed' : 'Mark as Fixed'}</span>
                        </button>

                        <button
                          onClick={() => handleStatusToggle(finding.id, 'is_false_positive')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            finding.is_false_positive
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-text-secondary border-warm-300 hover:border-amber-600 hover:text-amber-700'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{finding.is_false_positive ? 'False Positive' : 'Flag False Positive'}</span>
                        </button>

                        <button
                          onClick={() => handleStatusToggle(finding.id, 'is_suppressed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            finding.is_suppressed
                              ? 'bg-gray-700 text-white border-gray-700 shadow-sm'
                              : 'bg-white text-text-secondary border-warm-300 hover:border-gray-600 hover:text-gray-700'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{finding.is_suppressed ? 'Suppressed' : 'Suppress Issue'}</span>
                        </button>
                      </div>

                      {finding.reference_links && finding.reference_links.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-text-muted">References:</span>
                          {finding.reference_links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent-primary hover:underline flex items-center gap-0.5"
                            >
                              OWASP Doc <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SecurityScanView;
