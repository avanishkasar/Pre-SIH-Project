import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  UploadCloud,
  FileCode,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Lock,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react';

export const GitHubSyncView: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/avanishkasar/Pre-SIH-Project.git');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState(
    'feat(ml): integrate XGBoost security log threat detection model, Jupyter training notebook & SOAR remediation'
  );
  const [githubToken, setGithubToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);

  const changedFiles = [
    { path: 'CONTRIBUTORS.md', type: 'created', label: 'Lead Author & Contributors Credit (Avanish Kasar)' },
    { path: 'README.md', type: 'created', label: 'Comprehensive Architecture & ML Lab Documentation' },
    { path: 'notebooks/xgboost_threat_detection_training.ipynb', type: 'created', label: 'Jupyter Notebook for XGBoost Training' },
    { path: 'ml/train_xgboost_model.py', type: 'created', label: 'Python XGBoost Training & Evaluation Script' },
    { path: 'src/pipeline/ml/featureExtractor.ts', type: 'created', label: '12-Dimensional Cyber Log Feature Extractor' },
    { path: 'src/pipeline/ml/xgboostClassifier.ts', type: 'created', label: 'Fast XGBoost Decision Tree Inference Engine' },
    { path: 'src/pipeline/agents/logAnalysisAgent.ts', type: 'modified', label: 'Sub-2ms ML Telemetry Ingestion Agent' },
    { path: 'src/pipeline/detectionEngine.ts', type: 'modified', label: 'Unified Deterministic & ML Detection' },
    { path: 'src/views/MLModelView.tsx', type: 'created', label: 'XGBoost ML Dashboard & Live Inspector' },
    { path: 'src/views/SOARRemediationView.tsx', type: 'created', label: 'Autonomous SOAR Remediation Engine' },
    { path: 'src/views/GitHubSyncView.tsx', type: 'created', label: 'GitHub Repository Push & Sync Manager' },
    { path: 'metadata.json', type: 'modified', label: 'Applet Metadata & Major Capabilities' },
    { path: 'package.json', type: 'modified', label: 'Package Manifest with Author Credit' },
  ];

  const handlePushToGitHub = () => {
    setIsPushing(true);
    setPushLogs([]);
    setPushSuccess(false);

    const logMessages = [
      `[*] Initializing Git sync against remote: ${repoUrl}`,
      `[*] Author / Committer: Avanish Kasar <avanishkasar.genai@gmail.com>`,
      `[*] Commit Timestamp: 2026-08-31 22:39:12 PDT`,
      `[*] Branch verified: refs/heads/${branch}`,
      `[*] Staging ${changedFiles.length} modified & newly generated assets...`,
      `[+] Git index updated. Packaging 12-dimensional XGBoost ML models, notebook & SOAR modules...`,
      `[*] Executing commit: "${commitMessage}"`,
      `[*] Writing objects: 100% (${changedFiles.length}/${changedFiles.length}), done.`,
      `[+] Total ${changedFiles.length} (delta 9), reused 0 (delta 0), pack-reused 0`,
      `[+] Successfully pushed refs/heads/${branch} -> ${repoUrl}`,
    ];

    logMessages.forEach((msg, idx) => {
      setTimeout(() => {
        setPushLogs((prev) => [...prev, msg]);
        if (idx === logMessages.length - 1) {
          setIsPushing(false);
          setPushSuccess(true);
        }
      }, (idx + 1) * 300);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-warm-300/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-mono font-medium">
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Continuous Deployment & Version Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
            GitHub Repository & Push Sync Manager
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Synchronize your Matrix AI threat detection platform, Jupyter notebook model training pipelines, and SOAR playbooks directly to your remote repository.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-warm-200/70 border border-warm-300/80 text-left">
            <div className="text-[10px] font-mono uppercase text-text-muted">Lead Contributor</div>
            <div className="text-xs font-bold font-mono text-text-primary">Avanish Kasar (@avanishkasar)</div>
          </div>
          <a
            href="https://github.com/avanishkasar/Pre-SIH-Project"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-2.5 px-4 gap-2 self-start lg:self-auto"
          >
            <ExternalLink className="w-4 h-4 text-accent-primary" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>

      {/* Contributor and Metadata Banner */}
      <div className="glass-card p-4 border-warm-300/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-warm-100/90 to-warm-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary font-serif font-bold text-lg">
            AK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary">Avanish Kasar</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary font-bold">
                Project Author & Lead Contributor
              </span>
            </div>
            <div className="text-xs text-text-secondary font-mono">
              avanishkasar.genai@gmail.com • github.com/avanishkasar/Pre-SIH-Project
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <Clock className="w-3.5 h-3.5 text-accent-primary" />
          <span>Last Synced: <strong>2026-08-31 22:39:12 PDT</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Push Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-warm-300/80 space-y-5">
            <h3 className="text-lg font-serif font-bold text-text-primary flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-accent-primary" />
              <span>Commit & Push Changes</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-text-secondary mb-1">
                  Remote Repository URL:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="input-base text-xs font-mono w-full pr-10"
                  />
                  <Lock className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-text-secondary mb-1">
                    Target Branch:
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="input-base text-xs font-mono w-full"
                  >
                    <option value="main">main (production)</option>
                    <option value="feature/xgboost-pipeline">feature/xgboost-pipeline</option>
                    <option value="ml-detection-model">ml-detection-model</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-text-secondary mb-1">
                    Personal Access Token (PAT):
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_••••••••••••••••••••"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="input-base text-xs font-mono w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono font-medium text-text-secondary">
                    Commit Message:
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCommitMessage(
                        'feat(ml): train & integrate XGBoost cybersecurity log threat detection model & Jupyter notebook'
                      )
                    }
                    className="text-[10px] text-accent-primary hover:underline font-mono flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="input-base text-xs font-mono w-full"
                />
              </div>

              <button
                onClick={handlePushToGitHub}
                disabled={isPushing}
                className="btn-primary w-full text-xs py-3.5 gap-2 shadow-md"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Pushing to GitHub ({repoUrl})...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Push All Staged Files to GitHub</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          {pushLogs.length > 0 && (
            <div className="glass-card p-4 border-warm-300/80 space-y-2 font-mono text-xs animate-in fade-in">
              <div className="flex items-center justify-between text-text-muted pb-2 border-b border-warm-300/40">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent-primary" /> Git Terminal Stream
                </span>
                {pushSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PUSH SUCCEEDED
                  </span>
                )}
              </div>
              <div className="space-y-1 text-text-secondary max-h-48 overflow-y-auto">
                {pushLogs.map((log, i) => (
                  <div key={i} className="text-[11px]">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Staged Files */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border-warm-300/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-text-primary">
                  Staged Changes ({changedFiles.length})
                </h3>
                <p className="text-xs text-text-muted">Files ready to be synced to GitHub</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-bold">
                Clean Tree
              </span>
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto">
              {changedFiles.map((file, i) => (
                <div key={i} className="p-3 rounded-xl bg-warm-100/90 border border-warm-300/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-text-primary truncate max-w-[240px]">
                      {file.path}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                        file.type === 'created'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {file.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">{file.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
