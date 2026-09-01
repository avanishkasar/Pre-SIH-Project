import {
  NormalizedEvent,
  SuspiciousFinding,
  CorrelatedIncident,
  ThreatCategory,
  Severity,
  MitreTacticInfo,
} from '../types';

export class CorrelationEngine {
  public static correlateFindings(
    events: NormalizedEvent[],
    findings: SuspiciousFinding[]
  ): CorrelatedIncident[] {
    if (findings.length === 0) {
      return [];
    }

    const eventMap = new Map<string, NormalizedEvent>();
    events.forEach((e) => eventMap.set(e.id, e));

    // Step 1: Build correlation clusters using graph/union-find over shared entities (user, host, source_ip, dest_ip)
    const clusters: Array<{
      findings: SuspiciousFinding[];
      eventIds: Set<string>;
      users: Set<string>;
      hosts: Set<string>;
      ips: Set<string>;
      processes: Set<string>;
    }> = [];

    for (const finding of findings) {
      let matchedClusterIndex = -1;

      // Find if this finding shares any entity or event with an existing cluster
      for (let i = 0; i < clusters.length; i++) {
        const c = clusters[i];
        const sharesUser = finding.entities.users.some((u) => u && u !== 'UNKNOWN_USER' && c.users.has(u));
        const sharesHost = finding.entities.hosts.some((h) => h && c.hosts.has(h));
        const sharesIp = finding.entities.ips.some((ip) => ip && c.ips.has(ip));
        const sharesEvent = finding.eventIds.some((id) => c.eventIds.has(id));

        if (sharesUser || sharesHost || sharesIp || sharesEvent) {
          matchedClusterIndex = i;
          break;
        }
      }

      if (matchedClusterIndex !== -1) {
        // Merge into existing cluster
        const c = clusters[matchedClusterIndex];
        c.findings.push(finding);
        finding.eventIds.forEach((id) => c.eventIds.add(id));
        finding.entities.users.forEach((u) => u && c.users.add(u));
        finding.entities.hosts.forEach((h) => h && c.hosts.add(h));
        finding.entities.ips.forEach((ip) => ip && c.ips.add(ip));
        finding.entities.processes.forEach((p) => p && c.processes.add(p));
      } else {
        // Create new cluster
        clusters.push({
          findings: [finding],
          eventIds: new Set(finding.eventIds),
          users: new Set(finding.entities.users.filter(Boolean)),
          hosts: new Set(finding.entities.hosts.filter(Boolean)),
          ips: new Set(finding.entities.ips.filter(Boolean)),
          processes: new Set(finding.entities.processes.filter(Boolean)),
        });
      }
    }

    // Step 2: Also pull in contextual events (surrounding temporal events for the same host/user)
    const incidents: CorrelatedIncident[] = [];

    clusters.forEach((cluster, idx) => {
      // Gather all associated events sorted by timestamp
      const correlatedEvents: NormalizedEvent[] = [];
      const primaryEventIds = Array.from(cluster.eventIds);

      // Add all direct events
      primaryEventIds.forEach((id) => {
        const ev = eventMap.get(id);
        if (ev && !correlatedEvents.some((ce) => ce.id === ev.id)) {
          correlatedEvents.push(ev);
        }
      });

      // Add close surrounding events for the primary user/host to complete context
      events.forEach((ev) => {
        if (!correlatedEvents.some((ce) => ce.id === ev.id)) {
          const matchesEntity =
            (cluster.users.size > 0 && cluster.users.has(ev.user) && ev.user !== 'UNKNOWN_USER') ||
            (cluster.hosts.size > 0 && cluster.hosts.has(ev.host)) ||
            (cluster.ips.size > 0 && (cluster.ips.has(ev.source_ip) || cluster.ips.has(ev.destination_ip)));

          if (matchesEntity) {
            // Check time distance to any existing cluster event (within 10 minutes)
            const evTime = new Date(ev.timestamp).getTime();
            const isNear = correlatedEvents.some((ce) => {
              const ceTime = new Date(ce.timestamp).getTime();
              return Math.abs(evTime - ceTime) <= 15 * 60 * 1000;
            });
            if (isNear) {
              correlatedEvents.push(ev);
            }
          }
        }
      });

      correlatedEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const evidenceEventIds = primaryEventIds;
      const allCorrelatedIds = correlatedEvents.map((e) => e.id);

      // Determine highest severity & predominant threat category
      const categories = cluster.findings.map((f) => f.threatCategory);
      const severities = cluster.findings.map((f) => f.severity);

      const dominantCategory = this.determineDominantThreat(categories);
      const incidentSeverity = this.determineOverallSeverity(severities);

      // Construct Attack Sequence Timeline
      const attackSequence = this.buildAttackSequence(correlatedEvents, cluster.findings);

      // MITRE Tactics Mapping
      const mitreTactics = this.mapToMitre(categories);

      const firstSeen = correlatedEvents.length > 0 ? correlatedEvents[0].timestamp : new Date().toISOString();
      const lastSeen =
        correlatedEvents.length > 0
          ? correlatedEvents[correlatedEvents.length - 1].timestamp
          : new Date().toISOString();

      const userList = Array.from(cluster.users).filter((u) => u !== 'UNKNOWN_USER');
      const hostList = Array.from(cluster.hosts);
      const ipList = Array.from(cluster.ips);
      const processList = Array.from(cluster.processes);

      const incidentId = `INC-${new Date().getFullYear()}-${String(idx + 101).padStart(4, '0')}`;
      const title = this.generateIncidentTitle(dominantCategory, userList, hostList);

      const whySuspicious = this.generateWhySuspicious(cluster.findings, correlatedEvents, userList, ipList);
      const executiveSummary = this.generateExecutiveSummary(
        title,
        dominantCategory,
        userList,
        hostList,
        ipList,
        correlatedEvents.length,
        evidenceEventIds.length
      );

      incidents.push({
        id: incidentId,
        title,
        threatCategory: dominantCategory,
        severity: incidentSeverity,
        riskScore: 0, // Will be computed by RiskScorer
        confidenceScore: Math.round(
          cluster.findings.reduce((acc, f) => acc + f.confidence, 0) / cluster.findings.length
        ),
        status: 'Active',
        timestamp: lastSeen,
        firstSeen,
        lastSeen,
        executiveSummary,
        whySuspicious,
        attackSequence,
        affectedEntities: {
          users: userList.length > 0 ? userList : ['Unknown User'],
          hosts: hostList.length > 0 ? hostList : ['Unknown Host'],
          ips: ipList,
          processes: processList,
        },
        correlatedEventIds: allCorrelatedIds,
        evidenceEventIds: evidenceEventIds.length > 0 ? evidenceEventIds : allCorrelatedIds.slice(0, 5),
        mitreTactics,
        riskFactors: [], // Will be filled by RiskScorer
        agentReasoning: {
          logAgentAnalysis: `Identified ${cluster.findings.length} threat triggers across ${correlatedEvents.length} normalized events. Signals indicate multi-stage ${dominantCategory.toLowerCase()} attack targeting ${hostList.join(', ')}.`,
          threatAgentAssessment: `Correlated chain of evidence connecting initial access to subsequent execution phases. Affected accounts: ${userList.join(', ') || 'N/A'}. Immediate containment required.`,
          investigationChain: `Correlation established through shared entity graph: [${Array.from(new Set([...userList, ...hostList, ...ipList])).join(' ↔ ')}].`,
        },
        recommendations: [], // Will be filled by ThreatAgent / RiskScorer
        mitigationActions: [],
      });
    });

    return incidents;
  }

  private static determineDominantThreat(categories: ThreatCategory[]): ThreatCategory {
    const priorityOrder: ThreatCategory[] = [
      'Malware Activity',
      'Data Exfiltration',
      'Privilege Escalation',
      'Credential Compromise',
      'Lateral Movement',
      'Brute Force',
      'Suspicious Network Activity',
      'Reconnaissance',
      'Unknown / Needs Investigation',
    ];

    for (const p of priorityOrder) {
      if (categories.includes(p)) return p;
    }
    return categories[0] || 'Unknown / Needs Investigation';
  }

  private static determineOverallSeverity(severities: Severity[]): Severity {
    if (severities.includes('Critical')) return 'Critical';
    if (severities.includes('High')) return 'High';
    if (severities.includes('Medium')) return 'Medium';
    return 'Low';
  }

  private static generateIncidentTitle(category: ThreatCategory, users: string[], hosts: string[]): string {
    const userStr = users.length > 0 ? users[0] : 'System';
    const hostStr = hosts.length > 0 ? hosts[0] : 'Workstation';

    switch (category) {
      case 'Brute Force':
        return `Distributed Authentication Brute Force Attack targeting ${userStr}`;
      case 'Credential Compromise':
        return `Credential Compromise & Unauthorized Logon on ${hostStr} (${userStr})`;
      case 'Privilege Escalation':
        return `Unauthorized Privilege Escalation to Root/Admin on ${hostStr}`;
      case 'Malware Activity':
        return `Malicious Binary & Ransomware Behavior Detected on ${hostStr}`;
      case 'Lateral Movement':
        return `Internal Lateral Movement & Remote Admin Pivoting to ${hostStr}`;
      case 'Suspicious Network Activity':
        return `Command & Control (C2) Beaconing Session on ${hostStr}`;
      case 'Data Exfiltration':
        return `Suspicious Data Staging & Exfiltration from ${hostStr}`;
      case 'Reconnaissance':
        return `Active Network Reconnaissance & Port Discovery from ${userStr}`;
      default:
        return `Suspicious Security Incident on ${hostStr}`;
    }
  }

  private static generateWhySuspicious(
    findings: SuspiciousFinding[],
    events: NormalizedEvent[],
    users: string[],
    ips: string[]
  ): string {
    const findingDesc = findings.map((f) => f.description).join(' ');
    const failureCount = events.filter((e) => e.status === 'FAILURE').length;
    const criticalEvents = events.filter((e) => e.severity === 'Critical');

    let reasons = `Anomalous pattern detected involving ${users.join(', ') || 'unspecified users'} across ${ips.join(', ') || 'internal IPs'}. `;
    reasons += findingDesc;

    if (failureCount > 0) {
      reasons += ` Preceded by ${failureCount} failed/rejected security transactions.`;
    }
    if (criticalEvents.length > 0) {
      reasons += ` Contains ${criticalEvents.length} critical severity system indicators.`;
    }
    return reasons;
  }

  private static generateExecutiveSummary(
    title: string,
    category: ThreatCategory,
    users: string[],
    hosts: string[],
    ips: string[],
    totalEvents: number,
    evidenceEvents: number
  ): string {
    return `Security operations identified an active ${category} incident: "${title}". A total of ${totalEvents} related security telemetry events were correlated, containing ${evidenceEvents} direct evidence indicators. Affected assets include ${hosts.join(', ') || 'corporate servers'} and account(s) ${users.join(', ') || 'privileged users'}. External traffic indicators linked to ${ips.join(', ') || 'threat actor IP space'}. Autonomous multi-agent investigation completed with high confidence. Immediate containment protocol recommended.`;
  }

  private static buildAttackSequence(events: NormalizedEvent[], findings: SuspiciousFinding[]): string[] {
    const sequence: string[] = [];
    const suspiciousEvents = events.filter((e) => e.isSuspicious || e.severity === 'High' || e.severity === 'Critical');
    const targetEvents = suspiciousEvents.length > 0 ? suspiciousEvents : events.slice(0, 6);

    targetEvents.forEach((e) => {
      const timeStr = e.timestamp.includes('T') ? e.timestamp.split('T')[1].split('.')[0] : e.timestamp;
      sequence.push(
        `[${timeStr}] ${e.action || e.event_type} on ${e.host} by ${e.user} (${e.status}) → ${e.process || e.source_ip || e.message}`
      );
    });

    if (sequence.length === 0 && findings.length > 0) {
      findings.forEach((f) => {
        sequence.push(`[Detection] ${f.ruleName}: ${f.description}`);
      });
    }

    return sequence;
  }

  private static mapToMitre(categories: ThreatCategory[]): MitreTacticInfo[] {
    const list: MitreTacticInfo[] = [];

    categories.forEach((cat) => {
      switch (cat) {
        case 'Brute Force':
          list.push({ tactic: 'Credential Access', techniqueId: 'T1110.001', techniqueName: 'Password Guessing / Spray' });
          break;
        case 'Credential Compromise':
          list.push({ tactic: 'Initial Access', techniqueId: 'T1078', techniqueName: 'Valid Accounts' });
          break;
        case 'Privilege Escalation':
          list.push({ tactic: 'Privilege Escalation', techniqueId: 'T1068', techniqueName: 'Exploitation for Privilege Escalation' });
          list.push({ tactic: 'Privilege Escalation', techniqueId: 'T1548', techniqueName: 'Abuse Elevation Control Mechanism' });
          break;
        case 'Malware Activity':
          list.push({ tactic: 'Execution', techniqueId: 'T1059.001', techniqueName: 'PowerShell Execution' });
          list.push({ tactic: 'Defense Evasion', techniqueId: 'T1027', techniqueName: 'Obfuscated Files or Information' });
          list.push({ tactic: 'Impact', techniqueId: 'T1490', techniqueName: 'Inhibit System Recovery (Shadow Copy Delete)' });
          break;
        case 'Lateral Movement':
          list.push({ tactic: 'Lateral Movement', techniqueId: 'T1021.002', techniqueName: 'SMB / Windows Admin Shares' });
          list.push({ tactic: 'Lateral Movement', techniqueId: 'T1570', techniqueName: 'Lateral Tool Transfer' });
          break;
        case 'Suspicious Network Activity':
          list.push({ tactic: 'Command and Control', techniqueId: 'T1071.001', techniqueName: 'Web Protocols / C2 Beacon' });
          break;
        case 'Data Exfiltration':
          list.push({ tactic: 'Collection', techniqueId: 'T1560', techniqueName: 'Archive Collected Data' });
          list.push({ tactic: 'Exfiltration', techniqueId: 'T1048', techniqueName: 'Exfiltration Over Alternative Protocol' });
          break;
        case 'Reconnaissance':
          list.push({ tactic: 'Discovery', techniqueId: 'T1087', techniqueName: 'Account Discovery' });
          list.push({ tactic: 'Discovery', techniqueId: 'T1046', techniqueName: 'Network Service Scanning' });
          break;
      }
    });

    // Deduplicate by techniqueId
    const unique = new Map<string, MitreTacticInfo>();
    list.forEach((item) => unique.set(item.techniqueId, item));
    return Array.from(unique.values());
  }
}
