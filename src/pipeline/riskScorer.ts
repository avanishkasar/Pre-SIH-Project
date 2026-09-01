import {
  CorrelatedIncident,
  NormalizedEvent,
  RiskFactor,
  ResponseRecommendation,
  MitigationActionState,
  Severity,
} from '../types';

export class RiskScorer {
  public static scoreIncident(incident: CorrelatedIncident, events: NormalizedEvent[]): CorrelatedIncident {
    const eventMap = new Map<string, NormalizedEvent>();
    events.forEach((e) => eventMap.set(e.id, e));

    const correlatedEvents = incident.correlatedEventIds.map((id) => eventMap.get(id)).filter(Boolean) as NormalizedEvent[];

    let score = 0;
    const riskFactors: RiskFactor[] = [];

    // Factor 1: Threat Category Base Severity
    let categoryPoints = 25;
    if (incident.threatCategory === 'Malware Activity' || incident.threatCategory === 'Data Exfiltration') {
      categoryPoints = 35;
    } else if (incident.threatCategory === 'Privilege Escalation' || incident.threatCategory === 'Credential Compromise') {
      categoryPoints = 30;
    } else if (incident.threatCategory === 'Lateral Movement' || incident.threatCategory === 'Suspicious Network Activity') {
      categoryPoints = 28;
    }
    score += categoryPoints;
    riskFactors.push({
      factor: `Threat Classification: ${incident.threatCategory}`,
      scoreContribution: categoryPoints,
      weight: 'High',
      description: `Baseline risk allocated for inherent severity of ${incident.threatCategory.toLowerCase()} vector.`,
    });

    // Factor 2: Event Volume and Correlation Depth
    const volume = correlatedEvents.length;
    const volumePoints = Math.min(20, Math.max(5, Math.floor(volume * 2.5)));
    score += volumePoints;
    riskFactors.push({
      factor: `Correlated Event Volume (${volume} events)`,
      scoreContribution: volumePoints,
      weight: 'Medium',
      description: `High clustering of ${volume} interconnected events indicating non-isolated, active campaign.`,
    });

    // Factor 3: Privileged Account Involvement
    const privilegedUsers = ['root', 'admin', 'administrator', 'system', 'domain admins', 'nt authority\\system', 'backupadmin'];
    const hasPrivUser = incident.affectedEntities.users.some((u) =>
      privilegedUsers.some((p) => u.toLowerCase().includes(p))
    );
    const hasPrivCommand = correlatedEvents.some(
      (e) =>
        e.action.toLowerCase().includes('sudo') ||
        e.process.toLowerCase().includes('whoami /priv') ||
        e.message.toLowerCase().includes('administrator')
    );

    if (hasPrivUser || hasPrivCommand) {
      const privPoints = 18;
      score += privPoints;
      riskFactors.push({
        factor: 'Privileged Account / Admin Elevation',
        scoreContribution: privPoints,
        weight: 'High',
        description: 'Attack vectors touched high-privilege credentials or administrative execution privileges.',
      });
    }

    // Factor 4: Suspicious External IP / C2 Infrastructure
    const suspiciousIPs = ['185.220.101.5', '194.26.29.112', '45.142.214.88', '91.240.118.172', '103.208.220.12'];
    const hasSuspiciousIP = incident.affectedEntities.ips.some((ip) =>
      suspiciousIPs.some((sip) => ip.includes(sip))
    );

    if (hasSuspiciousIP) {
      const ipPoints = 15;
      score += ipPoints;
      riskFactors.push({
        factor: 'Known Malicious External IP / Threat Intel Match',
        scoreContribution: ipPoints,
        weight: 'High',
        description: 'Observed connection matches active threat actor C2 / bulletproof hosting infrastructure.',
      });
    }

    // Factor 5: Multi-stage Kill Chain Progression
    const stages = new Set<string>();
    correlatedEvents.forEach((e) => {
      if (e.event_type.includes('AUTH')) stages.add('Initial Access');
      if (e.event_type.includes('PRIV') || e.event_type.includes('ELEVAT')) stages.add('Privilege Escalation');
      if (e.event_type.includes('PROCESS') || e.event_type.includes('MALWARE')) stages.add('Execution');
      if (e.event_type.includes('NET') || e.event_type.includes('C2')) stages.add('C2');
      if (e.event_type.includes('EXFIL') || e.event_type.includes('FILE')) stages.add('Exfiltration');
    });

    if (stages.size >= 3) {
      const chainPoints = 12;
      score += chainPoints;
      riskFactors.push({
        factor: `Multi-Stage Kill Chain (${stages.size} distinct phases)`,
        scoreContribution: chainPoints,
        weight: 'High',
        description: `Attack progressed through multiple operational phases: ${Array.from(stages).join(' → ')}.`,
      });
    }

    // Clamp score between 0 and 100
    const finalScore = Math.min(100, Math.max(15, score));

    // Determine Final Severity based on score
    let severity: Severity = 'Low';
    if (finalScore >= 80) severity = 'Critical';
    else if (finalScore >= 60) severity = 'High';
    else if (finalScore >= 35) severity = 'Medium';
    else severity = 'Low';

    // Generate Standard Response Recommendations
    const recommendations = this.generateRecommendations(incident, finalScore);

    // Generate Initial Mitigation Action States for Analyst Execution
    const mitigationActions = this.generateMitigationActions(incident, recommendations);

    return {
      ...incident,
      riskScore: finalScore,
      severity,
      riskFactors,
      recommendations,
      mitigationActions,
    };
  }

  private static generateRecommendations(incident: CorrelatedIncident, score: number): ResponseRecommendation[] {
    const list: ResponseRecommendation[] = [];
    const isCritical = score >= 75;
    const targetUser = incident.affectedEntities.users[0] || 'affected user';
    const targetHost = incident.affectedEntities.hosts[0] || 'affected host';
    const targetIp = incident.affectedEntities.ips[0] || '';

    // Action 1: Account Lockout / Credential Invalidation
    if (incident.affectedEntities.users.length > 0 && targetUser !== 'Unknown User') {
      list.push({
        id: `REC-01-${incident.id}`,
        action: `Revoke active sessions and force password reset for account '${targetUser}'`,
        reason: 'Prevent further unauthorized access and terminate any active attacker token / session.',
        priority: isCritical ? 'Immediate' : 'High',
        potentialImpact: 'User will be logged out from corporate portal until identity verification is completed.',
        suggestedCommandOrPlaybook: `Revoke-AzureADUserAllRefreshToken -ObjectId "${targetUser}" ; Set-ADUser -Identity "${targetUser}" -Enabled $false`,
        targetEntity: targetUser,
      });
    }

    // Action 2: Host Isolation / Quarantine
    if (incident.affectedEntities.hosts.length > 0 && (incident.threatCategory === 'Malware Activity' || incident.threatCategory === 'Privilege Escalation' || isCritical)) {
      list.push({
        id: `REC-02-${incident.id}`,
        action: `Isolate host '${targetHost}' from corporate network via EDR containment`,
        reason: 'Halt potential lateral movement and prevent data exfiltration to remote attacker servers.',
        priority: 'Immediate',
        potentialImpact: 'Target endpoint will lose LAN/WAN connectivity except for SOC management telemetry.',
        suggestedCommandOrPlaybook: `edr-cli isolate --host "${targetHost}" --reason "${incident.title}" --allow-soc-tunnel`,
        targetEntity: targetHost,
      });
    }

    // Action 3: IP Ingress / Egress Block
    if (targetIp && !targetIp.startsWith('10.') && !targetIp.startsWith('192.168.') && !targetIp.startsWith('172.16.')) {
      list.push({
        id: `REC-03-${incident.id}`,
        action: `Block inbound/outbound traffic for external IP ${targetIp} at perimeter firewall`,
        reason: 'Neutralize Command & Control channel and block further reconnaissance probes.',
        priority: 'Immediate',
        potentialImpact: 'Zero internal business impact; external malicious address will be dropped at gateway.',
        suggestedCommandOrPlaybook: `iptables -A FORWARD -s ${targetIp} -j DROP ; aws ec2 create-network-acl-entry --cidr-block ${targetIp}/32 --rule-action deny`,
        targetEntity: targetIp,
      });
    }

    // Action 4: Memory & Process Dump Investigation
    if (incident.affectedEntities.processes.length > 0) {
      const proc = incident.affectedEntities.processes[0];
      list.push({
        id: `REC-04-${incident.id}`,
        action: `Collect process memory dump and inspect parent-child tree for '${proc}'`,
        reason: 'Capture in-memory payload, injected DLLs, and command-line arguments for forensic triage.',
        priority: 'High',
        potentialImpact: 'Slight CPU spike on endpoint during volatile memory collection (~15 seconds).',
        suggestedCommandOrPlaybook: `procdump.exe -ma ${proc} C:\\Forensics\\dumps\\`,
        targetEntity: proc,
      });
    }

    // Action 5: SOC Escalation
    list.push({
      id: `REC-05-${incident.id}`,
      action: `Escalate incident ticket to Tier-3 DFIR (Digital Forensics & Incident Response) Lead`,
      reason: `Automated investigation determined risk score of ${score}/100 with active kill-chain markers.`,
      priority: 'High',
      potentialImpact: 'Formal incident commander assignment and escalation within SIEM/ITSM.',
      suggestedCommandOrPlaybook: `soar-bridge trigger --playbook "IR-TIER3-CRITICAL" --incident "${incident.id}"`,
      targetEntity: 'SOC Lead',
    });

    return list;
  }

  private static generateMitigationActions(
    incident: CorrelatedIncident,
    recommendations: ResponseRecommendation[]
  ): MitigationActionState[] {
    return recommendations.slice(0, 4).map((rec, idx) => ({
      id: `MIT-${incident.id}-${idx + 1}`,
      actionTitle: rec.action,
      targetEntity: rec.targetEntity || incident.affectedEntities.hosts[0] || 'System',
      priority: rec.priority,
      status: 'Pending',
      commandSnippet: rec.suggestedCommandOrPlaybook,
      analystNotes: '',
    }));
  }
}
