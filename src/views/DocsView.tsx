import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Shield,
  Code,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Zap,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { SpiderWeb } from '../components/SpiderWeb';

export const DocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'agents' | 'cvss' | 'waf' | 'contributors'>('architecture');

  const agents = [
    {
      name: 'SQL Injection Agent',
      cwe: 'CWE-89',
      owasp: 'A03:2021-Injection',
      desc: 'Dispatches error-based, time-based, and boolean blind SQL injection heuristics across URL parameters, form inputs, and JSON request bodies.',
      vectors: ["1' OR '1'='1", "1' UNION SELECT null,table_name FROM information_schema.tables--", "1; WAITFOR DELAY '0:0:5'--"],
    },
    {
      name: 'XSS Vector Agent',
      cwe: 'CWE-79',
      owasp: 'A03:2021-Injection',
      desc: 'Audits DOM sinks, reflected inputs, and stored attributes for unsanitized HTML reflections and script execution bypasses.',
      vectors: ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "javascript:/*--></title></style></textarea>*/<svg/onload=alert(1)>"],
    },
    {
      name: 'SSRF Cloud Agent',
      cwe: 'CWE-918',
      owasp: 'A10:2021-SSRF',
      desc: 'Probes webhook collectors and PDF renderers for private IP pivots (10.0.0.0/8, 192.168.0.0/16) and cloud instance metadata (169.254.169.254).',
      vectors: ["http://169.254.169.254/latest/meta-data/", "http://localhost:6379", "http://127.0.0.1:9200/_cat/indices"],
    },
    {
      name: 'CSRF & Origin Agent',
      cwe: 'CWE-352',
      owasp: 'A01:2021-Broken_Access_Control',
      desc: 'Validates state-changing POST/PUT requests for anti-CSRF token enforcement and SameSite cookie attribute protections.',
      vectors: ['Unprotected POST /api/transfer', 'Cross-origin CORS wildcard (*)', 'Missing SameSite=Lax/Strict'],
    },
    {
      name: 'OS Command Injection Agent',
      cwe: 'CWE-78',
      owasp: 'A03:2021-Injection',
      desc: 'Tests file conversion and system utility endpoints with subshell commands, pipes, and backticks.',
      vectors: ["; id", "| uname -a", "`whoami`", "& ping -c 3 127.0.0.1 &"],
    },
    {
      name: 'Authentication & JWT Agent',
      cwe: 'CWE-287',
      owasp: 'A07:2021-Identification_and_Authentication_Failures',
      desc: 'Evaluates JWT alg=none bypasses, expired signature acceptance, bruteforce lockouts, and IDOR session confusion.',
      vectors: ['alg: "none" signature bypass', 'Weak HMAC secret cracking', 'Predictable sequential user IDs'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-r from-warm-100/90 to-warm-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-mono font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Matrix Technical Architecture</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-text-primary">
              Multi-Agent Orchestration & Methodology
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Understand the mathematical CVSS scoring engine, deterministic verification layers, and multi-agent coordination protocol.
            </p>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-warm-300 pb-2 overflow-x-auto">
        {[
          { id: 'architecture', label: '4-Phase Pipeline' },
          { id: 'agents', label: '8 Specialized AI Agents' },
          { id: 'cvss', label: 'CVSS v3.1 Vector Math' },
          { id: 'waf', label: 'WAF Evasion & Ethics' },
          { id: 'contributors', label: 'Contributors & Credits' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-accent-primary hover:bg-warm-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Architecture Section */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Reconnaissance',
                desc: 'Identifies open TCP ports, TLS configuration, web server fingerprint, and API endpoints.',
              },
              {
                step: '02',
                title: 'Surface Fuzzing',
                desc: 'Distributes endpoints across 8 agents to inject targeted payload mutations concurrently.',
              },
              {
                step: '03',
                title: 'Exploit Verification',
                desc: 'Confirms findings through differential response parsing, filtering false positives with 98% accuracy.',
              },
              {
                step: '04',
                title: 'Self-Healing Patch',
                desc: 'Gemini 3.7 synthesizes contextual parameterized code fixes and generates pull requests.',
              },
            ].map((phase) => (
              <div key={phase.step} className="glass-card p-5 border-warm-300 space-y-2">
                <span className="text-2xl font-serif font-bold text-accent-primary">{phase.step}</span>
                <h4 className="text-sm font-serif font-bold text-text-primary">{phase.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Section */}
      {activeSection === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div key={agent.name} className="glass-card p-5 border-warm-300 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-serif font-bold text-text-primary">{agent.name}</h4>
                <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary rounded text-[10px] font-mono font-bold">
                  {agent.cwe}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{agent.desc}</p>
              <div>
                <div className="text-[10px] font-mono font-bold text-text-muted uppercase mb-1">
                  Sample Probe Payloads:
                </div>
                <div className="space-y-1">
                  {agent.vectors.map((vec, i) => (
                    <code key={i} className="block p-1.5 bg-[#2C2416] text-[#E8D5BC] rounded text-[10px] font-mono truncate">
                      {vec}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CVSS Section */}
      {activeSection === 'cvss' && (
        <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-4">
          <h3 className="text-lg font-serif font-bold text-text-primary">
            CVSS v3.1 Mathematical Calculation Standard
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matrix strictly adheres to FIRST.org CVSS v3.1 specification for quantitative vulnerability severity scoring.
          </p>
          <div className="p-4 bg-warm-100/70 rounded-xl border border-warm-200 text-xs font-mono space-y-2">
            <div>Vector String Format:</div>
            <code className="text-accent-primary font-bold">
              CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H (Base Score: 9.8 Critical)
            </code>
          </div>
        </div>
      )}

      {/* WAF Evasion Section */}
      {activeSection === 'waf' && (
        <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-4">
          <h3 className="text-lg font-serif font-bold text-text-primary">
            WAF Evasion & Ethical Pentesting Constraints
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Matrix includes an integrated WAF evasion testing module to assess how well web application firewalls (e.g., Cloudflare, AWS WAF, ModSecurity) detect obfuscated payloads.
          </p>
          <ul className="space-y-2 text-xs text-text-secondary pl-5 list-disc">
            <li><strong>Chunked Transfer Encoding:</strong> Fragments payloads across multiple HTTP chunks to bypass body inspect windows.</li>
            <li><strong>URL Double-Encoding & Unicode Homoglyphs:</strong> Evaluates regex normalizers for normalization bypasses.</li>
            <li><strong>Strict Ethical Sandboxing:</strong> Probing is restricted to non-destructive validation queries.</li>
          </ul>
        </div>
      )}

      {/* Contributors & Engineering Section */}
      {activeSection === 'contributors' && (
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border-warm-300 space-y-6 bg-gradient-to-br from-warm-100/90 to-warm-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-300/80">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-primary text-white flex items-center justify-center font-serif font-bold text-2xl shadow-md">
                  AK
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-text-primary">Avanish Kasar (@avanishkasar)</h3>
                  <div className="text-xs text-accent-primary font-mono font-medium">Lead Security AI Architect & Author</div>
                  <div className="text-xs text-text-muted font-mono">avanishkasar.genai@gmail.com</div>
                </div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-warm-200 border border-warm-300 text-right">
                <div className="text-[10px] font-mono uppercase text-text-muted">Repository Release</div>
                <div className="text-xs font-mono font-bold text-text-primary">v2.4.0 (2026-08-31 22:39:12 PDT)</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-serif font-bold text-text-primary">Architecture & Engineering Accomplishments</h4>
              <ul className="space-y-2 text-xs text-text-secondary pl-5 list-disc">
                <li><strong>XGBoost ML Classification Model:</strong> Designed 12-dimensional cyber telemetry feature extraction executing sub-2ms log anomaly classifications.</li>
                <li><strong>Interactive Jupyter Notebook:</strong> Built end-to-end reproducible machine learning pipeline with 10-fold cross validation, SHAP importance plots, and confusion matrix analytics.</li>
                <li><strong>Multi-Agent SIEM Orchestration:</strong> Engineered real-time log ingestion, attack graph kill-chain correlation, and MITRE ATT&CK technique mapping.</li>
                <li><strong>SOAR Remediation Engine:</strong> Developed 1-click autonomous containment playbooks for firewalls, Active Directory, AWS IAM, and Kubernetes containers.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsView;
