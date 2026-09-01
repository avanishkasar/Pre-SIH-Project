import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Upload,
  FileCode,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  User,
  Server,
  Network,
  Terminal,
  Layers,
} from 'lucide-react';
import { NormalizedEvent, Severity } from '../types';

interface LogExplorerProps {
  events: NormalizedEvent[];
  onIngestCustomLogs: (logs: string, sourceHint: string) => void;
  isProcessing: boolean;
}

export const LogExplorer: React.FC<LogExplorerProps> = ({
  events,
  onIngestCustomLogs,
  isProcessing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [customLogText, setCustomLogText] = useState('');
  const [customSource, setCustomSource] = useState('Custom SIEM Feed');
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        searchQuery === '' ||
        e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.source_ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
      const matchesSuspicious = !suspiciousOnly || e.isSuspicious;

      return matchesSearch && matchesSeverity && matchesSuspicious;
    });
  }, [events, searchQuery, severityFilter, suspiciousOnly]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomLogText(content);
      setCustomSource(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRunCustom = () => {
    if (!customLogText.trim()) return;
    setShowIngestModal(false);
    onIngestCustomLogs(customLogText, customSource);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters, Ingestion Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              id="input-search-logs"
              type="text"
              placeholder="Search by IP, user, host, action, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            id="select-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Suspicious Only Checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              checked={suspiciousOnly}
              onChange={(e) => setSuspiciousOnly(e.target.checked)}
              className="rounded border-slate-800 text-cyan-600 focus:ring-0"
            />
            <span>Suspicious Only</span>
          </label>

          {/* Ingest Logs Modal Button */}
          <button
            id="btn-open-ingest"
            onClick={() => setShowIngestModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-semibold shadow-lg shadow-cyan-900/20 border border-cyan-500 transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Ingest Custom Logs</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-200">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Normalized Telemetry Stream ({filteredEvents.length} records)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Schema: Unified SIEM Standard
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No events match your current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 font-mono text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Host</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">Action / Event Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredEvents.map((evt) => {
                  const isCrit = evt.severity === 'Critical';
                  const isHigh = evt.severity === 'High';

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        evt.isSuspicious ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-cyan-400 font-semibold">{evt.id}</td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {evt.timestamp.includes('T') ? evt.timestamp.split('T')[1].split('.')[0] : evt.timestamp}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCrit
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isHigh
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                              : evt.severity === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-100">{evt.user}</td>
                      <td className="py-2 px-3 text-slate-300">{evt.host}</td>
                      <td className="py-2 px-3 text-slate-500">{evt.source_ip || '-'}</td>
                      <td className="py-2 px-3 text-white truncate max-w-[200px]">
                        {evt.action || evt.event_type}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            evt.status === 'SUCCESS'
                              ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/40'
                              : evt.status === 'FAILURE'
                              ? 'text-rose-400 bg-rose-500/20 border border-rose-500/40'
                              : 'text-slate-400'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {selectedEvent.id}
                </span>
                <span className="text-xs font-semibold text-white">
                  Event Record Details
                </span>
                {selectedEvent.isSuspicious && (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                    Flagged by Detection Engine
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Timestamp</div>
                <div className="font-mono text-slate-200">{selectedEvent.timestamp}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Source Type</div>
                <div className="font-mono text-slate-200">{selectedEvent.source}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">User Account</div>
                <div className="font-mono text-slate-200">{selectedEvent.user}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Target Host</div>
                <div className="font-mono text-slate-200">{selectedEvent.host}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Source IP</div>
                <div className="font-mono text-slate-200">{selectedEvent.source_ip || 'N/A'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Dest IP</div>
                <div className="font-mono text-slate-200">{selectedEvent.destination_ip || 'N/A'}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-400">Message / Description</div>
              <div className="rounded-lg bg-slate-950 p-2.5 text-xs text-slate-200 font-mono border border-slate-800">
                {selectedEvent.message}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-400">Raw Telemetry</div>
              <pre className="rounded-lg bg-slate-950 p-2.5 text-[11px] text-slate-300 font-mono border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                {selectedEvent.raw_event}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Ingest Custom Logs Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Ingest Custom Security Logs
                </h3>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste or drag-and-drop security telemetry in <strong>JSON</strong>, <strong>JSONL</strong>, <strong>CSV</strong>, or <strong>Syslog</strong> format. The Log Analysis Agent will auto-detect the schema, normalize timestamps and entities, and execute threat detection.
            </p>

            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-800 hover:border-cyan-500 rounded-lg p-4 text-center cursor-pointer transition-colors bg-slate-950"
            >
              <FileText className="mx-auto h-6 w-6 text-slate-500 mb-1" />
              <label className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer">
                Upload a log file (.json, .csv, .log, .txt)
                <input
                  type="file"
                  accept=".json,.csv,.log,.txt,.jsonl"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <div className="text-[11px] text-slate-500 mt-0.5">or drag and drop here</div>
            </div>

            {/* Raw Text Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                Or Paste Raw Log Stream:
              </label>
              <textarea
                rows={7}
                placeholder="Paste JSON array, CSV with headers, or Syslog lines here..."
                value={customLogText}
                onChange={(e) => setCustomLogText(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                {customLogText.length > 0 ? `${customLogText.length} characters` : 'No payload'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIngestModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunCustom}
                  disabled={!customLogText.trim() || isProcessing}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/20 border border-cyan-500 disabled:opacity-50 cursor-pointer"
                >
                  Run Multi-Agent Investigation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
