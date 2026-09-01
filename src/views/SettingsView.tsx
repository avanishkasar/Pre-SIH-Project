import React, { useState } from 'react';
import {
  Settings,
  Key,
  Cpu,
  Lock,
  Save,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { GitHubTokenGuide } from '../components/GitHubTokenGuide';

export const SettingsView: React.FC = () => {
  const [githubToken, setGithubToken] = useState('ghp_************************************');
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'idle' | 'validating'>('valid');
  const [aiModel, setAiModel] = useState('gemini-3.7-flash');
  const [maxConcurrency, setMaxConcurrency] = useState(8);
  const [wafDefault, setWafDefault] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleValidateToken = () => {
    setTokenStatus('validating');
    setTimeout(() => {
      setTokenStatus('valid');
    }, 800);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-r from-warm-100/90 to-warm-200/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-mono font-semibold">
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-text-primary">
            Settings & Integration Keys
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
            Configure GitHub API tokens, Gemini AI models, WAF evasion defaults, and scanning concurrency.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* GitHub Token Config */}
        <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="w-5 h-5 text-accent-primary" />
              <div>
                <h3 className="text-sm font-serif font-bold text-text-primary">
                  GitHub Personal Access Token
                </h3>
                <p className="text-xs text-text-muted">
                  Used for SAST static repository scanning and private codebase audits
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(true)}
              className="text-xs text-accent-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Setup Guide</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => {
                setGithubToken(e.target.value);
                setTokenStatus('idle');
              }}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="input-glass font-mono text-xs flex-1"
            />
            <button
              onClick={handleValidateToken}
              disabled={tokenStatus === 'validating'}
              className="btn-secondary text-xs py-2 px-4 whitespace-nowrap"
            >
              {tokenStatus === 'validating' ? 'Checking...' : 'Validate Token'}
            </button>
          </div>

          {tokenStatus === 'valid' && (
            <div className="text-xs text-emerald-700 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Token Active • Rate Limit: 5,000 req/hr • Scopes: repo, read:packages</span>
            </div>
          )}
        </div>

        {/* AI Model Configuration */}
        <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-accent-primary" />
            <div>
              <h3 className="text-sm font-serif font-bold text-text-primary">
                Gemini Cognitive Reasoning Engine
              </h3>
              <p className="text-xs text-text-muted">
                Select the Google GenAI model powering exploit analysis and self-healing patch generation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'gemini-3.7-flash',
                title: 'Gemini 3.7 Flash (Default)',
                desc: 'Sub-second reasoning latency • High throughput • Best for live scans',
              },
              {
                id: 'gemini-3.1-pro-preview',
                title: 'Gemini 3.1 Pro Preview',
                desc: 'Deep multi-stage code analysis • Advanced zero-day reasoning',
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAiModel(m.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  aiModel === m.id
                    ? 'ring-2 ring-accent-primary bg-accent-primary/10 border-accent-primary'
                    : 'bg-warm-100/50 border-warm-300'
                }`}
              >
                <div className="font-semibold text-xs text-text-primary">{m.title}</div>
                <div className="text-[10px] text-text-muted mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scanner Engine Defaults */}
        <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-4">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-accent-primary" />
            <div>
              <h3 className="text-sm font-serif font-bold text-text-primary">
                Scan Engine Defaults & Concurrency
              </h3>
              <p className="text-xs text-text-muted">
                Global parameters for autonomous probing threads
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Max Concurrent Agents
              </label>
              <select
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(Number(e.target.value))}
                className="input-glass text-xs"
              >
                <option value={4}>4 Concurrent Agents</option>
                <option value={8}>8 Concurrent Agents (Recommended)</option>
                <option value={16}>16 Concurrent Agents (High Speed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Default WAF Evasion Probing
              </label>
              <select
                value={wafDefault ? 'enabled' : 'disabled'}
                onChange={(e) => setWafDefault(e.target.value === 'enabled')}
                className="input-glass text-xs"
              >
                <option value="enabled">Enabled by default</option>
                <option value="disabled">Disabled by default</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 font-mono">
              <Check className="w-4 h-4" /> Preferences saved successfully.
            </span>
          ) : (
            <span className="text-xs text-text-muted">
              Changes apply immediately to new scan sessions.
            </span>
          )}

          <button
            onClick={handleSave}
            className="btn-primary text-xs py-2.5 px-6 gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      <GitHubTokenGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};

export default SettingsView;
