import React from 'react';
import { X, ExternalLink, ShieldCheck, Key, CheckCircle2, AlertCircle } from 'lucide-react';

interface GitHubTokenGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubTokenGuide: React.FC<GitHubTokenGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-xl w-full p-6 shadow-2xl border border-warm-300 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-warm-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-text-primary">
                GitHub Token Configuration Guide
              </h3>
              <p className="text-xs text-text-muted">
                Required for scanning private repositories & high rate limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-text-secondary leading-relaxed">
          <div className="bg-warm-100/70 p-3.5 rounded-xl border border-warm-200 space-y-2">
            <div className="font-semibold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-primary" />
              Minimal Security Permissions Required:
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-text-secondary">
              <li>
                <strong className="text-text-primary">Repository Permissions:</strong> Read access to code and metadata (`repo` scope or fine-grained `Contents: Read`)
              </li>
              <li>
                <strong className="text-text-primary">Public Repos:</strong> No special token needed, but adding a token avoids GitHub API rate limiting (60 req/hr vs 5,000 req/hr)
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-text-primary">Quick Setup Steps:</h4>
            <ol className="space-y-2 pl-4 list-decimal">
              <li>Navigate to GitHub <strong>Settings → Developer Settings → Personal access tokens</strong></li>
              <li>Select <strong>Tokens (classic)</strong> or <strong>Fine-grained tokens</strong></li>
              <li>Set a token name like <code className="bg-warm-200 px-1.5 py-0.5 rounded text-accent-primary">Matrix Security Scanner</code></li>
              <li>Check the <code className="bg-warm-200 px-1.5 py-0.5 rounded text-accent-primary">repo</code> scope for private repos, or <code className="bg-warm-200 px-1.5 py-0.5 rounded text-accent-primary">public_repo</code> for public audits</li>
              <li>Generate the token, copy the secret string (`ghp_...`), and paste it into Matrix Settings</li>
            </ol>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:underline"
            >
              <span>Open GitHub Token Generator</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="btn-primary text-xs py-2 px-4"
            >
              Got it, close guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
