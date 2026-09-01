import { LogNormalizer } from '../src/pipeline/normalizer';
import { DetectionEngine } from '../src/pipeline/detectionEngine';
import { CorrelationEngine } from '../src/pipeline/correlationEngine';
import { RiskScorer } from '../src/pipeline/riskScorer';
import { AgentOrchestrator } from '../src/pipeline/orchestrator';
import { DEMO_SCENARIOS } from '../src/data/demoScenarios';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting SIH26S01 Pipeline Test Suite...\n');

  // Test 1: JSON Log Normalization
  console.log('--- Test 1: JSON Log Normalization ---');
  const jsonScenario = DEMO_SCENARIOS[0];
  const normalizedJson = LogNormalizer.normalizeRawInput(jsonScenario.sampleRawLog);
  assert(normalizedJson.length === 8, `Expected 8 events, got ${normalizedJson.length}`);
  assert(normalizedJson[0].user === 'jdoe', `Expected user 'jdoe', got ${normalizedJson[0].user}`);
  assert(normalizedJson[0].severity === 'High', `Expected severity 'High', got ${normalizedJson[0].severity}`);

  // Test 2: CSV Log Normalization
  console.log('\n--- Test 2: CSV Log Normalization ---');
  const csvScenario = DEMO_SCENARIOS[1];
  const normalizedCsv = LogNormalizer.normalizeRawInput(csvScenario.sampleRawLog);
  assert(normalizedCsv.length === 6, `Expected 6 CSV events, got ${normalizedCsv.length}`);
  assert(normalizedCsv[0].user === 'svc_backup', `Expected user 'svc_backup', got ${normalizedCsv[0].user}`);

  // Test 3: Syslog Normalization
  console.log('\n--- Test 3: Syslog Normalization ---');
  const syslogScenario = DEMO_SCENARIOS[2];
  const normalizedSyslog = LogNormalizer.normalizeRawInput(syslogScenario.sampleRawLog);
  assert(normalizedSyslog.length === 5, `Expected 5 syslog events, got ${normalizedSyslog.length}`);

  // Test 4: Detection Engine Rule Triggering
  console.log('\n--- Test 4: Detection Engine Rules ---');
  const { findings, flaggedEvents } = DetectionEngine.runDetection(normalizedJson);
  assert(findings.length >= 3, `Expected at least 3 findings for BruteForce scenario, got ${findings.length}`);
  assert(
    findings.some((f) => f.threatCategory === 'Brute Force'),
    'Detection engine caught Brute Force'
  );
  assert(
    findings.some((f) => f.threatCategory === 'Privilege Escalation'),
    'Detection engine caught Privilege Escalation'
  );
  assert(
    findings.some((f) => f.threatCategory === 'Malware Activity'),
    'Detection engine caught Malware Execution'
  );

  // Test 5: Event Correlation
  console.log('\n--- Test 5: Event Correlation ---');
  const correlated = CorrelationEngine.correlateFindings(flaggedEvents, findings);
  assert(correlated.length >= 1, `Expected at least 1 correlated incident, got ${correlated.length}`);
  assert(correlated[0].affectedEntities.users.includes('jdoe'), 'Correlated incident includes user jdoe');

  // Test 6: Risk Scoring & Remediation
  console.log('\n--- Test 6: Risk Scoring ---');
  const scored = RiskScorer.scoreIncident(correlated[0], flaggedEvents);
  assert(scored.riskScore >= 70, `Expected high/critical risk score >= 70, got ${scored.riskScore}`);
  assert(scored.riskFactors.length >= 3, `Expected at least 3 risk factor explanations, got ${scored.riskFactors.length}`);
  assert(scored.recommendations.length >= 2, `Expected at least 2 recommendations, got ${scored.recommendations.length}`);

  // Test 7: Full Agent Orchestrator End-to-End Execution
  console.log('\n--- Test 7: Full Agent Orchestration ---');
  const result = await AgentOrchestrator.runInvestigation(jsonScenario.sampleRawLog, {
    scenarioName: 'Brute Force Test',
  });
  assert(result.ingestedCount === 8, 'Orchestrator ingested 8 events');
  assert(result.incidents.length >= 1, 'Orchestrator produced correlated incident');
  assert(result.agentLogs.length >= 4, 'Orchestrator recorded multi-agent activity logs');
  assert(result.processingMetrics.totalTimeMs >= 0, 'Orchestrator computed timing metrics');

  // Test 8: Malformed / Edge Case Log Handling
  console.log('\n--- Test 8: Malformed Log Handling ---');
  const emptyRes = LogNormalizer.normalizeRawInput('');
  assert(emptyRes.length === 0, 'Empty string returns empty array');
  const badJsonRes = LogNormalizer.normalizeRawInput('{ corrupted json: not valid');
  assert(badJsonRes.length === 1, 'Bad JSON falls back gracefully to line parsing');

  console.log('\n🎉 ALL PIPELINE TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
