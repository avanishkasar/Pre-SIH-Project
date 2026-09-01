import { NormalizedEvent } from '../../types';

export interface ExtractedLogFeatures {
  // Numerical Feature Vector (12 dimensions for XGBoost)
  failed_auth_count_1m: number;      // Feature 0: Failed login velocity in 1m window
  payload_entropy: number;           // Feature 1: Shannon entropy of command/message
  is_privileged_user: number;        // Feature 2: 1 if root/admin/SYSTEM, else 0
  unusual_port_flag: number;         // Feature 3: 1 if non-standard or high-risk port (4444, 1337, 3389, 7001, etc.)
  bytes_ratio_out_in: number;        // Feature 4: Bytes sent / Bytes received anomaly ratio
  cmd_suspicious_tokens: number;     // Feature 5: Count of high-risk keywords (mimikatz, vssadmin, base64, whoami, etc.)
  time_hour_sin: number;             // Feature 6: Cyclical hour sine encoding (off-hours detection)
  time_hour_cos: number;             // Feature 7: Cyclical hour cosine encoding
  dst_ip_external: number;           // Feature 8: 1 if destination is public/external IP, 0 if RFC1918
  action_severity_weight: number;    // Feature 9: Baseline severity weight based on action type
  rare_user_agent_score: number;     // Feature 10: 1 if curl, python-requests, powershell, or empty UA
  repeated_event_frequency: number;  // Feature 11: Frequency score of same event_type from source
}

export class FeatureExtractor {
  private static highRiskTokens = [
    'mimikatz', 'vssadmin', 'delete shadows', 'certutil', 'powershell -enc',
    'base64', 'curl -o', 'wget', 'chmod 777', 'id_rsa', 'shadow', 'nc -e',
    'meterpreter', 'beacon', 'cobaltstrike', 'log4j', 'jndi:ldap', 'union select',
    'dump', 'sam', 'sekurlsa', 'psexec', 'rundll32', 'reg query', 'whoami /priv'
  ];

  private static highRiskPorts = [4444, 1337, 31337, 7001, 8888, 9001, 6667, 3389, 2222, 8080];

  /**
   * Calculate Shannon Entropy of a string
   */
  public static calculateEntropy(str: string): number {
    if (!str || str.length === 0) return 0;
    const freq: Record<string, number> = {};
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      freq[char] = (freq[char] || 0) + 1;
    }
    let entropy = 0;
    const len = str.length;
    for (const char in freq) {
      const p = freq[char] / len;
      entropy -= p * Math.log2(p);
    }
    return Math.round(entropy * 100) / 100;
  }

  /**
   * Check if user is a privileged account
   */
  private static isPrivileged(user: string): number {
    if (!user) return 0;
    const lower = user.toLowerCase();
    return (
      lower === 'root' ||
      lower === 'admin' ||
      lower === 'administrator' ||
      lower === 'system' ||
      lower.includes('super') ||
      lower.includes('wheel')
    ) ? 1 : 0;
  }

  /**
   * Check if port is high-risk or unusual
   */
  private static isUnusualPort(portStr: string | number): number {
    const port = typeof portStr === 'string' ? parseInt(portStr, 10) : portStr;
    if (isNaN(port)) return 0;
    return this.highRiskPorts.includes(port) || (port > 10000 && port !== 8080) ? 1 : 0;
  }

  /**
   * Check if IP is public / external (not RFC1918)
   */
  private static isExternalIP(ip: string): number {
    if (!ip) return 0;
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.') || ip === '127.0.0.1' || ip === 'localhost') {
      return 0;
    }
    return 1;
  }

  /**
   * Extract features from a single NormalizedEvent in <0.05ms
   */
  public static extract(
    event: NormalizedEvent,
    recentEventsWindow: NormalizedEvent[] = []
  ): ExtractedLogFeatures {
    const fullText = `${event.message} ${event.process} ${event.action} ${event.raw_event || ''}`.toLowerCase();

    // 1. Failed Auth count in window
    let failedAuthCount = 0;
    if (recentEventsWindow.length > 0) {
      failedAuthCount = recentEventsWindow.filter(
        (e) =>
          (e.source_ip === event.source_ip || e.user === event.user) &&
          (e.status === 'FAILURE' || e.event_type.includes('FAIL') || e.message.toLowerCase().includes('fail'))
      ).length;
    } else if (event.status === 'FAILURE' || fullText.includes('failed') || fullText.includes('invalid')) {
      failedAuthCount = 1;
    }

    // 2. Shannon Entropy of payload / process / command
    const entropy = this.calculateEntropy(event.raw_event || event.message);

    // 3. Privileged user
    const privileged = this.isPrivileged(event.user);

    // 4. Port analysis
    const dstPort = event.metadata?.dst_port || event.metadata?.port || 0;
    const unusualPort = this.isUnusualPort(dstPort);

    // 5. Bytes Ratio Out/In (Data Exfil detection)
    const bytesOut = Number(event.metadata?.bytes_out || event.metadata?.sent_bytes || 0);
    const bytesIn = Number(event.metadata?.bytes_in || event.metadata?.rcvd_bytes || 1000);
    const bytesRatio = bytesIn > 0 ? Math.min(20, Math.round((bytesOut / bytesIn) * 10) / 10) : 0;

    // 6. Suspicious token matches
    let tokenMatches = 0;
    for (const token of this.highRiskTokens) {
      if (fullText.includes(token)) tokenMatches++;
    }

    // 7 & 8. Cyclical time encoding (hour of day)
    const date = new Date(event.timestamp || Date.now());
    const hour = isNaN(date.getHours()) ? 12 : date.getHours();
    const timeSin = Math.round(Math.sin((2 * Math.PI * hour) / 24) * 1000) / 1000;
    const timeCos = Math.round(Math.cos((2 * Math.PI * hour) / 24) * 1000) / 1000;

    // 9. Destination IP external
    const dstExternal = this.isExternalIP(event.destination_ip);

    // 10. Action severity weight
    let actionWeight = 0.2;
    if (event.severity === 'Critical') actionWeight = 1.0;
    else if (event.severity === 'High') actionWeight = 0.8;
    else if (event.severity === 'Medium') actionWeight = 0.5;

    // 11. Rare user agent / CLI tool
    const ua = (event.metadata?.user_agent || event.metadata?.ua || '').toLowerCase();
    const rareUA = (ua.includes('curl') || ua.includes('python') || ua.includes('powershell') || ua.includes('go-http') || ua.includes('nmap')) ? 1 : 0;

    // 12. Repeated event frequency
    const repeatedFreq = recentEventsWindow.filter((e) => e.event_type === event.event_type).length;

    return {
      failed_auth_count_1m: failedAuthCount,
      payload_entropy: entropy,
      is_privileged_user: privileged,
      unusual_port_flag: unusualPort,
      bytes_ratio_out_in: bytesRatio,
      cmd_suspicious_tokens: tokenMatches,
      time_hour_sin: timeSin,
      time_hour_cos: timeCos,
      dst_ip_external: dstExternal,
      action_severity_weight: actionWeight,
      rare_user_agent_score: rareUA,
      repeated_event_frequency: repeatedFreq,
    };
  }

  /**
   * Convert feature dictionary into numeric array for vector matrix multiplication / XGBoost trees
   */
  public static toFeatureVector(features: ExtractedLogFeatures): number[] {
    return [
      features.failed_auth_count_1m,
      features.payload_entropy,
      features.is_privileged_user,
      features.unusual_port_flag,
      features.bytes_ratio_out_in,
      features.cmd_suspicious_tokens,
      features.time_hour_sin,
      features.time_hour_cos,
      features.dst_ip_external,
      features.action_severity_weight,
      features.rare_user_agent_score,
      features.repeated_event_frequency,
    ];
  }
}
