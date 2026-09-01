import React, { useState } from 'react';
import {
  Terminal,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2,
  FileDown,
  ChevronRight,
  Zap,
  RotateCw,
  Cpu,
  Layers,
  Code2,
  Search,
} from 'lucide-react';
import { ForensicArtifact } from '../types/matrix';

export const ForensicsView: React.FC = () => {
  const [artifacts, setArtifacts] = useState<ForensicArtifact[]>([
    {
      id: 'ART-901',
      scan_id: 1042,
      type: 'payload_capture',
      title: 'PostgreSQL UNION Blind Injection Payload',
      timestamp: '2026-08-31 22:40:12 UTC',
      target: 'https://staging.internal/api/v1/users',
      status: 'analyzed',
      raw_evidence: `GET /api/v1/users?id=1%27%20UNION%20SELECT%20null,version(),current_user--%20 HTTP/1.1\nHost: staging.internal\nUser-Agent: Matrix/3.4 SecurityProbe\nAccept: application/json\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n[{"id":null,"name":"PostgreSQL 15.4 on x86_64","email":"postgres"}]`,
      ai_analysis:
        'The query handler executes dynamic concatenation in `src/db/queries.ts:28`. Attacker is able to dump system tables and active database roles with root privileges.',
      mitigation_patch: `// Self-Healing Automated Fix\nexport async function getUserById(id: number) {\n  return db.query('SELECT id, name, email FROM users WHERE id = $1', [id]);\n}`,
      remediation_status: 'pending',
    },
    {
      id: 'ART-902',
      scan_id: 1042,
      type: 'jwt_leak',
      title: 'Predictable JWT Signing Secret & Algorithm Confusion',
      timestamp: '2026-08-31 22:41:05 UTC',
      target: 'https://staging.internal/auth/login',
      status: 'healed',
      raw_evidence: `Header: {"alg": "none", "typ": "JWT"}\nPayload: {"userId": 1, "role": "superadmin", "exp": 1756700000}\nSignature: (empty)`,
      ai_analysis:
        'The JWT verification middleware does not specify `algorithms: ["HS256"]`, allowing token payloads with `alg: "none"` to bypass cryptographic validation.',
      mitigation_patch: `// Self-Healing Automated Fix\nconst decoded = jwt.verify(token, process.env.JWT_SECRET, {\n  algorithms: ['HS256'],\n  complete: false\n});`,
      remediation_status: 'applied',
    },
    {
      id: 'ART-903',
      scan_id: 1041,
      type: 'secret_finding',
      title: 'Exposed AWS Access Key in Git History',
      timestamp: '2026-08-31 21:15:30 UTC',
      target: 'https://github.com/organization/core-service',
      status: 'analyzed',
      raw_evidence: `commit a8f9c12b7e\nAuthor: dev <dev@company.com>\nDate:   Fri Aug 28 14:22:01 2026\n\n- AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n+ AWS_ACCESS_KEY_ID=process.env.AWS_KEY`,
      ai_analysis:
        'Even though modified in newer commits, the AWS credential remains retrievable through Git revision logs (`git log -S AKIAIOS...`).',
      mitigation_patch: `// Remediation Protocol:\n1. Revoke IAM credential in AWS Console\n2. Run 'git filter-repo --invert-paths --path .env'\n3. Force-push rewritten history`,
      remediation_status: 'pending',
    },
  ]);

  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(artifacts[0].id);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const selected = artifacts.find((a) => a.id === selectedArtifactId) || artifacts[0];

  const handleApplyHeal = (id: string) => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setArtifacts((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: 'healed', remediation_status: 'applied' }
            : a
        )
      );
      setIsSynthesizing(false);
    }, 1200);
  };

  const handleExportEvidenceBundle = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(artifacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `matrix_forensic_bundle_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-r from-warm-100/90 to-warm-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 text-xs font-mono font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Evidence Reconstruction & Auto-Remediation</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-text-primary">
              Forensics & Autonomous Self-Healing
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Inspect captured network artifacts, replay attack telemetry, and synthesize instant AI security patches to immunize codebases.
            </p>
          </div>

          <button
            onClick={handleExportEvidenceBundle}
            className="btn-secondary text-xs py-2 px-4 gap-2"
          >
            <FileDown className="w-3.5 h-3.5 text-accent-primary" />
            <span>Export Forensic Bundle (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Artifact Explorer & Deep Forensic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Artifacts List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center justify-between">
            <span>Captured Artifacts ({artifacts.length})</span>
            <span className="font-mono text-[10px]">SOAR Log Stream</span>
          </div>

          {artifacts.map((art) => {
            const isSelected = art.id === selectedArtifactId;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArtifactId(art.id)}
                className={`glass-card p-4 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'ring-2 ring-accent-primary border-accent-primary bg-warm-100/80 shadow-md'
                    : 'border-warm-300 hover:border-accent-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                    {art.id}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      art.status === 'healed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {art.status}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-text-primary mt-2">{art.title}</h4>
                <div className="text-[10px] text-text-muted mt-1 font-mono truncate">{art.target}</div>

                <div className="flex items-center justify-between text-[10px] text-text-muted mt-3 pt-2 border-t border-warm-200">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {art.timestamp}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-accent-primary" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Forensic Inspector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-warm-200">
              <div>
                <span className="text-[10px] font-mono uppercase text-accent-primary font-bold">
                  Forensic Dossier #{selected.id}
                </span>
                <h3 className="text-lg font-serif font-bold text-text-primary mt-0.5">
                  {selected.title}
                </h3>
              </div>

              {selected.remediation_status === 'applied' ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Patch Applied
                </span>
              ) : (
                <button
                  onClick={() => handleApplyHeal(selected.id)}
                  disabled={isSynthesizing}
                  className="btn-primary text-xs py-2 px-4 gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Self-Healing Patch'}</span>
                </button>
              )}
            </div>

            {/* Raw Artifact Payload Terminal */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-accent-primary" />
                <span>Raw Captured Network Payload / Socket Trace</span>
              </div>
              <pre className="terminal text-xs overflow-x-auto whitespace-pre-wrap select-text">
                {selected.raw_evidence}
              </pre>
            </div>

            {/* AI Threat Assessment */}
            <div className="p-4 bg-accent-primary/5 rounded-xl border border-accent-primary/20 space-y-1.5">
              <div className="text-xs font-semibold text-accent-primary flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-accent-gold" />
                <span>Matrix AI Cognitive Kill-Chain Analysis</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {selected.ai_analysis}
              </p>
            </div>

            {/* Automated Code Patch */}
            {selected.mitigation_patch && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Generated Immunization Patch</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#2C2416] text-[#7EC699] font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {selected.mitigation_patch}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicsView;
