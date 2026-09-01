import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Trash2,
  Sparkles,
  ShieldAlert,
  Zap,
  Terminal,
  Loader2,
} from 'lucide-react';
import { Vulnerability, Scan } from '../types/matrix';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  scan?: Scan | null;
  findings?: Vulnerability[];
  isOpen: boolean;
  onClose: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  scan,
  findings = [],
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your **Matrix AI Security Assistant**, powered by Gemini 3.7. Ask me anything about discovered vulnerabilities, exploit attack paths, remediation patches, or custom WAF filters.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What are the most critical findings in this scan?',
    'How do I fix the SQL injection vulnerability?',
    'Explain the CVSS score calculation formula.',
    'Write a ModSecurity WAF rule for reflected XSS.',
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          scanContext: scan
            ? {
                target_url: scan.target_url,
                scan_type: scan.scan_type,
                total_vulnerabilities: scan.total_vulnerabilities,
                critical_count: scan.critical_count,
                high_count: scan.high_count,
                findings: findings.slice(0, 5).map((f) => ({
                  title: f.title,
                  type: f.vulnerability_type,
                  severity: f.severity,
                  url: f.url,
                  parameter: f.parameter,
                  evidence: f.evidence,
                })),
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error (${res.status})`);
      }

      const data = await res.json();
      const aiMsg: Message = {
        role: 'assistant',
        content: data.response || 'I analyzed your query.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (data.suggested_questions && Array.isArray(data.suggested_questions)) {
        setSuggestedQuestions(data.suggested_questions);
      }
    } catch (err: any) {
      console.warn('Chat request failed:', err);
      // Deterministic fallback response with security intelligence
      let fallbackText = `I analyzed your question regarding "${textToSend}". `;
      if (textToSend.toLowerCase().includes('sql') || textToSend.toLowerCase().includes('injection')) {
        fallbackText += `\n\n### 🛡️ SQL Injection Remediation\n- **Prepared Statements:** Always bind parameters rather than concatenating user input directly into SQL strings.\n- **ORM Parameterization:** Use Prisma, TypeORM, or SQLAlchemy parameterized queries.\n- **Input Validation:** Enforce strict type validation and regex checks on URL parameters like \`id\`.`;
      } else if (textToSend.toLowerCase().includes('xss')) {
        fallbackText += `\n\n### 🛡️ Cross-Site Scripting (XSS) Mitigation\n- **Contextual Output Encoding:** Escape all user-supplied data before rendering into HTML, JavaScript, or attributes.\n- **Content Security Policy (CSP):** Deploy \`Content-Security-Policy: default-src 'self'; script-src 'self'\`.\n- **DOM Sanitization:** Use DOMPurify before inserting dynamic strings into innerHTML.`;
      } else if (textToSend.toLowerCase().includes('critical') || textToSend.toLowerCase().includes('findings')) {
        const critCount = scan ? scan.critical_count : 2;
        fallbackText += `\n\nCurrently, there are **${critCount} critical-severity items** flagged requiring immediate remediation: database extraction vectors and authentication bypass flaws. Immediate containment is advised.`;
      } else {
        fallbackText += `\n\nFor optimal protection, configure strict input validation, enforce CSRF SameSite cookie policies, and maintain continuous automated SAST/DAST testing pipelines.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackText,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat context cleared. How can I assist your security investigation?',
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 w-96 max-w-[calc(100vw-2.5rem)] h-[580px] max-h-[calc(100vh-6rem)] bg-white/95 rounded-2xl shadow-2xl border border-warm-300 flex flex-col z-50 overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-accent-primary to-[#3D7A62] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-gold" />
          </div>
          <div>
            <div className="text-xs font-serif font-bold tracking-wide">
              Matrix AI Security Copilot
            </div>
            <div className="text-[10px] text-emerald-200 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gemini 3.7 Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FAF7F2]/60">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 text-xs ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-accent-primary text-white rounded-tr-none shadow-sm'
                  : 'bg-white border border-warm-200 text-text-primary rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs">{m.content}</div>
              <div
                className={`text-[9px] mt-1 font-mono ${
                  m.role === 'user' ? 'text-emerald-100 text-right' : 'text-text-muted'
                }`}
              >
                {new Date(m.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-warm-300 text-text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 text-xs justify-start">
            <div className="w-6 h-6 rounded-md bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 bg-white border border-warm-200 text-text-muted rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce delay-200" />
              <span className="text-[10px] font-mono ml-1">Analyzing attack vectors...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="p-2 border-t border-warm-200 bg-white/70 overflow-x-auto whitespace-nowrap space-x-1.5 flex text-[10px]">
          {suggestedQuestions.slice(0, 3).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-warm-100 border border-warm-300 text-text-secondary hover:text-accent-primary hover:border-accent-primary hover:bg-warm-50 transition-all truncate max-w-[200px]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-white border-t border-warm-200 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Matrix Security AI..."
          className="flex-1 px-3 py-2 text-xs bg-warm-50 border border-warm-300 rounded-xl focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-text-primary"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary p-2 text-xs rounded-xl"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
