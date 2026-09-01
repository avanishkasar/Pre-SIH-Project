import { NormalizedEvent, SuspiciousFinding, ThreatCategory, Severity } from '../types';

export interface DetectionRule {
  id: string;
  name: string;
  category: ThreatCategory;
  severity: Severity;
  description: string;
  confidence: number;
  evaluate: (events: NormalizedEvent[]) => SuspiciousFinding[];
}

export class DetectionEngine {
  private static rules: DetectionRule[] = [
    // Rule 1: Brute Force Authentication Attack
    {
      id: 'SEC-R01-BRUTEFORCE',
      name: 'Brute Force Authentication Burst',
      category: 'Brute Force',
      severity: 'High',
      description: 'Multiple failed authentication attempts detected from the same source IP or targeting the same user within a short time window.',
      confidence: 90,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const failedEvents = events.filter(
          (e) =>
            e.status === 'FAILURE' ||
            e.event_type.includes('FAIL') ||
            e.action.toLowerCase().includes('fail') ||
            e.message.toLowerCase().includes('failed password') ||
            e.message.toLowerCase().includes('logon failure')
        );

        // Group by Source IP or User
        const ipGroups: Record<string, NormalizedEvent[]> = {};
        failedEvents.forEach((e) => {
          const key = e.source_ip || e.user || 'unknown';
          if (!ipGroups[key]) ipGroups[key] = [];
          ipGroups[key].push(e);
        });

        for (const [key, group] of Object.entries(ipGroups)) {
          if (group.length >= 3) {
            const users = Array.from(new Set(group.map((g) => g.user).filter(Boolean)));
            const hosts = Array.from(new Set(group.map((g) => g.host).filter(Boolean)));
            const ips = Array.from(new Set(group.map((g) => g.source_ip).filter(Boolean)));
            const eventIds = group.map((g) => g.id);

            findings.push({
              id: `FIND-BF-${key.replace(/[^a-zA-Z0-9]/g, '')}`,
              ruleId: 'SEC-R01-BRUTEFORCE',
              ruleName: 'Brute Force Authentication Burst',
              severity: group.length >= 6 ? 'Critical' : 'High',
              threatCategory: 'Brute Force',
              eventIds,
              description: `Observed ${group.length} consecutive failed authentication attempts targeting ${users.join(', ') || 'accounts'} from IP ${ips.join(', ') || key}.`,
              entities: {
                users,
                hosts,
                ips,
                processes: [],
              },
              timestamp: group[0].timestamp,
              confidence: Math.min(95, 75 + group.length * 3),
            });
          }
        }
        return findings;
      },
    },

    // Rule 2: Login Success After Failures (Credential Compromise)
    {
      id: 'SEC-R02-CREDENTIAL-COMPROMISE',
      name: 'Credential Compromise: Success After Failure Burst',
      category: 'Credential Compromise',
      severity: 'Critical',
      description: 'Successful logon occurred immediately following a sequence of failed attempts on the same target account or from the same source IP.',
      confidence: 95,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        for (let i = 0; i < sorted.length; i++) {
          const current = sorted[i];
          const isSuccess =
            current.status === 'SUCCESS' &&
            (current.event_type.includes('AUTH') ||
              current.event_type.includes('LOGON') ||
              current.action.toLowerCase().includes('login') ||
              current.message.toLowerCase().includes('accepted') ||
              current.message.toLowerCase().includes('success'));

          if (isSuccess) {
            // Look back for prior failures within last 15 events
            const priorFailures = sorted
              .slice(Math.max(0, i - 15), i)
              .filter(
                (p) =>
                  (p.status === 'FAILURE' || p.event_type.includes('FAIL')) &&
                  (p.user === current.user || p.source_ip === current.source_ip)
              );

            if (priorFailures.length >= 2) {
              const matchedEventIds = [...priorFailures.map((p) => p.id), current.id];
              findings.push({
                id: `FIND-COMP-${current.id}`,
                ruleId: 'SEC-R02-CREDENTIAL-COMPROMISE',
                ruleName: 'Credential Compromise: Success After Failure Burst',
                severity: 'Critical',
                threatCategory: 'Credential Compromise',
                eventIds: matchedEventIds,
                description: `Target account '${current.user}' successfully logged in after ${priorFailures.length} failed attempts from IP ${current.source_ip || priorFailures[0].source_ip}. Indicates potential password spray / cracked credentials.`,
                entities: {
                  users: [current.user],
                  hosts: [current.host],
                  ips: Array.from(new Set([current.source_ip, ...priorFailures.map((p) => p.source_ip)].filter(Boolean))),
                  processes: [current.process].filter(Boolean),
                },
                timestamp: current.timestamp,
                confidence: 94,
              });
            }
          }
        }
        return findings;
      },
    },

    // Rule 3: Privilege Escalation
    {
      id: 'SEC-R03-PRIV-ESC',
      name: 'Unauthorized Privilege Escalation',
      category: 'Privilege Escalation',
      severity: 'Critical',
      description: 'Execution of privilege escalation utilities, sudo exploitation, SeDebugPrivilege enablement, or unauthorized administrator group additions.',
      confidence: 92,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const privKeywords = [
          'sudo',
          'runas',
          'whoami /priv',
          'sedebugprivilege',
          'net localgroup administrators',
          'useradd -g root',
          'chmod +s',
          'uac_bypass',
          'privilege escalation',
          'samaccountname',
          'token_elevation',
          'getsystem',
        ];

        events.forEach((e) => {
          const combined = `${e.process} ${e.action} ${e.message} ${JSON.stringify(e.metadata || {})}`.toLowerCase();
          const matched = privKeywords.find((kw) => combined.includes(kw));

          if (matched || e.event_type.includes('PRIV') || e.event_type.includes('ELEVAT')) {
            findings.push({
              id: `FIND-PRIV-${e.id}`,
              ruleId: 'SEC-R03-PRIV-ESC',
              ruleName: 'Unauthorized Privilege Escalation',
              severity: 'Critical',
              threatCategory: 'Privilege Escalation',
              eventIds: [e.id],
              description: `Privilege escalation activity detected on host ${e.host} by user ${e.user}. Indicator: '${matched || e.action}'.`,
              entities: {
                users: [e.user],
                hosts: [e.host],
                ips: [e.source_ip].filter(Boolean),
                processes: [e.process].filter(Boolean),
              },
              timestamp: e.timestamp,
              confidence: 90,
            });
          }
        });
        return findings;
      },
    },

    // Rule 4: Suspicious Process / Malware Execution
    {
      id: 'SEC-R04-MALWARE-EXEC',
      name: 'Suspicious Process & Malware Execution',
      category: 'Malware Activity',
      severity: 'Critical',
      description: 'Execution of offensive security tools, encoded powershell commands, shadow copy deletion, or memory dumping utilities.',
      confidence: 96,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const malwareKeywords = [
          'mimikatz',
          'powershell -enc',
          'powershell -e ',
          'powershell.exe -nop',
          'vssadmin delete shadows',
          'wmic shadowcopy delete',
          'certutil -urlcache',
          'cobaltstrike',
          'meterpreter',
          'ransomware',
          'rundll32.exe',
          'procdump',
          'lsass.exe dump',
          'invoke-expression',
          'iex(',
          'sharpHound',
          'bloodhound',
          'beacon.exe',
        ];

        events.forEach((e) => {
          const combined = `${e.process} ${e.action} ${e.message} ${e.raw_event}`.toLowerCase();
          const matched = malwareKeywords.find((kw) => combined.includes(kw));

          if (matched || e.event_type.includes('MALWARE')) {
            findings.push({
              id: `FIND-MAL-${e.id}`,
              ruleId: 'SEC-R04-MALWARE-EXEC',
              ruleName: 'Suspicious Process & Malware Execution',
              severity: 'Critical',
              threatCategory: 'Malware Activity',
              eventIds: [e.id],
              description: `Malicious or evasive tool execution identified: '${matched || e.process}'. Action taken by user ${e.user} on ${e.host}.`,
              entities: {
                users: [e.user],
                hosts: [e.host],
                ips: [e.source_ip, e.destination_ip].filter(Boolean),
                processes: [e.process].filter(Boolean),
              },
              timestamp: e.timestamp,
              confidence: 95,
            });
          }
        });
        return findings;
      },
    },

    // Rule 5: Lateral Movement & Remote Admin Activity
    {
      id: 'SEC-R05-LATERAL-MOV',
      name: 'Suspicious Lateral Movement / Remote Execution',
      category: 'Lateral Movement',
      severity: 'High',
      description: 'Anomalous remote management connections, PsExec launches, WMI remote process creation, or SMB share mapping between internal hosts.',
      confidence: 88,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const lateralKeywords = [
          'psexec',
          'wmic /node:',
          'winrm',
          'invoke-command -computername',
          'admin$',
          'c$',
          'ipc$',
          'remote desktop',
          'mstsc',
          'smb_lateral',
          'pass-the-hash',
          'overpass-the-hash',
        ];

        events.forEach((e) => {
          const combined = `${e.process} ${e.action} ${e.message} ${e.raw_event}`.toLowerCase();
          const matched = lateralKeywords.find((kw) => combined.includes(kw));

          if (matched || e.event_type.includes('LATERAL') || (e.action.toLowerCase().includes('remote') && e.status === 'SUCCESS')) {
            findings.push({
              id: `FIND-LAT-${e.id}`,
              ruleId: 'SEC-R05-LATERAL-MOV',
              ruleName: 'Suspicious Lateral Movement',
              severity: 'High',
              threatCategory: 'Lateral Movement',
              eventIds: [e.id],
              description: `Potential internal pivoting / lateral movement detected from ${e.source_ip || e.host} to ${e.destination_ip || 'remote target'}. Indicator: '${matched || e.action}'.`,
              entities: {
                users: [e.user],
                hosts: [e.host],
                ips: [e.source_ip, e.destination_ip].filter(Boolean),
                processes: [e.process].filter(Boolean),
              },
              timestamp: e.timestamp,
              confidence: 88,
            });
          }
        });
        return findings;
      },
    },

    // Rule 6: Unusual Outbound Network Traffic / C2 Beaconing
    {
      id: 'SEC-R06-OUTBOUND-C2',
      name: 'Unusual Outbound Network Connection & C2 Beaconing',
      category: 'Suspicious Network Activity',
      severity: 'High',
      description: 'Outbound network connections directed towards known suspicious external IP ranges, TOR exit nodes, or high-risk C2 communication ports.',
      confidence: 89,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const suspiciousIPs = ['185.220.101.5', '194.26.29.112', '45.142.214.88', '91.240.118.172', '103.208.220.12', '198.51.100.44'];
        const suspiciousPorts = ['4444', '1337', '8888', '9001', '6667', '31337'];

        events.forEach((e) => {
          const dest = e.destination_ip || '';
          const msg = `${e.message} ${e.raw_event}`;
          const isSuspiciousIP = suspiciousIPs.some((ip) => dest.includes(ip) || msg.includes(ip));
          const isSuspiciousPort = suspiciousPorts.some((port) => msg.includes(`:${port}`) || msg.includes(`port ${port}`));
          const isNetwork = e.event_type.includes('NET') || e.event_type.includes('C2') || e.action.toLowerCase().includes('connect') || e.action.toLowerCase().includes('outbound');

          if (isSuspiciousIP || isSuspiciousPort || (isNetwork && e.severity === 'High')) {
            findings.push({
              id: `FIND-C2-${e.id}`,
              ruleId: 'SEC-R06-OUTBOUND-C2',
              ruleName: 'Unusual Outbound Connection / C2 Beaconing',
              severity: isSuspiciousIP ? 'Critical' : 'High',
              threatCategory: 'Suspicious Network Activity',
              eventIds: [e.id],
              description: `High-risk outbound connection detected from host ${e.host} to external target ${dest || 'external IP'}. Potential Command & Control (C2) channel.`,
              entities: {
                users: [e.user],
                hosts: [e.host],
                ips: [e.source_ip, dest].filter(Boolean),
                processes: [e.process].filter(Boolean),
              },
              timestamp: e.timestamp,
              confidence: isSuspiciousIP ? 94 : 85,
            });
          }
        });
        return findings;
      },
    },

    // Rule 7: Data Exfiltration / Staging
    {
      id: 'SEC-R07-DATA-EXFIL',
      name: 'Data Staging & Exfiltration Activity',
      category: 'Data Exfiltration',
      severity: 'Critical',
      description: 'Archiving sensitive directories, bulk upload to external cloud storage or unusual HTTP POST payloads.',
      confidence: 91,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const exfilKeywords = [
          'tar -czf',
          '7z a',
          'rar a',
          'zip -r',
          'curl -t',
          'curl --upload-file',
          'rclone copy',
          's3 cp s3://',
          'exfiltration',
          'mega.nz',
          'pastebin.com',
          'discordapp.com/api/webhooks',
        ];

        events.forEach((e) => {
          const combined = `${e.process} ${e.action} ${e.message} ${e.raw_event}`.toLowerCase();
          const matched = exfilKeywords.find((kw) => combined.includes(kw));

          if (matched || e.event_type.includes('EXFIL') || (e.action.toLowerCase().includes('upload') && e.severity === 'High')) {
            findings.push({
              id: `FIND-EXF-${e.id}`,
              ruleId: 'SEC-R07-DATA-EXFIL',
              ruleName: 'Data Staging & Exfiltration Activity',
              severity: 'Critical',
              threatCategory: 'Data Exfiltration',
              eventIds: [e.id],
              description: `Data staging or exfiltration command executed on host ${e.host}: '${matched || e.process}'.`,
              entities: {
                users: [e.user],
                hosts: [e.host],
                ips: [e.source_ip, e.destination_ip].filter(Boolean),
                processes: [e.process].filter(Boolean),
              },
              timestamp: e.timestamp,
              confidence: 92,
            });
          }
        });
        return findings;
      },
    },

    // Rule 8: Reconnaissance and Discovery
    {
      id: 'SEC-R08-RECON',
      name: 'Internal Reconnaissance & Discovery',
      category: 'Reconnaissance',
      severity: 'Medium',
      description: 'Port scanning, AD discovery commands (nltest, net view, adfind, nslookup, ping sweeps).',
      confidence: 84,
      evaluate: (events: NormalizedEvent[]): SuspiciousFinding[] => {
        const findings: SuspiciousFinding[] = [];
        const reconKeywords = [
          'nmap',
          'nltest',
          'net view',
          'net group',
          'adfind',
          'bloodhound',
          'sharphound',
          'masscan',
          'port scan',
          'network sweep',
          'reconnaissance',
        ];

        events.forEach((e) => {
          const combined = `${e.process} ${e.action} ${e.message} ${e.raw_event}`.toLowerCase();
          const matched = reconKeywords.find((kw) => combined.includes(kw));

          if (matched || e.event_type.includes('RECON') || e.event_type.includes('SCAN')) {
            findings.push({
              id: `FIND-REC-${e.id}`,
              ruleId: 'SEC-R08-RECON',
              ruleName: 'Internal Reconnaissance & Discovery',
              severity: 'Medium',
              threatCategory: 'Reconnaissance',
              eventIds: [e.id],
              description: `Reconnaissance / environmental discovery activity detected on host ${e.host} by user ${e.user}. Command: '${matched || e.process}'.`,
              entities: {
                users: [e.user],
                hosts: [e.host],
                ips: [e.source_ip, e.destination_ip].filter(Boolean),
                processes: [e.process].filter(Boolean),
              },
              timestamp: e.timestamp,
              confidence: 84,
            });
          }
        });
        return findings;
      },
    },
  ];

  public static runDetection(events: NormalizedEvent[]): {
    findings: SuspiciousFinding[];
    flaggedEvents: NormalizedEvent[];
  } {
    const allFindings: SuspiciousFinding[] = [];
    const flaggedEventIds = new Set<string>();
    const flaggedRulesMap: Record<string, string[]> = {};

    for (const rule of this.rules) {
      try {
        const ruleFindings = rule.evaluate(events);
        for (const finding of ruleFindings) {
          allFindings.push(finding);
          finding.eventIds.forEach((id) => {
            flaggedEventIds.add(id);
            if (!flaggedRulesMap[id]) flaggedRulesMap[id] = [];
            if (!flaggedRulesMap[id].includes(rule.name)) {
              flaggedRulesMap[id].push(rule.name);
            }
          });
        }
      } catch (err) {
        console.error(`Error evaluating detection rule ${rule.id}:`, err);
      }
    }

    // Also add findings for events with strong XGBoost ML anomaly scores
    events.forEach((e) => {
      const mlPred = e.metadata?.ml_prediction;
      if (mlPred && mlPred.isAnomaly && !flaggedEventIds.has(e.id) && mlPred.anomalyScore >= 0.65) {
        flaggedEventIds.add(e.id);
        const ruleName = `XGBoost ML Anomaly Detector (${mlPred.predictedCategory})`;
        if (!flaggedRulesMap[e.id]) flaggedRulesMap[e.id] = [];
        flaggedRulesMap[e.id].push(ruleName);

        const topShap = mlPred.topContributingFeatures?.[0]?.name || 'Payload Entropy Spike';

        allFindings.push({
          id: `FIND-XGB-${e.id}`,
          ruleId: 'ML-XGBOOST-ANOMALY-01',
          ruleName: `XGBoost Tree Ensemble: ${mlPred.predictedCategory}`,
          severity: mlPred.suggestedSeverity,
          threatCategory: mlPred.predictedCategory,
          eventIds: [e.id],
          description: `XGBoost ML Classifier detected high anomaly probability (${(mlPred.anomalyScore * 100).toFixed(1)}%). Primary SHAP driver: ${topShap}. Action: ${e.action || e.event_type}.`,
          entities: {
            users: [e.user].filter((u) => u && u !== 'UNKNOWN_USER'),
            hosts: [e.host].filter(Boolean),
            ips: [e.source_ip, e.destination_ip].filter(Boolean),
            processes: [e.process].filter(Boolean),
          },
          timestamp: e.timestamp,
          confidence: mlPred.confidencePercent,
        });
      }
    });

    // Annotate normalized events with suspicious flags
    const annotatedEvents = events.map((e) => {
      const isSuspicious = flaggedEventIds.has(e.id) || Boolean(e.isSuspicious);
      const existingRules = e.flaggedRules || [];
      const newRules = flaggedRulesMap[e.id] || [];
      const combinedRules = Array.from(new Set([...existingRules, ...newRules]));

      return {
        ...e,
        isSuspicious,
        flaggedRules: combinedRules,
      };
    });

    return {
      findings: allFindings,
      flaggedEvents: annotatedEvents,
    };
  }
}
