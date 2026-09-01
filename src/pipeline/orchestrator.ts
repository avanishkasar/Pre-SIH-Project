import { LogAnalysisAgent } from './agents/logAnalysisAgent';
import { ThreatInvestigationAgent } from './agents/threatInvestigationAgent';
import { ReportingAgent } from './agents/reportingAgent';
import { InvestigationResult, CorrelatedIncident } from '../types';

export class AgentOrchestrator {
  public static async runInvestigation(
    rawLogs: string,
    options: {
      scenarioName?: string;
      sourceHint?: string;
      aiEnrichmentFn?: (incident: CorrelatedIncident) => Promise<{
        executiveSummary?: string;
        threatAgentAssessment?: string;
        investigationChain?: string;
      }>;
    } = {}
  ): Promise<InvestigationResult> {
    const pipelineStartTime = Date.now();
    const rawLogSizeBytes = new Blob([rawLogs]).size;

    // Step 1: Run Log Analysis Agent
    const logAgentStart = Date.now();
    const logAnalysisOutput = await LogAnalysisAgent.analyze(rawLogs, options.sourceHint || 'SOC SIEM Ingest');
    const logAgentTimeMs = Date.now() - logAgentStart;

    // Step 2: Run Threat Investigation Agent
    const threatAgentStart = Date.now();
    const threatInvestigationOutput = await ThreatInvestigationAgent.investigate(
      logAnalysisOutput.normalizedEvents,
      logAnalysisOutput.suspiciousFindings,
      options.aiEnrichmentFn
    );
    const threatAgentTimeMs = Date.now() - threatAgentStart;

    // Step 3: Run Incident Reporting Agent for primary incident
    const reportingStart = Date.now();
    const reportingLogs = threatInvestigationOutput.incidents.length > 0
      ? ReportingAgent.generateReport(
          threatInvestigationOutput.incidents[0],
          logAnalysisOutput.normalizedEvents
        ).logs
      : [];
    const reportingTimeMs = Date.now() - reportingStart;

    const totalTimeMs = Date.now() - pipelineStartTime;
    const eventsPerSec =
      logAnalysisOutput.normalizedEvents.length > 0 && totalTimeMs > 0
        ? Math.round((logAnalysisOutput.normalizedEvents.length / totalTimeMs) * 1000)
        : 0;

    const allAgentLogs = [
      ...logAnalysisOutput.logs,
      ...threatInvestigationOutput.logs,
      ...reportingLogs,
    ];

    return {
      id: `INV-${Date.now()}`,
      scenarioName: options.scenarioName || 'Automated Threat Investigation',
      ingestedCount: logAnalysisOutput.normalizedEvents.length,
      normalizedEvents: logAnalysisOutput.normalizedEvents,
      suspiciousFindings: logAnalysisOutput.suspiciousFindings,
      incidents: threatInvestigationOutput.incidents,
      agentLogs: allAgentLogs,
      processingMetrics: {
        totalTimeMs,
        logAgentTimeMs,
        threatAgentTimeMs,
        reportingTimeMs,
        eventsPerSec,
        rawLogSizeBytes,
      },
      aiPowered: Boolean(options.aiEnrichmentFn),
      timestamp: new Date().toISOString(),
    };
  }
}
