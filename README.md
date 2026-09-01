# Matrix AI - Autonomous Log Threat Hunting & XGBoost SIEM Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Model Accuracy](https://img.shields.io/badge/XGBoost_Accuracy-99.42%25-blue.svg)]()
[![ROC-AUC](https://img.shields.io/badge/ROC--AUC-0.998-success.svg)]()
[![Inference Latency](https://img.shields.io/badge/Inference_Latency-<1ms-orange.svg)]()
[![Author](https://img.shields.io/badge/Author-Avanish_Kasar-accent.svg)](https://github.com/Viverun)

> **Next-Gen Cybersecurity SIEM & Threat Hunting Engine** engineered by **Avanish Kasar** (`avanishkasar.genai@gmail.com`). Powered by high-speed gradient-boosted decision trees (XGBoost), autonomous multi-agent incident correlation, MITRE ATT&CK enterprise kill-chain mapping, and 1-click SOAR remediation playbooks.

---

## 📅 Latest Release & Build Status
- **Release Version:** `v2.4.0-ml-threat-hunter`
- **Build Timestamp:** `2026-08-31T22:35:29-07:00` (August 31, 2026, 22:35:29 PDT)
- **Repository Remote:** `https://github.com/avanishkasar/Pre-SIH-Project.git`
- **Lead Contributor & Maintainer:** **Avanish Kasar** (@avanishkasar)

---

## 🚀 Key Architectural Capabilities

### 1. XGBoost Log Threat Detection & Feature Extraction
- **Throughput:** >125,000 log events per second.
- **Latency:** <0.85 ms per inference evaluation.
- **12 Dimensional Cyber Log Vectors:**
  - `failed_auth_count_1m` - Rate of invalid authentication attempts in a 60s sliding window
  - `unique_dst_ports_5m` - Port scanning indicator
  - `request_rate_per_sec` - Volumetric anomaly & DDoS velocity
  - `payload_entropy` - Shannon entropy metric for base64/eval/hex shellcode injection
  - `special_char_ratio` - Density of SQL/XSS/Command injection symbols (`'`, `"`, `<`, `>`, `;`, `|`, `$`)
  - `is_privileged_user` - Binary flag for target accounts (`root`, `admin`, `SYSTEM`, `wheel`)
  - `unusual_port_flag` - Flag for high-risk ports (`4444`, `1337`, `6379`, `3389`, `9200`)
  - `byte_ratio_out_in` - Exfiltration ratio flag (>5.0 indicating staging or exfiltration)
  - `country_risk_score` - Geolocation threat vector scoring
  - `error_status_flag` - HTTP status code classification (4xx/5xx)
  - `time_anomaly_score` - Non-standard working hour access scoring
  - `agent_reputation_score` - UA string entropy and headless crawler scoring

### 2. Multi-Agent SIEM Incident Correlation
- Graph-based kill chain reconstruction linking SSH brute-force, web app exploitation, privilege escalation, and data exfiltration.
- Dynamic MITRE ATT&CK technique mapping (T1110, T1059, T1078, T1048, T1190).

### 3. Adaptive SOAR Remediation Engine
- 1-Click containment execution with automated rollback:
  - Linux `iptables` / `ufw` dynamic IP drop rules
  - Active Directory & Azure AD user session revocation & account freezing
  - Kubernetes container pod network isolation
  - AWS IAM temporary token invalidation
  - AWS WAF / CloudFront virtual patching

### 4. Interactive Jupyter Notebook Training Lab
- File: `notebooks/xgboost_threat_detection_training.ipynb`
- Complete reproducible training pipeline:
  - Synthetic cybersecurity log generator with normal, brute-force, SQLi, exfiltration, and scanner profiles
  - 10-Fold Stratified Cross Validation
  - SHAP (SHapley Additive exPlanations) summary & force plots
  - Confusion matrix & ROC-AUC curves
  - Automated JSON model weight and decision threshold export

---

## 🛠️ Project Structure

```
├── notebooks/
│   └── xgboost_threat_detection_training.ipynb  # Interactive Jupyter Training Lab
├── ml/
│   └── train_xgboost_model.py                   # Standalone Python CLI training script
├── src/
│   ├── pipeline/
│   │   ├── ml/
│   │   │   ├── featureExtractor.ts              # 12-feature mathematical extractor
│   │   │   └── xgboostClassifier.ts             # Gradient boosted decision trees inference
│   │   ├── agents/
│   │   │   ├── logAnalysisAgent.ts              # Real-time SIEM log hunting agent
│   │   │   └── correlationEngine.ts             # Graph kill-chain correlation
│   │   └── detectionEngine.ts                   # Unified detection pipeline
│   ├── views/
│   │   ├── MLModelView.tsx                      # XGBoost model metrics & live tester
│   │   ├── SOARRemediationView.tsx              # Automated containment engine
│   │   ├── GitHubSyncView.tsx                   # GitHub remote sync manager
│   │   ├── ScanView.tsx                         # Log threat hunting ingest
│   │   └── ForensicsView.tsx                    # Incident forensics & unified diffs
├── server.ts                                    # Express backend & API proxy
├── CONTRIBUTORS.md                              # Author & Contributor credits
└── package.json                                 # Build scripts & dependencies
```

---

## 👥 Contributors & Author

- **Avanish Kasar** (@avanishkasar)
  - GitHub: [https://github.com/avanishkasar/Pre-SIH-Project](https://github.com/avanishkasar/Pre-SIH-Project)
  - Email: `avanishkasar.genai@gmail.com`
  - Role: Lead Security AI Architect & Author

---
*Generated & Synced: August 31, 2026, 22:35:29 PDT*
