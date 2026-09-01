import { NormalizedEvent, Severity, EventStatus } from '../types';

export class LogNormalizer {
  private static eventCounter = 1;

  public static resetCounter() {
    this.eventCounter = 1;
  }

  public static normalizeRawInput(rawInput: string, sourceHint: string = 'Security Gateway'): NormalizedEvent[] {
    const trimmed = rawInput.trim();
    if (!trimmed) return [];

    // 1. Try parsing as JSON Array or JSON Object
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => this.normalizeJsonObject(item, idx + 1, sourceHint));
        } else if (typeof parsed === 'object' && parsed !== null) {
          return [this.normalizeJsonObject(parsed, 1, sourceHint)];
        }
      } catch {
        // Fall through to JSONL / line-by-line parsing
      }
    }

    // 2. Try JSONL / Line-by-line detection
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Check if first non-empty line starts with '{' (JSON Lines)
    if (lines[0].trim().startsWith('{')) {
      const jsonlEvents: NormalizedEvent[] = [];
      lines.forEach((line, idx) => {
        try {
          const parsed = JSON.parse(line);
          jsonlEvents.push(this.normalizeJsonObject(parsed, idx + 1, sourceHint, line));
        } catch {
          // If JSON parse fails on a line, parse as plain syslog/text
          jsonlEvents.push(this.normalizeSyslogLine(line, idx + 1, sourceHint));
        }
      });
      if (jsonlEvents.length > 0) return jsonlEvents;
    }

    // 3. Try CSV Parsing (has comma/semicolon/tab header)
    if (lines.length > 1 && (lines[0].includes(',') || lines[0].includes(';') || lines[0].includes('\t'))) {
      const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
      const headerLine = lines[0].toLowerCase();
      // Check if header contains typical log fields
      if (
        headerLine.includes('time') ||
        headerLine.includes('event') ||
        headerLine.includes('user') ||
        headerLine.includes('ip') ||
        headerLine.includes('host') ||
        headerLine.includes('action') ||
        headerLine.includes('msg')
      ) {
        const headers = this.parseCsvRow(lines[0], delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
        const csvEvents: NormalizedEvent[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = this.parseCsvRow(lines[i], delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length > 0 && cols.some((c) => c.length > 0)) {
            csvEvents.push(this.normalizeCsvRecord(headers, cols, i, sourceHint, lines[i]));
          }
        }
        if (csvEvents.length > 0) return csvEvents;
      }
    }

    // 4. Default: Plain-text Syslog / Authlog / CEF Parser
    return lines.map((line, idx) => this.normalizeSyslogLine(line, idx + 1, sourceHint));
  }

  private static normalizeJsonObject(
    obj: Record<string, any>,
    index: number,
    sourceHint: string,
    rawLine?: string
  ): NormalizedEvent {
    const raw_event = rawLine || JSON.stringify(obj);

    const timestamp =
      this.extractString(obj, ['timestamp', '@timestamp', 'time', 'datetime', 'EventTime', 'date', 'Timestamp']) ||
      new Date(Date.now() - (100 - index) * 60000).toISOString();

    const source =
      this.extractString(obj, ['source', 'log_source', 'Channel', 'Provider', 'agent', 'service', 'source_type']) ||
      sourceHint;

    const event_type =
      this.extractString(obj, ['event_type', 'eventType', 'type', 'event_name', 'EventID', 'action_type', 'category']) ||
      'SECURITY_EVENT';

    const severity = this.mapSeverity(
      this.extractString(obj, ['severity', 'level', 'Severity', 'Priority', 'LogLevel']) || 'Medium'
    );

    const user =
      this.extractString(obj, ['user', 'username', 'user_name', 'AccountName', 'TargetUserName', 'actor', 'src_user']) ||
      'UNKNOWN_USER';

    const host =
      this.extractString(obj, ['host', 'hostname', 'computer_name', 'ComputerName', 'device_name', 'workstation', 'dhost']) ||
      'SRV-CORP-01';

    const source_ip =
      this.extractString(obj, ['source_ip', 'src_ip', 'srcip', 'client_ip', 'IpAddress', 'remote_ip', 'SourceNetworkAddress']) ||
      '';

    const destination_ip =
      this.extractString(obj, ['destination_ip', 'dest_ip', 'dst_ip', 'dstip', 'server_ip', 'target_ip']) ||
      '';

    const process =
      this.extractString(obj, ['process', 'process_name', 'ProcessName', 'Image', 'CommandLine', 'command', 'app']) ||
      '';

    const action =
      this.extractString(obj, ['action', 'activity', 'Operation', 'TaskCategory', 'method']) ||
      event_type;

    const status = this.mapStatus(
      this.extractString(obj, ['status', 'outcome', 'result', 'Status', 'LogonType'])
    );

    const message =
      this.extractString(obj, ['message', 'msg', 'description', 'Details', 'Payload', 'reason']) ||
      `${action} on ${host} by ${user}`;

    return {
      id: `EVT-${String(index).padStart(4, '0')}`,
      timestamp: this.standardizeDate(timestamp),
      source,
      event_type: event_type.toUpperCase(),
      severity,
      user,
      host,
      source_ip,
      destination_ip,
      process,
      action,
      status,
      message,
      raw_event,
      metadata: { ...obj },
    };
  }

  private static normalizeCsvRecord(
    headers: string[],
    cols: string[],
    index: number,
    sourceHint: string,
    rawLine: string
  ): NormalizedEvent {
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = cols[i] || '';
    });

    const timestamp =
      record['timestamp'] || record['time'] || record['date'] || record['@timestamp'] || new Date().toISOString();
    const source = record['source'] || record['service'] || record['channel'] || sourceHint;
    const event_type = record['event_type'] || record['type'] || record['event'] || record['action'] || 'EVENT';
    const severity = this.mapSeverity(record['severity'] || record['level'] || 'Medium');
    const user = record['user'] || record['username'] || record['user_name'] || record['account'] || 'UNKNOWN_USER';
    const host = record['host'] || record['hostname'] || record['computer'] || 'SRV-CORP-01';
    const source_ip = record['source_ip'] || record['src_ip'] || record['src'] || record['ip'] || '';
    const destination_ip = record['destination_ip'] || record['dest_ip'] || record['dst_ip'] || record['dst'] || '';
    const process = record['process'] || record['process_name'] || record['command'] || record['image'] || '';
    const action = record['action'] || event_type;
    const status = this.mapStatus(record['status'] || record['outcome'] || record['result']);
    const message = record['message'] || record['msg'] || record['description'] || `${action} by ${user}`;

    return {
      id: `EVT-${String(index).padStart(4, '0')}`,
      timestamp: this.standardizeDate(timestamp),
      source,
      event_type: event_type.toUpperCase(),
      severity,
      user,
      host,
      source_ip,
      destination_ip,
      process,
      action,
      status,
      message,
      raw_event: rawLine,
      metadata: record,
    };
  }

  private static normalizeSyslogLine(line: string, index: number, sourceHint: string): NormalizedEvent {
    // Regex matching standard Syslog/CEF format:
    // e.g., "2026-08-31 14:32:08 srv-ad01 sshd[1243]: Failed password for root from 192.168.1.105 port 54321 ssh2"
    // e.g., "Aug 31 14:32:08 host-01 kernel: [UFW BLOCK] IN=eth0 OUT= SRC=185.220.101.5 DST=10.0.0.15"

    const ipMatch = line.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
    const userMatch = line.match(/(?:user|for|account|userName|TargetUserName)[=:\s]+["']?([a-zA-Z0-9_\-\.\$\\]+)["']?/i);
    const hostMatch = line.match(/(?:host|hostname|ComputerName|device)[=:\s]+["']?([a-zA-Z0-9_\-\.]+)["']?/i);
    const processMatch = line.match(/(?:process|Image|cmd|command|exe|app)[=:\s]+["']?([^"'\s]+)["']?/i) || line.match(/([a-zA-Z0-9_\-]+\.(?:exe|sh|bin|ps1|py|bat|dll))/i);

    let event_type = 'SECURITY_LOG';
    let status: EventStatus = 'UNKNOWN';
    let severity: Severity = 'Medium';

    const lower = line.toLowerCase();
    if (lower.includes('failed') || lower.includes('failure') || lower.includes('invalid password') || lower.includes('access denied')) {
      event_type = 'AUTH_FAILURE';
      status = 'FAILURE';
      severity = 'High';
    } else if (lower.includes('accepted') || lower.includes('success') || lower.includes('logon success') || lower.includes('session opened')) {
      event_type = 'AUTH_SUCCESS';
      status = 'SUCCESS';
      severity = 'Low';
    } else if (lower.includes('sudo') || lower.includes('privilege') || lower.includes('elevat') || lower.includes('runas')) {
      event_type = 'PRIVILEGE_ESCALATION';
      severity = 'High';
      status = 'SUCCESS';
    } else if (lower.includes('block') || lower.includes('drop') || lower.includes('denied')) {
      event_type = 'NETWORK_BLOCKED';
      status = 'BLOCKED';
      severity = 'Medium';
    } else if (lower.includes('mimikatz') || lower.includes('powershell -enc') || lower.includes('shadowcopy') || lower.includes('vssadmin') || lower.includes('malware') || lower.includes('trojan')) {
      event_type = 'MALWARE_EXECUTION';
      severity = 'Critical';
      status = 'DETECTED';
    }

    // Extract timestamp from beginning of line if exists
    const dateMatch = line.match(/^([A-Za-z]{3}\s+\d+\s+\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/);
    const timestamp = dateMatch ? this.standardizeDate(dateMatch[1]) : new Date(Date.now() - (100 - index) * 60000).toISOString();

    return {
      id: `EVT-${String(index).padStart(4, '0')}`,
      timestamp,
      source: sourceHint,
      event_type,
      severity,
      user: userMatch ? userMatch[1] : 'SYSTEM',
      host: hostMatch ? hostMatch[1] : 'SRV-HOST-01',
      source_ip: ipMatch && ipMatch[0] ? ipMatch[0] : '',
      destination_ip: ipMatch && ipMatch[1] ? ipMatch[1] : '',
      process: processMatch ? processMatch[1] : '',
      action: event_type,
      status,
      message: line.length > 180 ? line.substring(0, 180) + '...' : line,
      raw_event: line,
      metadata: { rawFormat: 'syslog' },
    };
  }

  private static parseCsvRow(row: string, delimiter: string = ','): string[] {
    const pattern = new RegExp(
      '(\\s*' +
        (delimiter === '\t' ? '\\t' : delimiter) +
        '|\\r?\\n|\\r|^)' +
        '(?:"([^"]*(?:""[^"]*)*)"|([^"' +
        (delimiter === '\t' ? '\\t' : delimiter) +
        '\\r\\n]*))',
      'gi'
    );
    const result: string[] = [];
    let match: RegExpExecArray | null = null;
    while ((match = pattern.exec(row))) {
      let value = '';
      if (match[2]) {
        value = match[2].replace(/""/g, '"');
      } else if (match[3]) {
        value = match[3];
      }
      result.push(value);
    }
    return result;
  }

  private static extractString(obj: Record<string, any>, possibleKeys: string[]): string {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') {
        return String(obj[key]).trim();
      }
    }
    // Case-insensitive fallback
    const objKeys = Object.keys(obj);
    for (const key of possibleKeys) {
      const matchedKey = objKeys.find((k) => k.toLowerCase() === key.toLowerCase());
      if (matchedKey && obj[matchedKey] !== undefined && obj[matchedKey] !== null) {
        return String(obj[matchedKey]).trim();
      }
    }
    return '';
  }

  private static mapSeverity(val: string): Severity {
    const lower = String(val).toLowerCase();
    if (lower.includes('crit') || lower === 'fatal' || lower === 'emergency' || lower === '0' || lower === '1') {
      return 'Critical';
    }
    if (lower.includes('high') || lower === 'err' || lower === 'error' || lower === '2' || lower === '3') {
      return 'High';
    }
    if (lower.includes('med') || lower === 'warn' || lower === 'warning' || lower === '4') {
      return 'Medium';
    }
    if (lower.includes('low') || lower === 'notice' || lower === '5') {
      return 'Low';
    }
    return 'Informational';
  }

  private static mapStatus(val: string): EventStatus {
    if (!val) return 'UNKNOWN';
    const lower = String(val).toLowerCase();
    if (lower.includes('success') || lower === '0' || lower === 'ok' || lower === 'allow' || lower === 'pass') {
      return 'SUCCESS';
    }
    if (lower.includes('fail') || lower.includes('denied') || lower.includes('invalid') || lower === 'error') {
      return 'FAILURE';
    }
    if (lower.includes('block') || lower.includes('drop') || lower.includes('quarantine')) {
      return 'BLOCKED';
    }
    if (lower.includes('detect') || lower.includes('alert') || lower.includes('flag')) {
      return 'DETECTED';
    }
    return 'UNKNOWN';
  }

  private static standardizeDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    } catch {
      // ignore
    }
    return new Date().toISOString();
  }
}
