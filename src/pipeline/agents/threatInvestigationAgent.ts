import { CorrelationEngine } from '../correlationEngine';
import { RiskScorer } from '../riskScorer';
import {
  NormalizedEvent,
  SuspiciousFinding,
  CorrelatedIncident,
  AgentActivityLog,
} from '../../types';

export interface ThreatInvestigationAgentOutput {
  incidents: CorrelatedIncident[];
  logs: AgentActivityLog[];
  metrics: {
    incidentsGenerated: number;
    criticalIncidents: number;
    highIncidents: number;
    avgRiskScore: number;
    executionTimeMs: number;
  };
}

export class ThreatInvestigationAgent {
  public static async investigate(
    events: NormalizedEvent[],
    findings: SuspiciousFinding[],
    aiEnrichmentFn?: (incident: CorrelatedIncident) => Promise<{
      executiveSummary?: string;
      threatAgentAssessment?: string;
      investigationChain?: string;
    }>
  ): Promise<ThreatInvestigationAgentOutput> {
    const startTime = Date.now();
    const logs: AgentActivityLog[] = [];

    // Stage 1: Correlation
    logs.push({
      id: `THREAT-AGENT-1-${Date.now()}`,
      agentName: 'Threat Investigation Agent',
      stage: 'Correlation',
      status: 'running',
      message: `Correlating ${findings.length} suspicious findings with ${events.length} event records across user, host, IP, and temporal proximity...`,
      timestamp: new Date().toISOString(),
    });

    const rawIncidents = CorrelationEngine.correlateFindings(events, findings);

    logs.push({
      id: `THREAT-AGENT-2-${Date.now()}`,
      agentName: 'Threat Investigation Agent',
      stage: 'Correlation',
      status: 'completed',
      message: `Synthesized ${rawIncidents.length} distinct security incident clusters from correlated event chains.`,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      metrics: {
        clustersFormed: rawIncidents.length,
      },
    });

    // Stage 2: Risk Scoring & Remediation Engine
    const scoringStart = Date.now();
    logs.push({
      id: `THREAT-AGENT-3-${Date.now()}`,
      agentName: 'Threat Investigation Agent',
      stage: 'Scoring',
      status: 'running',
      message: 'Calculating transparent multi-factor risk scores and generating mitigation recommendations...',
      timestamp: new Date().toISOString(),
    });

    let scoredIncidents = rawIncidents.map((inc) => RiskScorer.scoreIncident(inc, events));

    // Stage 3: AI Reasoning & Narrative Synthesis (if AI function provided)
    if (aiEnrichmentFn && scoredIncidents.length > 0) {
      logs.push({
        id: `THREAT-AGENT-4-${Date.now()}`,
        agentName: 'Threat Investigation Agent',
        stage: 'Reasoning',
        status: 'running',
        message: 'Enriching incident forensics with LLM cyber reasoning and MITRE kill-chain narrative...',
        timestamp: new Date().toISOString(),
      });

      try {
        const enrichedList: CorrelatedIncident[] = [];
        for (const inc of scoredIncidents) {
          try {
            const aiData = await aiEnrichmentFn(inc);
            enrichedList.push({
              ...inc,
              executiveSummary: aiData.executiveSummary || inc.executiveSummary,
              agentReasoning: {
                ...inc.agentReasoning,
                threatAgentAssessment: aiData.threatAgentAssessment || inc.agentReasoning.threatAgentAssessment,
                investigationChain: aiData.investigationChain || inc.agentReasoning.investigationChain,
              },
            });
          } catch (aiErr) {
            console.warn('AI incident enrichment skipped, using deterministic findings:', aiErr);
            enrichedList.push(inc);
          }
        }
        scoredIncidents = enrichedList;
      } catch (err) {
        console.warn('AI reasoning pass encountered error, falling back to deterministic synthesis:', err);
      }
    }

    const totalDuration = Date.now() - startTime;
    const criticalCount = scoredIncidents.filter((i) => i.severity === 'Critical').length;
    const highCount = scoredIncidents.filter((i) => i.severity === 'High').length;
    const avgRisk =
      scoredIncidents.length > 0
        ? Math.round(scoredIncidents.reduce((acc, i) => acc + i.riskScore, 0) / scoredIncidents.length)
        : 0;

    logs.push({
      id: `THREAT-AGENT-5-${Date.now()}`,
      agentName: 'Threat Investigation Agent',
      stage: 'Reasoning',
      status: 'completed',
      message: `Investigation complete. Formatted ${scoredIncidents.length} actionable incident(s) (Critical: ${criticalCount}, High: ${highCount}, Avg Risk: ${avgRisk}/100).`,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - scoringStart,
      metrics: {
        totalIncidents: scoredIncidents.length,
        critical: criticalCount,
        high: highCount,
        avgRiskScore: avgRisk,
      },
    });

    return {
      incidents: scoredIncidents,
      logs,
      metrics: {
        incidentsGenerated: scoredIncidents.length,
        criticalIncidents: criticalCount,
        highIncidents: highCount,
        avgRiskScore: avgRisk,
        executionTimeMs: totalDuration,
      },
    };
  }
}
