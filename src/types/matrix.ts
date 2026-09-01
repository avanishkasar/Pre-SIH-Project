export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  company?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Scan {
  id: number;
  target_url: string;
  target_name?: string;
  scan_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  total_vulnerabilities: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  technology_stack: string[];
  agents_enabled: string[];
  scanned_files?: string[];
  enable_waf_evasion: boolean;
  waf_evasion_consent: boolean;
  custom_headers: Record<string, string> | null;
  custom_cookies: Record<string, string> | null;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface Vulnerability {
  id: number;
  vulnerability_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss_score?: number;
  url: string;
  file_path?: string;
  parameter?: string;
  method: string;
  title: string;
  description: string;
  evidence?: string;
  ai_confidence: number;
  ai_analysis?: string;
  remediation?: string;
  remediation_code?: string;
  reference_links: string[];
  owasp_category?: string;
  cwe_id?: string;
  is_false_positive: boolean;
  is_verified: boolean;
  is_fixed: boolean;
  is_suppressed: boolean;
  suppression_reason?: string;
  final_verdict?: string;
  action_required: boolean;
  detection_confidence: number;
  exploit_confidence: number;
  scope_impact?: {
    affected_endpoints: number;
    affected_methods: string[];
    is_systemic: boolean;
    summary: string;
    description?: string;
  };
  detected_by?: string;
  detected_at: string;
  scan_id: number;
}

export interface ForensicArtifact {
  id: string;
  scan_id: number;
  type: 'payload_capture' | 'header_tamper' | 'sql_trace' | 'jwt_leak' | 'secret_finding';
  title: string;
  timestamp: string;
  target: string;
  status: 'raw' | 'analyzed' | 'healed';
  raw_evidence: string;
  ai_analysis: string;
  mitigation_patch?: string;
  remediation_status?: 'pending' | 'applied';
}
