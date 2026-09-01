export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type ThreatCategory =
  | 'Brute Force'
  | 'Credential Compromise'
  | 'Privilege Escalation'
  | 'Malware Activity'
  | 'Lateral Movement'
  | 'Suspicious Network Activity'
  | 'Data Exfiltration'
  | 'Reconnaissance'
  | 'Unknown / Needs Investigation';

export type EventStatus = 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'DETECTED' | 'UNKNOWN';

export interface NormalizedEvent {
  id: string;
  timestamp: string;
  source: string;
  event_type: string;
  severity: Severity;
  user: string;
  host: string;
  source_ip: string;
  destination_ip: string;
  process: string;
  action: string;
  status: EventStatus;
  message: string;
  raw_event: string;
  metadata: Record<string, any>;
  isSuspicious?: boolean;
  flaggedRules?: string[];
}

export interface SuspiciousFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  threatCategory: ThreatCategory;
  eventIds: string[];
  description: string;
  entities: {
    users: string[];
    hosts: string[];
    ips: string[];
    processes: string[];
  };
  timestamp: string;
  confidence: number;
}

export interface ResponseRecommendation {
  id: string;
  action: string;
  reason: string;
  priority: 'Immediate' | 'High' | 'Medium' | 'Low';
  potentialImpact: string;
  suggestedCommandOrPlaybook?: string;
  targetEntity?: string;
}

export interface MitigationActionState {
  id: string;
  actionTitle: string;
  targetEntity: string;
  priority: 'Immediate' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Executing' | 'Applied' | 'Reverted';
  appliedAt?: string;
  analystNotes?: string;
  commandSnippet?: string;
}

export interface MitreTacticInfo {
  tactic: string;
  techniqueId: string;
  techniqueName: string;
}

export interface RiskFactor {
  factor: string;
  scoreContribution: number;
  weight: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface CorrelatedIncident {
  id: string;
  title: string;
  threatCategory: ThreatCategory;
  severity: Severity;
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  status: 'Active' | 'Investigating' | 'Mitigated' | 'Closed';
  timestamp: string;
  firstSeen: string;
  lastSeen: string;
  executiveSummary: string;
  whySuspicious: string;
  attackSequence: string[];
  affectedEntities: {
    users: string[];
    hosts: string[];
    ips: string[];
    processes: string[];
  };
  correlatedEventIds: string[];
  evidenceEventIds: string[];
  mitreTactics: MitreTacticInfo[];
  riskFactors: RiskFactor[];
  agentReasoning: {
    logAgentAnalysis: string;
    threatAgentAssessment: string;
    investigationChain: string;
  };
  recommendations: ResponseRecommendation[];
  mitigationActions: MitigationActionState[];
}

export interface AgentActivityLog {
  id: string;
  agentName: 'Log Analysis Agent' | 'Threat Investigation Agent' | 'Incident Reporting Agent' | 'Orchestrator';
  stage: 'Ingestion' | 'Normalization' | 'Detection' | 'Correlation' | 'Reasoning' | 'Scoring' | 'Remediation' | 'Reporting';
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  timestamp: string;
  durationMs?: number;
  metrics?: Record<string, any>;
  details?: string;
}

export interface InvestigationResult {
  id: string;
  scenarioName?: string;
  ingestedCount: number;
  normalizedEvents: NormalizedEvent[];
  suspiciousFindings: SuspiciousFinding[];
  incidents: CorrelatedIncident[];
  agentLogs: AgentActivityLog[];
  processingMetrics: {
    totalTimeMs: number;
    logAgentTimeMs: number;
    threatAgentTimeMs: number;
    reportingTimeMs: number;
    eventsPerSec: number;
    rawLogSizeBytes: number;
  };
  aiPowered: boolean;
  timestamp: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  threatType: ThreatCategory;
  severity: Severity;
  shortDesc: string;
  description: string;
  sampleLogFormat: 'json' | 'csv' | 'jsonl' | 'syslog';
  sampleRawLog: string;
  expectedIncidents: number;
  targetEntities: string;
}
