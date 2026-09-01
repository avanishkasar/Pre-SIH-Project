import React from 'react';
import {
  Shield,
  Code,
  Activity,
  Terminal,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Lock,
  Search,
  BookOpen,
} from 'lucide-react';
import { SpiderWeb } from '../components/SpiderWeb';

interface HubViewProps {
  onNavigate: (view: string) => void;
}

export const HubView: React.FC<HubViewProps> = ({ onNavigate }) => {
  const hubs = [
    {
      id: 'scan',
      title: 'Security Scanner',
      subtitle: 'Dynamic Web Application Penetration Testing',
      desc: 'Probe targets with 8 autonomous agents, bypassing WAFs, mapping attack surfaces, and capturing live exploit evidence.',
      icon: Shield,
      badge: 'DAST Engine',
      color: 'from-accent-primary to-[#3D7A62]',
      iconColor: 'text-accent-primary',
      bgLight: 'bg-accent-primary/10',
    },
    {
      id: 'repo',
      title: 'Repository Analysis',
      subtitle: 'Static Application Security Testing (SAST)',
      desc: 'Analyze GitHub repositories for hardcoded API keys, JWT secrets, unsafe queries, and vulnerable open-source dependencies.',
      icon: Code,
      badge: 'SAST Audit',
      color: 'from-amber-600 to-amber-700',
      iconColor: 'text-amber-700',
      bgLight: 'bg-amber-500/10',
    },
    {
      id: 'forensics',
      title: 'Forensics & Self-Healing',
      subtitle: 'Evidence Reconstruction & Patch Synthesis',
      desc: 'Inspect network payloads, reconstruct multi-stage kill chains, and synthesize AI-generated unified diff fixes via Gemini 3.7.',
      icon: Terminal,
      badge: 'Autonomous Patch',
      color: 'from-blue-600 to-blue-700',
      iconColor: 'text-blue-600',
      bgLight: 'bg-blue-500/10',
    },
    {
      id: 'analytics',
      title: 'Analytics & Past Reports',
      subtitle: 'CISO Intelligence & Compliance Metrics',
      desc: 'Review historical scans, track vulnerability reduction over time, and export executive vector PDF audit dossiers.',
      icon: Activity,
      badge: 'Compliance & Trends',
      color: 'from-emerald-600 to-teal-700',
      iconColor: 'text-emerald-700',
      bgLight: 'bg-emerald-500/10',
    },
  ];

  const agents = [
    { name: 'Reconnaissance Agent', type: 'Surface & Port Discovery', status: 'Standby' },
    { name: 'SQL Injection Agent', type: 'Error & Time-Based Probe', status: 'Standby' },
    { name: 'XSS Vector Agent', type: 'DOM & Reflected Sanitizer', status: 'Standby' },
    { name: 'CSRF & Token Agent', type: 'SameSite & Anti-CSRF Check', status: 'Standby' },
    { name: 'SSRF & Cloud Metadata', type: 'Internal Pivot Hunter', status: 'Standby' },
    { name: 'Command Injection', type: 'OS & Process Fuzzing', status: 'Standby' },
    { name: 'Auth & Session Agent', type: 'JWT & Broken Object Ref', status: 'Standby' },
    { name: 'API Security Agent', type: 'GraphQL & REST Endpoint Fuzzer', status: 'Standby' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-warm-300 relative overflow-hidden bg-gradient-to-r from-warm-100/90 to-warm-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-mono font-semibold">
              <SpiderWeb className="w-3.5 h-3.5" />
              <span>Matrix Control Matrix</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary">
              Deep Into The Matrix
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
              Select an investigation module below to initiate autonomous threat probing, inspect repository codebases, or review executive vulnerability intelligence.
            </p>
          </div>

          <button
            onClick={() => onNavigate('scan')}
            className="btn-primary text-xs py-3 px-6 gap-2 shadow-md"
          >
            <Shield className="w-4 h-4" />
            <span>Launch Quick Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Feature Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hubs.map((hub) => (
          <div
            key={hub.id}
            onClick={() => onNavigate(hub.id)}
            className="feature-card group cursor-pointer border border-warm-300 hover:border-accent-primary/50 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${hub.bgLight} flex items-center justify-center ${hub.iconColor} group-hover:scale-105 transition-transform`}>
                  <hub.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-warm-200/80 text-text-muted">
                  {hub.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                  {hub.title}
                </h3>
                <h4 className="text-xs font-semibold text-text-muted mt-0.5">
                  {hub.subtitle}
                </h4>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {hub.desc}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-warm-200/70 flex items-center justify-between text-xs font-semibold text-accent-primary group-hover:translate-x-1 transition-transform">
              <span>Open Module</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Autonomous Mesh Status */}
      <div className="glass-card p-6 rounded-2xl border-warm-300 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-accent-primary" />
            <div>
              <h3 className="text-base font-serif font-bold text-text-primary">
                Autonomous Security Mesh Architecture
              </h3>
              <p className="text-[11px] text-text-muted">
                8 specialized AI agents actively synchronized for parallel vulnerability verification
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('docs')}
            className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Agentic Specs</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {agents.map((agent, idx) => (
            <div key={idx} className="p-3 bg-warm-100/60 rounded-xl border border-warm-200">
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-mono text-emerald-700 font-semibold uppercase">
                  {agent.status}
                </span>
              </div>
              <div className="font-semibold text-xs text-text-primary mt-1.5 truncate">
                {agent.name}
              </div>
              <div className="text-[10px] text-text-muted truncate mt-0.5">
                {agent.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HubView;
