import { jsPDF } from 'jspdf';
import { IncidentReportData } from '../pipeline/agents/reportingAgent';

export class ReportGenerator {
  public static downloadPdf(report: IncidentReportData): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 16;

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Header Title
    doc.setTextColor(248, 250, 252);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AGENTIC AI CYBERSECURITY ASSISTANT | SIH26S01', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`AUTOMATED INCIDENT DOSSIER • Generated: ${new Date(report.generatedAt).toUTCString()}`, 14, 20);

    y = 36;

    // Incident ID & Status Bar
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${report.incidentId}: ${report.title}`, 18, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const severityColor = report.severity === 'Critical' ? [220, 38, 38] : report.severity === 'High' ? [234, 88, 12] : [37, 99, 235];
    doc.text(`Threat: ${report.threatCategory}   |   Risk Score: ${report.riskScore}/100   |   Confidence: ${report.confidenceScore}%`, 18, y + 16);

    y += 30;

    // Section 1: Executive Summary
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. EXECUTIVE SUMMARY', 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitExec = doc.splitTextToSize(report.executiveSummary, pageWidth - 28);
    doc.text(splitExec, 14, y);
    y += splitExec.length * 4.2 + 4;

    // Section 2: Why It Is Suspicious
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. INVESTIGATION ANALYSIS & REASONING', 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitSusp = doc.splitTextToSize(report.whySuspicious, pageWidth - 28);
    doc.text(splitSusp, 14, y);
    y += splitSusp.length * 4.2 + 4;

    // Section 3: Affected Assets & IOCs
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. IMPACTED ENTITIES & INDICATORS', 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const entitiesText = `Target User(s): ${report.affectedEntities.users.join(', ') || 'N/A'}\nTarget Host(s): ${report.affectedEntities.hosts.join(', ') || 'N/A'}\nObserved IPs: ${report.affectedEntities.ips.join(', ') || 'N/A'}\nProcesses: ${report.affectedEntities.processes.join(', ') || 'N/A'}`;
    const splitEntities = doc.splitTextToSize(entitiesText, pageWidth - 28);
    doc.text(splitEntities, 14, y);
    y += splitEntities.length * 4 + 4;

    // Section 4: MITRE ATT&CK Mapping
    if (report.mitreTactics.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('4. MITRE ATT&CK ALIGNMENT', 14, y);
      y += 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      report.mitreTactics.forEach((m) => {
        doc.text(`• [${m.techniqueId}] ${m.techniqueName} (${m.tactic})`, 18, y);
        y += 4;
      });
      y += 3;
    }

    // Check if new page needed
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    // Section 5: Risk Factors Breakdown
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('5. TRANSPARENT RISK SCORING MODEL', 14, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    report.riskFactors.forEach((rf) => {
      doc.text(`• ${rf.factor} (+${rf.scoreContribution} pts) [${rf.weight} Weight]: ${rf.description}`, 18, y);
      y += 4.5;
    });
    y += 4;

    // Check if new page needed
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    // Section 6: Recommended Remediation Playbook
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('6. RECOMMENDED RESPONSE ACTIONS', 14, y);
    y += 5;

    report.recommendations.forEach((rec, idx) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`, 18, y);
      y += 4;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`   Reason: ${rec.reason}`, 18, y);
      y += 4;
      doc.text(`   Impact: ${rec.impact}`, 18, y);
      y += 4.5;
    });
    y += 3;

    // Check if new page needed
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    // Section 7: Multi-Agent Audit Log
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('7. MULTI-AGENT COLLABORATION AUDIT TRAIL', 14, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`• Log Analysis Agent: ${report.agentContributions.logAnalysisAgent}`, 18, y);
    y += 4.5;
    doc.text(`• Threat Investigation Agent: ${report.agentContributions.threatInvestigationAgent}`, 18, y);
    y += 4.5;
    doc.text(`• Incident Reporting Agent: ${report.agentContributions.reportingAgent}`, 18, y);
    y += 8;

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `SIH26S01 Agentic AI Cybersecurity Platform • Incident Report ${report.incidentId} • Page ${i} of ${pageCount}`,
        pageWidth / 2,
        288,
        { align: 'center' }
      );
    }

    doc.save(`Incident_Report_${report.incidentId}.pdf`);
  }

  public static downloadJson(report: IncidentReportData): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Incident_Report_${report.incidentId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
