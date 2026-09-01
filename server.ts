import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { AgentOrchestrator } from './src/pipeline/orchestrator';
import { DEMO_SCENARIOS } from './src/data/demoScenarios';
import { CorrelatedIncident } from './src/types';

dotenv.config();

let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    try {
      genAiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Gemini SDK client:', err);
    }
  }
  return genAiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Matrix Autonomous Security Intelligence Mesh',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Matrix AI Copilot Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, scanContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const gemini = getGeminiClient();

      if (gemini) {
        try {
          const systemPrompt = `You are the Matrix Autonomous Security Assistant, an elite AI cybersecurity researcher and offensive security engineer.
You assist developers and CISOs in understanding vulnerabilities (OWASP Top 10, CWEs), explaining exploit mechanics, proposing secure code remediations, writing WAF rules (ModSecurity, Cloudflare, AWS WAF), and guiding threat investigations.

Scan context if provided:
${scanContext ? JSON.stringify(scanContext, null, 2) : 'No specific scan active.'}

User message: ${message}

Instructions:
1. Provide a direct, highly technical, and actionable response with code blocks or diffs if relevant.
2. At the end, propose 3 short follow-up questions the user might want to ask.
Return JSON formatted with keys: "response" (markdown string) and "suggested_questions" (array of 3 strings).`;

          const result = await gemini.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: systemPrompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          if (result.text) {
            const parsed = JSON.parse(result.text);
            return res.json({
              response: parsed.response,
              suggested_questions: parsed.suggested_questions || [
                'How do I fix the high severity issues?',
                'Show me an exploit payload example',
                'Generate a ModSecurity rule',
              ],
            });
          }
        } catch (aiErr) {
          console.warn('Gemini chat call failed, using fallback rule-based response:', aiErr);
        }
      }

      // Fallback deterministic security intelligence
      let responseText = `### 🛡️ Matrix Security Copilot Assessment\n\nI analyzed your query: **"${message}"**.\n\n`;

      if (message.toLowerCase().includes('sql') || message.toLowerCase().includes('injection')) {
        responseText += `#### SQL Injection (CWE-89) Remediation\n- **Prepared Statements:** Always use parameterized SQL bindings instead of concatenating strings.\n- **Example (PostgreSQL / Node.js):**\n\`\`\`typescript\n// Secure Parameterized Query\nconst res = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);\n\`\`\`\n- **ORM Protection:** Prisma and TypeORM automatically bind variables securely.`;
      } else if (message.toLowerCase().includes('xss')) {
        responseText += `#### Cross-Site Scripting (CWE-79) Mitigation\n- **HTML Encoding:** Context-encode dynamic user reflections before injecting into the DOM.\n- **Content Security Policy:**\n\`\`\`http\nContent-Security-Policy: default-src 'self'; script-src 'self' https://trustedscripts.com\n\`\`\`\n- **Sanitization:** Pass untrusted markup through \`DOMPurify.sanitize(input)\`.`;
      } else if (message.toLowerCase().includes('waf')) {
        responseText += `#### ModSecurity WAF Rule Example\n\`\`\`apache\nSecRule ARGS "@rx union.*select" "id:10001,phase:2,deny,status:403,msg:'SQLi Attack Detected'"\n\`\`\``;
      } else {
        responseText += `Autonomous agents are currently active across the security mesh. To verify specific targets, initiate a scan or review existing CVSS v3.1 reports in the **Analytics** module.`;
      }

      return res.json({
        response: responseText,
        suggested_questions: [
          'What are the most critical findings?',
          'How do I patch SQL injection?',
          'Write a WAF filter rule',
        ],
      });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({ error: 'Internal chat error', details: err?.message });
    }
  });

  // Auth Status Endpoint
  app.get('/api/auth/me', (_req, res) => {
    res.json({
      id: 1,
      username: 'Security Researcher',
      email: 'ciso@matrix-mesh.internal',
      full_name: 'Lead Cybersecurity Analyst',
      is_active: true,
      is_verified: true,
    });
  });

  app.get('/api/scenarios', (_req, res) => {
    res.json({ scenarios: DEMO_SCENARIOS });
  });

  // Main Investigation Endpoint
  app.post('/api/investigate', async (req, res) => {
    try {
      const { rawLogs, scenarioId, sourceHint } = req.body;

      let logsToProcess = rawLogs;
      let scenarioTitle = 'Ad-hoc Log Investigation';

      if (!logsToProcess && scenarioId) {
        const matched = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
        if (matched) {
          logsToProcess = matched.sampleRawLog;
          scenarioTitle = matched.title;
        }
      }

      if (!logsToProcess || typeof logsToProcess !== 'string') {
        return res.status(400).json({ error: 'Missing rawLogs payload or valid scenarioId' });
      }

      const gemini = getGeminiClient();

      // Optional AI reasoning enrichment function
      const aiEnrichmentFn = gemini
        ? async (incident: CorrelatedIncident) => {
            try {
              const prompt = `You are a Principal Threat Hunter & Incident Responder investigating a security incident.
Analyze the following incident data:
- Title: ${incident.title}
- Threat Category: ${incident.threatCategory}
- Affected Entities: ${JSON.stringify(incident.affectedEntities)}
- Attack Sequence: ${incident.attackSequence.join('\n')}
- Suspicious Evidence: ${incident.whySuspicious}

Provide a concise 3-part structured assessment:
1. Executive Summary (2 sentences for CISO)
2. Threat Assessment & Attacker Intent (2 sentences on likely tactics and objectives)
3. Investigation Chain (1 sentence summarizing the forensic correlation path)

Return output strictly in JSON format with keys:
"executiveSummary", "threatAgentAssessment", "investigationChain"`;

              const response = await gemini.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: prompt,
                config: {
                  responseMimeType: 'application/json',
                },
              });

              if (response.text) {
                const parsed = JSON.parse(response.text);
                return {
                  executiveSummary: parsed.executiveSummary,
                  threatAgentAssessment: parsed.threatAgentAssessment,
                  investigationChain: parsed.investigationChain,
                };
              }
            } catch (aiErr) {
              console.warn('Gemini API call failed, falling back to deterministic reasoning:', aiErr);
            }
            return {};
          }
        : undefined;

      const investigationResult = await AgentOrchestrator.runInvestigation(logsToProcess, {
        scenarioName: scenarioTitle,
        sourceHint: sourceHint || 'Security Gateway',
        aiEnrichmentFn,
      });

      res.json(investigationResult);
    } catch (err: any) {
      console.error('Error during log investigation:', err);
      res.status(500).json({
        error: 'Failed to process security logs',
        details: err?.message || String(err),
      });
    }
  });

  // Mitigation Action Trigger Endpoint
  app.post('/api/mitigate', (req, res) => {
    const { actionId, incidentId, actionTitle, targetEntity } = req.body;
    res.json({
      success: true,
      actionId: actionId || `MIT-${Date.now()}`,
      incidentId,
      actionTitle,
      targetEntity,
      status: 'Applied',
      appliedAt: new Date().toISOString(),
      simulatedOutput: `[SOAR Orchestrator] Successfully executed containment action "${actionTitle}" targeting "${targetEntity}". Rule ID #${Math.floor(10000 + Math.random() * 90000)} active on boundary security controllers.`,
    });
  });

  // Vite Middleware integration for dev / static hosting in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Matrix Autonomous Security Assistant listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
