import React, { useState, useMemo } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Search,
  Download,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Scan, Vulnerability } from '../types/matrix';
import { ScanPDFExportButton } from '../components/ScanPDFExportButton';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'All' | '7d' | '30d' | '90d'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');

  const [mockScans, setMockScans] = useState<Scan[]>([
    {
      id: 1042,
      target_url: 'http://pentest-ground.com:4280',
      target_name: 'Staging Vulnerability Playground',
      scan_type: 'FULL SUITE',
      status: 'completed',
      progress: 100,
      total_vulnerabilities: 3,
      critical_count: 2,
      high_count: 1,
      medium_count: 0,
      low_count: 0,
      info_count: 0,
      technology_stack: ['Node.js', 'PostgreSQL', 'Express'],
      agents_enabled: ['sqli', 'xss', 'ssrf'],
      enable_waf_evasion: true,
      waf_evasion_consent: true,
      custom_headers: null,
      custom_cookies: null,
      created_at: '2026-08-31T22:30:00Z',
      completed_at: '2026-08-31T22:38:20Z',
    },
    {
      id: 1041,
      target_url: 'https://api.internal-mesh.io',
      target_name: 'Core Payment Microservice',
      scan_type: 'API FUZZING',
      status: 'completed',
      progress: 100,
      total_vulnerabilities: 2,
      critical_count: 1,
      high_count: 0,
      medium_count: 1,
      low_count: 0,
      info_count: 0,
      technology_stack: ['Go', 'GraphQL', 'Redis'],
      agents_enabled: ['auth', 'api_fuzz'],
      enable_waf_evasion: false,
      waf_evasion_consent: false,
      custom_headers: null,
      custom_cookies: null,
      created_at: '2026-08-30T14:20:00Z',
      completed_at: '2026-08-30T14:25:10Z',
    },
    {
      id: 1040,
      target_url: 'https://github.com/Viverun/Matrix',
      target_name: 'Matrix Core Repository',
      scan_type: 'SAST AUDIT',
      status: 'completed',
      progress: 100,
      total_vulnerabilities: 3,
      critical_count: 1,
      high_count: 1,
      medium_count: 1,
      low_count: 0,
      info_count: 0,
      technology_stack: ['TypeScript', 'React', 'Tailwind'],
      agents_enabled: ['git_sast'],
      enable_waf_evasion: false,
      waf_evasion_consent: false,
      custom_headers: null,
      custom_cookies: null,
      created_at: '2026-08-29T09:12:00Z',
      completed_at: '2026-08-29T09:14:05Z',
    },
  ]);

  const filteredScans = useMemo(() => {
    return mockScans.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUrl = s.target_url.toLowerCase().includes(q);
        const matchName = s.target_name?.toLowerCase().includes(q);
        if (!matchUrl && !matchName) return false;
      }
      return true;
    });
  }, [mockScans, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return filteredScans.reduce(
      (acc, s) => ({
        totalScans: filteredScans.length,
        totalVulns: acc.totalVulns + s.total_vulnerabilities,
        critical: acc.critical + s.critical_count,
        high: acc.high + s.high_count,
        medium: acc.medium + s.medium_count,
        low: acc.low + s.low_count,
      }),
      { totalScans: 0, totalVulns: 0, critical: 0, high: 0, medium: 0, low: 0 }
    );
  }, [filteredScans]);

  // Security posture score calculation
  const postureScore = Math.max(
    0,
    Math.min(100, 100 - stats.critical * 12 - stats.high * 6 - stats.medium * 2)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-r from-warm-100/90 to-warm-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-xs font-mono font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>CISO Intelligence Dashboard</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-text-primary">
              Vulnerability Trends & Past Reports
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Audit historical security assessments, track threat surface changes over time, and generate vector compliance PDF dossiers.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-warm-200/70 rounded-xl border border-warm-300">
            {(['All', '7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === r
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Infrastructure Score
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <div
              className={`text-3xl font-serif font-bold ${
                postureScore >= 75 ? 'text-emerald-600' : postureScore >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {postureScore}/100
            </div>
            <span className="text-[10px] text-text-muted font-mono">CVSS Weighted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Audits
          </div>
          <div className="text-3xl font-serif font-bold text-text-primary mt-1">{stats.totalScans}</div>
        </div>

        <div className="stat-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-600">
            Critical Vectors
          </div>
          <div className="text-3xl font-serif font-bold text-red-600 mt-1">{stats.critical}</div>
        </div>

        <div className="stat-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            High Severity
          </div>
          <div className="text-3xl font-serif font-bold text-orange-600 mt-1">{stats.high}</div>
        </div>

        <div className="stat-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Medium Severity
          </div>
          <div className="text-3xl font-serif font-bold text-amber-600 mt-1">{stats.medium}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past scans by target URL or name..."
            className="input-glass pl-9 text-xs py-2"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-glass text-xs py-2"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Past Scans Table */}
      <div className="glass-card overflow-hidden border border-warm-300 rounded-2xl">
        <div className="p-4 border-b border-warm-200 flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-text-primary">
            Historical Audit Logs & Export Dossiers
          </h3>
          <span className="text-xs text-text-muted font-mono">{filteredScans.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100/60 text-text-muted uppercase text-[10px] font-bold tracking-wider border-b border-warm-200">
              <tr>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Severity Distribution</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200">
              {filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-warm-100/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-text-primary">{scan.target_name || 'Target'}</div>
                    <div className="text-[10px] text-text-muted font-mono truncate max-w-xs">
                      {scan.target_url}
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[10px] text-accent-primary font-bold">
                    {scan.scan_type}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                      {scan.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                        {scan.critical_count} Crit
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">
                        {scan.high_count} High
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                        {scan.medium_count} Med
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 text-text-muted text-[11px]">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <ScanPDFExportButton
                      scan={scan}
                      findings={[
                        {
                          id: 1,
                          vulnerability_type: 'sql_injection',
                          severity: 'critical',
                          cvss_score: 9.8,
                          url: scan.target_url,
                          method: 'GET',
                          title: 'SQL Injection in Product Endpoint',
                          description: 'Unsanitized database parameter extraction flaw.',
                          evidence: "GET /api/v1/products?id=1' OR 1=1-- HTTP/1.1",
                          ai_confidence: 0.99,
                          ai_analysis: 'Direct query interpolation enables unauthorized table extraction.',
                          remediation: 'Use parameterized queries with prepared statements.',
                          reference_links: ['https://owasp.org/www-community/attacks/SQL_Injection'],
                          cwe_id: 'CWE-89',
                          is_false_positive: false,
                          is_verified: true,
                          is_fixed: false,
                          is_suppressed: false,
                          action_required: true,
                          detection_confidence: 0.99,
                          exploit_confidence: 0.98,
                          detected_at: scan.created_at,
                          scan_id: scan.id,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
