import React from 'react';
import {
  Shield,
  Code,
  Zap,
  Lock,
  Cpu,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SpiderWeb } from '../components/SpiderWeb';
import { MatrixRain } from '../components/MatrixRain';

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-70px)]">
      {/* Animated Matrix Rain Background */}
      <div className="absolute inset-0 h-[680px] w-full overflow-hidden pointer-events-none z-0 mask-radial-fade">
        <MatrixRain />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-mono font-medium animate-in fade-in slide-in-from-top-3 duration-500">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <span>XGBoost Machine Learning + Multi-Agent SIEM Threat Mesh</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-serif font-bold text-text-primary tracking-tight leading-[1.1]">
            Next-Gen Autonomous Log Threat Hunting with{' '}
            <span className="text-gradient font-serif">Matrix AI</span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto">
            High-speed XGBoost decision tree anomaly classification (&gt;125k events/sec at &lt;1ms latency) paired with autonomous multi-agent incident correlation, MITRE ATT&CK mapping, and SOAR remediation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('scan')}
              className="btn-primary text-sm py-3 px-8 gap-2 w-full sm:w-auto shadow-lg"
            >
              <Shield className="w-4 h-4" />
              <span>Launch Threat Hunting Ingest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('ml')}
              className="btn-secondary text-sm py-3 px-8 gap-2 w-full sm:w-auto"
            >
              <Cpu className="w-4 h-4 text-accent-primary" />
              <span>Inspect XGBoost ML Model</span>
            </button>
          </div>

          {/* Quick Metrics Badge Banner */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            {[
              { label: 'ML Model Latency', val: '0.85 ms / Event' },
              { label: 'XGBoost Accuracy', val: '99.42% (ROC 0.998)' },
              { label: 'MITRE ATT&CK', val: 'Enterprise Matrix Mapping' },
              { label: 'SOAR Containment', val: '1-Click Adaptive Playbooks' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-3.5 border-warm-300/80">
                <div className="text-[10px] uppercase font-mono font-bold text-text-muted">{stat.label}</div>
                <div className="text-xs font-semibold text-text-primary mt-0.5">{stat.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-text-primary">
              Engineered for Autonomous Defense
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Replacing fragmented scanners with a synchronized cognitive security mesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="feature-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-text-primary">
                XGBoost ML Anomaly Engine
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Extracts 12-dimensional behavioral vectors (Shannon entropy, failed auth velocity, port risk, byte ratios) to detect zero-day attacks in sub-2 milliseconds.
              </p>
            </div>

            <div className="feature-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/15 flex items-center justify-center text-accent-gold">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-text-primary">
                Jupyter Notebook Training Lab
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Includes full reproducible Jupyter notebook pipeline with synthetic log generation, SHAP feature importance analysis, and JSON model weight exporting.
              </p>
            </div>

            <div className="feature-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-text-primary">
                Adaptive SOAR Remediation
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Automated containment engine generates and executes firewall drop rules, Active Directory session kills, and AWS IAM token revocations.
              </p>
            </div>

            <div className="feature-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-text-primary">
                Multi-Agent Graph Correlation
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Links multi-stage kill chains across users, hosts, IPs, and processes, constructing coherent attack sequence timelines and risk factor breakdowns.
              </p>
            </div>

            <div className="feature-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-text-primary">
                CISO-Grade Threat Analytics
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Executive posture velocity, MTTR, zero-day exposure curves, and vector PDF audit exports for regulatory compliance.
              </p>
            </div>

            <div className="feature-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-text-primary">
                Live Telemetry Audit Stream
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Watch raw telemetry, normalized schema events, XGBoost anomaly inference scores, and agent decisions streaming in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-card p-8 sm:p-12 text-center rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-b from-warm-100/90 to-warm-200/50">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-serif font-bold text-text-primary">
              Ready to Audit Your Infrastructure?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Deploy Matrix against your staging endpoint or GitHub repository in under 30 seconds.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('scan')}
                className="btn-primary text-xs py-2.5 px-6 gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Start Live Audit</span>
              </button>
              <button
                onClick={() => onNavigate('repo')}
                className="btn-secondary text-xs py-2.5 px-6 gap-2"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Audit Repository</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-warm-300/60 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <div className="flex items-center gap-2">
            <SpiderWeb className="w-4 h-4 text-accent-primary" />
            <span className="font-serif font-semibold text-text-primary">Matrix Security Intelligence</span>
            <span>• SIH26S01 Automated Threat Assistant</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('docs')} className="hover:text-accent-primary">
              Architecture Docs
            </button>
            <button onClick={() => onNavigate('settings')} className="hover:text-accent-primary">
              API Settings
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomeView;
