import React, { useState, useRef, useEffect } from 'react';
import { Plus, Shield, Cpu, Zap, Terminal, GitBranch, ChevronDown } from 'lucide-react';

interface NewActionMenuProps {
  onNavigate: (view: string) => void;
}

export const NewActionMenu: React.FC<NewActionMenuProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary text-xs py-2 px-3.5 gap-1.5 shadow-sm rounded-xl"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Quick Action</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 glass-card p-2 shadow-2xl border border-warm-300 z-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted px-3 py-1.5 border-b border-warm-200/60 mb-1">
            Autonomous Actions
          </div>

          <button
            onClick={() => {
              onNavigate('scan');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs text-text-primary hover:bg-warm-100 hover:text-accent-primary transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-105 transition-transform">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold">Log Threat Hunting</div>
              <div className="text-[10px] text-text-muted">Ingest & Correlate Logs</div>
            </div>
          </button>

          <button
            onClick={() => {
              onNavigate('ml');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs text-text-primary hover:bg-warm-100 hover:text-accent-primary transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-105 transition-transform">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold">XGBoost ML Inspector</div>
              <div className="text-[10px] text-text-muted">12-Feature Extraction & SHAP</div>
            </div>
          </button>

          <button
            onClick={() => {
              onNavigate('soar');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs text-text-primary hover:bg-warm-100 hover:text-accent-primary transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold">SOAR Containment</div>
              <div className="text-[10px] text-text-muted">Execute IP / User Block</div>
            </div>
          </button>

          <button
            onClick={() => {
              onNavigate('github');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs text-text-primary hover:bg-warm-100 hover:text-accent-primary transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold">Sync with GitHub</div>
              <div className="text-[10px] text-text-muted">Push Codebase & Notebook</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
