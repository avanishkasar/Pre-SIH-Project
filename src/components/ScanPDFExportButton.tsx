import React, { useState } from 'react';
import { Download, FileText, Loader2, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import { Scan, Vulnerability } from '../types/matrix';

interface ScanPDFExportButtonProps {
  scan: Scan;
  findings: Vulnerability[];
}

export const ScanPDFExportButton: React.FC<ScanPDFExportButtonProps> = ({ scan, findings }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const generatePDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Colors
      const primaryGreen = [45, 90, 74];
      const darkText = [44, 36, 22];
      const grayText = [139, 125, 107];

      // Header Banner
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.rect(0, 0, 210, 24, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('MATRIX SECURITY INTELLIGENCE REPORT', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`CONFIDENTIAL • CISO EXECUTIVE DOSSIER`, 150, 15);

      // Metadata Block
      let y = 34;
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Security Assessment', 14, y);

      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(`Target URL: ${scan.target_url}`, 14, y);
      doc.text(`Scan ID: SCAN-${scan.id}`, 140, y);

      y += 6;
      doc.text(`Assessment Type: ${scan.scan_type}`, 14, y);
      doc.text(`Completed: ${scan.completed_at || new Date().toLocaleString()}`, 140, y);

      // Severity Summary Cards
      y += 12;
      doc.setFillColor(253, 249, 243);
      doc.roundedRect(14, y, 182, 22, 3, 3, 'F');

      const colWidth = 36;
      const counts = [
        { label: 'CRITICAL', count: scan.critical_count, color: [220, 38, 38] },
        { label: 'HIGH', count: scan.high_count, color: [234, 88, 12] },
        { label: 'MEDIUM', count: scan.medium_count, color: [217, 119, 6] },
        { label: 'LOW', count: scan.low_count, color: [2, 132, 199] },
        { label: 'TOTAL', count: scan.total_vulnerabilities, color: primaryGreen },
      ];

      counts.forEach((c, i) => {
        const xPos = 18 + i * colWidth;
        doc.setTextColor(c.color[0], c.color[1], c.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(String(c.count), xPos + 10, y + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text(c.label, xPos + 6, y + 16);
      });

      // Findings List Header
      y += 32;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text('Key Vulnerability Findings', 14, y);

      y += 8;
      findings.slice(0, 8).forEach((v, idx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(255, 252, 247);
        doc.roundedRect(14, y, 182, 26, 2, 2, 'F');

        // Severity Tag
        let badgeColor = [2, 132, 199];
        if (v.severity === 'critical') badgeColor = [220, 38, 38];
        if (v.severity === 'high') badgeColor = [234, 88, 12];
        if (v.severity === 'medium') badgeColor = [217, 119, 6];

        doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        doc.rect(14, y, 3, 26, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        doc.text(`[${v.severity.toUpperCase()}] CVSS ${v.cvss_score || 'N/A'} • ${v.vulnerability_type.replace(/_/g, ' ').toUpperCase()}`, 20, y + 6);

        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(v.title.length > 70 ? v.title.slice(0, 67) + '...' : v.title, 20, y + 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text(`URL: ${v.url}  |  Parameter: ${v.parameter || 'N/A'}  |  CWE: ${v.cwe_id || 'CWE-N/A'}`, 20, y + 18);
        doc.text(`Remediation: ${v.remediation?.slice(0, 95) || 'Apply secure coding controls.'}...`, 20, y + 23);

        y += 30;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text(
          `Matrix Autonomous Security Intelligence • Page ${i} of ${pageCount} • Generated ${new Date().toLocaleDateString()}`,
          14,
          290
        );
      }

      doc.save(`Matrix_Security_Report_Scan_${scan.id}.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={generatePDF}
        disabled={isExporting}
        className="btn-secondary text-xs py-2 px-3.5 gap-1.5 shadow-sm rounded-xl"
        title="Download CISO Vector PDF Report"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : downloaded ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Download className="w-3.5 h-3.5 text-accent-primary" />
        )}
        <span>{downloaded ? 'Downloaded PDF' : isExporting ? 'Generating PDF...' : 'Export PDF'}</span>
      </button>

      <button
        onClick={() => {
          const blob = new Blob([JSON.stringify({ scan, findings }, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `matrix-scan-${scan.id}-audit.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="p-2 bg-warm-100 hover:bg-warm-200 text-text-secondary border border-warm-300 rounded-xl transition-all"
        title="Download raw JSON findings"
      >
        <FileText className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
