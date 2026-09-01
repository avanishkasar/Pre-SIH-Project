import { CorrelatedIncident, NormalizedEvent, AgentActivityLog } from '../../types';

export interface IncidentReportData {
  incidentId: string;
  generatedAt: string;
  title: string;
  threatCategory: string;
  severity: string;
  riskScore: number;
  confidenceScore: number;
  executiveSummary: string;
  whySuspicious: string;
  attackTimeline: Array<{ time: string; event: string; status: string; actor: string; target: string }>;
  evidence: Array<{ id: string; timestamp: string; action: string; user: string; host: string; details: string }>;
  affectedEntities: {
    users: string[];
    hosts: string[];
    ips: string[];
    processes: string[];
  };
  mitreTactics: Array<{ tactic: string; techniqueId: string; techniqueName: string }>;
  riskFactors: Array<{ factor: string; scoreContribution: number; weight: string; description: string }>;
  recommendations: Array<{ action: string; reason: string; priority: string; impact: string }>;
  agentContributions: {
    logAnalysisAgent: string;
    threatInvestigationAgent: string;
    reportingAgent: string;
  };
}

export class ReportingAgent {
  public static generateReport(incident: CorrelatedIncident, events: NormalizedEvent[]): {
    report: IncidentReportData;
    logs: AgentActivityLog[];
  } {
    const startTime = Date.now();
    const eventMap = new Map<string, NormalizedEvent>();
    events.forEach((e) => eventMap.set(e.id, e));

    const logs: AgentActivityLog[] = [
      {
        id: `REP-AGENT-1-${Date.now()}`,
        agentName: 'Incident Reporting Agent',
        stage: 'Reporting',
        status: 'running',
        message: `Compiling forensic incident report for ${incident.id} (${incident.title})...`,
        timestamp: new Date().toISOString(),
      },
    ];

    const evidence = incident.evidenceEventIds
      .map((id) => eventMap.get(id))
      .filter(Boolean)
      .map((e) => ({
        id: e!.id,
        timestamp: e!.timestamp,
        action: e!.action || e!.event_type,
        user: e!.user,
        host: e!.host,
        details: e!.message || e!.raw_event,
      }));

    const attackTimeline = incident.correlatedEventIds
      .map((id) => eventMap.get(id))
      .filter(Boolean)
      .map((e) => ({
        time: e!.timestamp,
        event: e!.action || e!.event_type,
        status: e!.status,
        actor: e!.user,
        target: `${e!.host} ${e!.destination_ip ? '→ ' + e!.destination_ip : ''}`,
      }));

    const report: IncidentReportData = {
      incidentId: incident.id,
      generatedAt: new Date().toISOString(),
      title: incident.title,
      threatCategory: incident.threatCategory,
      severity: incident.severity,
      riskScore: incident.riskScore,
      confidenceScore: incident.confidenceScore,
      executiveSummary: incident.executiveSummary,
      whySuspicious: incident.whySuspicious,
      attackTimeline,
      evidence,
      affectedEntities: incident.affectedEntities,
      mitreTactics: incident.mitreTactics,
      riskFactors: incident.riskFactors,
      recommendations: incident.recommendations.map((r) => ({
        action: r.action,
        reason: r.reason,
        priority: r.priority,
        impact: r.potentialImpact,
      })),
      agentContributions: {
        logAnalysisAgent: incident.agentReasoning.logAgentAnalysis,
        threatInvestigationAgent: incident.agentReasoning.threatAgentAssessment,
        reportingAgent: `Compiled unified audit dossier with ${evidence.length} verified evidence items, ${attackTimeline.length} timeline milestones, and ${incident.recommendations.length} SOC mitigation playbooks.`,
      },
    };

    logs.push({
      id: `REP-AGENT-2-${Date.now()}`,
      agentName: 'Incident Reporting Agent',
      stage: 'Reporting',
      status: 'completed',
      message: `Incident report synthesized successfully for ${incident.id}. Prepared for PDF / HTML / JSON export.`,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });

    return { report, logs };
  }
}
