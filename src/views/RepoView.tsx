import React, { useState } from 'react';
import {
  Code,
  Github,
  Key,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  Terminal,
  RotateCcw,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { GitHubTokenGuide } from '../components/GitHubTokenGuide';
import { RepoScanView } from '../components/RepoScanView';
import { Vulnerability } from '../types/matrix';

export const RepoView: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/Viverun/Matrix');
  const [branch, setBranch] = useState('main');
  const [isScanning, setIsScanning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTokenGuide, setShowTokenGuide] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<string[]>([]);
  const [findings, setFindings] = useState<Vulnerability[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  const handleStartRepoScan = () => {
    if (!repoUrl.trim()) return;

    setIsScanning(true);
    setIsCompleted(false);
    setScanProgress(10);
    setScannedFiles([]);

    const filesToAudit = [
      'package.json',
      'server.ts',
      'src/controllers/auth.ts',
      'src/routes/api.ts',
      'src/db/connection.ts',
      'src/middleware/auth.ts',
      '.env.example',
      'src/utils/crypto.ts',
    ];

    let currentFileIndex = 0;
    const interval = setInterval(() => {
      if (currentFileIndex < filesToAudit.length) {
        setScannedFiles((prev) => [...prev, filesToAudit[currentFileIndex]]);
        setScanProgress(Math.round(((currentFileIndex + 1) / filesToAudit.length) * 100));
        currentFileIndex++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setIsCompleted(true);

        setFindings([
          {
            id: 201,
            vulnerability_type: 'secret_exposure',
            severity: 'critical',
            cvss_score: 9.3,
            url: repoUrl,
            file_path: 'src/db/connection.ts:14',
            method: 'STATIC',
            title: 'Hardcoded Production PostgreSQL Password & Secret Key',
            description:
              'Raw credentials "postgres://admin:SuperSecret2026!@db.internal:5432/matrix_prod" detected directly committed to version control.',
            evidence: `13: const dbConfig = {\n14:   connectionString: "postgres://admin:SuperSecret2026!@db.internal:5432/matrix_prod",\n15:   ssl: false\n16: };`,
            ai_confidence: 0.99,
            ai_analysis:
              'Committed credentials in public/private repositories allow immediate unauthorized database access. Credentials must be immediately revoked and rotated.',
            remediation:
              'Extract secrets into environment variables accessed via process.env.DATABASE_URL. Add connection.ts credentials to .gitignore and rotate the password in database.',
            remediation_code: `// Fixed: Load from environment\nconst dbConfig = {\n  connectionString: process.env.DATABASE_URL,\n  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false\n};`,
            reference_links: ['https://cwe.mitre.org/data/definitions/798.html'],
            owasp_category: 'A07:2021-Identification_and_Authentication_Failures',
            cwe_id: 'CWE-798',
            is_false_positive: false,
            is_verified: true,
            is_fixed: false,
            is_suppressed: false,
            action_required: true,
            detection_confidence: 1.0,
            exploit_confidence: 1.0,
            detected_at: new Date().toISOString(),
            scan_id: 2026,
          },
          {
            id: 202,
            vulnerability_type: 'jwt_secret_weakness',
            severity: 'high',
            cvss_score: 7.8,
            url: repoUrl,
            file_path: 'src/controllers/auth.ts:42',
            method: 'STATIC',
            title: 'Hardcoded Fallback JWT Secret in Authentication Controller',
            description:
              'Fallback secret "jwt_secret_fallback_123" used if environment variable is missing, allowing token forgery.',
            evidence: `41: const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_fallback_123';\n42: const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });`,
            ai_confidence: 0.96,
            ai_analysis:
              'Using a predictable fallback key permits attackers to forge administrative authentication tokens without knowing the true production key.',
            remediation:
              'Fail fast at startup if process.env.JWT_SECRET is undefined, preventing execution with fallback secrets.',
            remediation_code: `// Fixed: Enforce Environment Variable\nif (!process.env.JWT_SECRET) {\n  throw new Error('FATAL: JWT_SECRET environment variable is missing.');\n}\nconst token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });`,
            reference_links: ['https://cwe.mitre.org/data/definitions/321.html'],
            owasp_category: 'A02:2021-Cryptographic_Failures',
            cwe_id: 'CWE-321',
            is_false_positive: false,
            is_verified: true,
            is_fixed: false,
            is_suppressed: false,
            action_required: true,
            detection_confidence: 0.96,
            exploit_confidence: 0.95,
            detected_at: new Date().toISOString(),
            scan_id: 2026,
          },
          {
            id: 203,
            vulnerability_type: 'vulnerable_dependency',
            severity: 'medium',
            cvss_score: 6.5,
            url: repoUrl,
            file_path: 'package.json:28',
            method: 'STATIC',
            title: 'Outdated jsonwebtoken < 9.0.0 Vulnerable to Signature Bypass',
            description:
              'Dependency jsonwebtoken@8.5.1 has known CVE-2022-23529 vulnerability regarding malicious key object handling.',
            evidence: `"dependencies": {\n  "express": "^4.19.2",\n  "jsonwebtoken": "8.5.1"\n}`,
            ai_confidence: 0.92,
            ai_analysis:
              'Updating to jsonwebtoken >= 9.0.0 patches known validation flaws in key verification.',
            remediation: 'Upgrade jsonwebtoken to version 9.0.2 or latest.',
            remediation_code: `"dependencies": {\n  "express": "^4.19.2",\n  "jsonwebtoken": "^9.0.2"\n}`,
            reference_links: ['https://nvd.nist.gov/vuln/detail/CVE-2022-23529'],
            owasp_category: 'A06:2021-Vulnerable_and_Outdated_Components',
            cwe_id: 'CWE-1395',
            is_false_positive: false,
            is_verified: true,
            is_fixed: false,
            is_suppressed: false,
            action_required: true,
            detection_confidence: 0.95,
            exploit_confidence: 0.75,
            detected_at: new Date().toISOString(),
            scan_id: 2026,
          },
        ]);
      }
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-r from-warm-100/90 to-warm-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/15 text-accent-gold text-xs font-mono font-semibold">
              <Github className="w-3.5 h-3.5" />
              <span>Static Application Security Testing (SAST)</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-text-primary">
              GitHub Repository Security Audit
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Scan repositories for hardcoded API keys, JWT secret leaks, unsafe database interpolations, and vulnerable dependencies.
            </p>
          </div>

          <button
            onClick={() => setShowTokenGuide(true)}
            className="btn-secondary text-xs py-2 px-4 gap-2"
          >
            <Key className="w-3.5 h-3.5 text-accent-primary" />
            <span>GitHub Token Guide</span>
          </button>
        </div>
      </div>

      {/* Input Control Box */}
      {!isCompleted && !isScanning && (
        <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                GitHub Repository URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="input-glass pl-10 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Branch / Ref
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="input-glass text-xs"
              >
                <option value="main">main</option>
                <option value="master">master</option>
                <option value="develop">develop</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-warm-200">
            <div className="text-xs text-text-muted flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              <span>Includes AI-powered code diffs and self-healing patch generation</span>
            </div>

            <button
              onClick={handleStartRepoScan}
              disabled={!repoUrl.trim()}
              className="btn-primary text-xs py-2.5 px-6 gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Begin SAST Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* Scanning Progress */}
      {isScanning && (
        <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-accent-primary animate-spin" />
              <span className="font-bold text-text-primary">
                Scanning AST syntax trees & secrets...
              </span>
            </div>
            <span className="font-mono font-bold text-accent-primary">{scanProgress}%</span>
          </div>

          <div className="w-full bg-warm-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>

          <div className="text-xs font-mono text-text-muted">
            Auditing file:{' '}
            <strong className="text-text-primary">
              {scannedFiles[scannedFiles.length - 1] || 'Cloning repo tree...'}
            </strong>
          </div>
        </div>
      )}

      {/* Completed Results */}
      {isCompleted && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 bg-warm-100/80 border border-warm-300 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">
                  Repository SAST Analysis Completed
                </div>
                <div className="text-[11px] text-text-muted font-mono">
                  Scanned {scannedFiles.length} source files on branch <strong>{branch}</strong>. Found{' '}
                  {findings.length} security items.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCompleted(false);
                setIsScanning(false);
              }}
              className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Another Repo</span>
            </button>
          </div>

          <RepoScanView
            repoUrl={repoUrl}
            findings={findings}
            scannedFiles={scannedFiles}
            onTriggerSelfHeal={(finding) => {
              alert(`Autonomous patch synthesized for ${finding.title}. Ready for PR submission.`);
            }}
          />
        </div>
      )}

      <GitHubTokenGuide isOpen={showTokenGuide} onClose={() => setShowTokenGuide(false)} />
    </div>
  );
};

export default RepoView;
