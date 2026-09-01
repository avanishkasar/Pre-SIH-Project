import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  RotateCcw,
  Copy,
  Terminal,
  Server,
  Lock,
  UserX,
  Radio,
  FileCheck,
  AlertTriangle,
  Play,
  ArrowRight,
} from 'lucide-react';
import { MitigationActionState } from '../types';

export const SOARRemediationView: React.FC = () => {
  const [actions, setActions] = useState<MitigationActionState[]>([
    {
      id: 'SOAR-ACT-01',
      actionTitle: 'Firewall IP Quarantine & Drop Rule',
      targetEntity: '198.51.100.42',
      priority: 'Immediate',
      status: 'Applied',
      appliedAt: '2026-08-31 20:30:14 UTC',
      analystNotes: 'Automated response: Blocked malicious external IP responsible for SSH brute-force attack burst.',
      commandSnippet: 'iptables -A INPUT -s 198.51.100.42 -j DROP && ufw deny from 198.51.100.42',
    },
    {
      id: 'SOAR-ACT-02',
      actionTitle: 'Revoke Active Directory User Session & Freeze Account',
      targetEntity: 'root / administrator',
      priority: 'Immediate',
      status: 'Pending',
      analystNotes: 'Compromised admin account credentials detected in memory dump.',
      commandSnippet: 'Revoke-AzureADUserAllRefreshToken -ObjectId "root-admin-01" && Disable-ADAccount -Identity "root-admin-01"',
    },
    {
      id: 'SOAR-ACT-03',
      actionTitle: 'Isolate Compromised Kubernetes Container Pod',
      targetEntity: 'pod/auth-service-7d89b',
      priority: 'High',
      status: 'Executing',
      analystNotes: 'Container detected executing unauthorized base64 child processes.',
      commandSnippet: 'kubectl label pod auth-service-7d89b quarantine=true --overwrite && kubectl isolate pod auth-service-7d89b',
    },
    {
      id: 'SOAR-ACT-04',
      actionTitle: 'Revoke AWS IAM Temporary Credentials',
      targetEntity: 'arn:aws:iam::123456789012:role/DevSecOpsAdmin',
      priority: 'High',
      status: 'Pending',
      analystNotes: 'High volume of GetCallerIdentity calls from unfamiliar geolocation.',
      commandSnippet: 'aws iam put-role-policy --role-name DevSecOpsAdmin --policy-name RevokeOldSessions --policy-document file://revoke-policy.json',
    },
    {
      id: 'SOAR-ACT-05',
      actionTitle: 'Deploy WAF Rate-Limit & Virtual Patch for JNDI/Log4j',
      targetEntity: 'CloudFront-WAF-Prod',
      priority: 'Medium',
      status: 'Pending',
      analystNotes: 'Block incoming requests containing ${jndi: token patterns.',
      commandSnippet: 'aws wafv2 update-rule-group --scope REGIONAL --name Log4jVirtualPatch --rules file://waf-rules.json',
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleExecuteAction = (id: string) => {
    setActions((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          return {
            ...act,
            status: 'Applied',
            appliedAt: new Date().toISOString(),
          };
        }
        return act;
      })
    );
  };

  const handleRevertAction = (id: string) => {
    setActions((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          return {
            ...act,
            status: 'Reverted',
            appliedAt: undefined,
          };
        }
        return act;
      })
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-warm-300/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-mono font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous SOAR Playbook Execution</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
            Adaptive SOAR Remediation Engine
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Autonomous threat containment actions synthesized from XGBoost ML detections and incident correlation kill chains.
            Execute zero-day containment playbooks with 1-click execution or export native CLI scripts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActions((prev) =>
                prev.map((a) => ({
                  ...a,
                  status: 'Applied',
                  appliedAt: new Date().toISOString(),
                }))
              );
            }}
            className="btn-primary text-xs py-2.5 px-4 gap-2 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply All Pending Actions</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-1 border-warm-300/80">
          <div className="text-[11px] font-mono uppercase text-text-muted">Active Containments</div>
          <div className="text-2xl font-bold font-serif text-accent-primary">
            {actions.filter((a) => a.status === 'Applied').length}
          </div>
          <div className="text-[10px] text-accent-primary font-mono">Real-time enforcement</div>
        </div>

        <div className="glass-card p-4 space-y-1 border-warm-300/80">
          <div className="text-[11px] font-mono uppercase text-text-muted">Pending Actions</div>
          <div className="text-2xl font-bold font-serif text-amber-600">
            {actions.filter((a) => a.status === 'Pending').length}
          </div>
          <div className="text-[10px] text-amber-600 font-mono">Requires Analyst Review</div>
        </div>

        <div className="glass-card p-4 space-y-1 border-warm-300/80">
          <div className="text-[11px] font-mono uppercase text-text-muted">Mean Time to Remediate</div>
          <div className="text-2xl font-bold font-serif text-text-primary">1.4 min</div>
          <div className="text-[10px] text-text-muted font-mono">vs 4.2 hrs industry avg</div>
        </div>

        <div className="glass-card p-4 space-y-1 border-warm-300/80">
          <div className="text-[11px] font-mono uppercase text-text-muted">Automated Rollback</div>
          <div className="text-2xl font-bold font-serif text-text-primary">Supported</div>
          <div className="text-[10px] text-text-muted font-mono">Zero side-effect policy</div>
        </div>
      </div>

      {/* Action Playbook List */}
      <div className="space-y-4">
        {actions.map((act) => (
          <div
            key={act.id}
            className="glass-card p-6 border-warm-300/80 space-y-4 hover:border-accent-primary/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-accent-primary">{act.id}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      act.priority === 'Immediate'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : act.priority === 'High'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-warm-200 text-text-secondary'
                    }`}
                  >
                    {act.priority} Priority
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      act.status === 'Applied'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : act.status === 'Executing'
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        : act.status === 'Reverted'
                        ? 'bg-warm-200 text-text-muted'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    Status: {act.status}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-text-primary">{act.actionTitle}</h3>
              </div>

              <div className="flex items-center gap-2">
                {act.status !== 'Applied' ? (
                  <button
                    onClick={() => handleExecuteAction(act.id)}
                    className="btn-primary text-xs py-2 px-3.5 gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Playbook</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRevertAction(act.id)}
                    className="btn-secondary text-xs py-2 px-3.5 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rollback</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs text-text-secondary">
              <span className="font-mono font-semibold text-text-primary">Target Entity:</span>{' '}
              <code className="px-2 py-0.5 bg-warm-200 rounded text-accent-primary font-mono font-bold">
                {act.targetEntity}
              </code>
            </div>

            {act.analystNotes && (
              <p className="text-xs text-text-muted italic bg-warm-100/60 p-3 rounded-xl border border-warm-300/40">
                "{act.analystNotes}"
              </p>
            )}

            {act.commandSnippet && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-mono text-text-muted">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-accent-primary" /> Generated Automation Script
                  </span>
                  <button
                    onClick={() => copyToClipboard(act.commandSnippet || '', act.id)}
                    className="hover:text-accent-primary flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedId === act.id ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>
                <pre className="p-3 bg-warm-200/70 rounded-xl font-mono text-xs text-text-primary overflow-x-auto">
                  {act.commandSnippet}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
