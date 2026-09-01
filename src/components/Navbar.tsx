import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Code,
  Activity,
  Terminal,
  BookOpen,
  Settings,
  Home,
  Compass,
  Cpu,
  Zap,
  GitBranch,
} from 'lucide-react';
import { SpiderWeb } from './SpiderWeb';
import { NewActionMenu } from './NewActionMenu';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user?: { username: string; email: string };
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user = { username: 'Security Researcher', email: 'ciso@enterprise.internal' },
  onLogout,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const navItems = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'scan', label: 'Log Threat Hunting', icon: Shield },
    { id: 'ml', label: 'XGBoost ML Model', icon: Cpu, highlight: true },
    { id: 'soar', label: 'SOAR Remediation', icon: Zap },
    { id: 'forensics', label: 'Forensics', icon: Terminal },
    { id: 'analytics', label: 'SOC Analytics', icon: Activity },
    { id: 'github', label: 'GitHub Sync', icon: GitBranch },
    { id: 'docs', label: 'Docs', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header
      className={`glass-nav sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-accent-primary/15 transition-all">
            <SpiderWeb className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium text-text-primary tracking-tight leading-none">
              <span className="text-accent-primary font-serif">M</span>atrix
            </h1>
            <span className="text-[10px] font-mono text-text-muted tracking-wider uppercase">
              XGBoost SIEM Mesh
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent-primary text-white shadow-sm font-semibold'
                    : item.highlight
                    ? 'text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 font-semibold'
                    : 'text-text-secondary hover:text-accent-primary hover:bg-warm-200/60'
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-accent-primary' : 'text-text-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <NewActionMenu onNavigate={onNavigate} />

          {/* User Profile Badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-warm-100/80 rounded-xl border border-warm-300/60">
            <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-semibold text-text-primary">{user.username}</div>
              <div className="text-[10px] text-text-muted font-mono truncate max-w-[120px]">
                {user.email}
              </div>
            </div>
          </div>

          {/* Quick Settings shortcut */}
          <button
            onClick={() => onNavigate('settings')}
            className={`p-2 rounded-xl border border-warm-300/50 hover:bg-warm-200/60 transition-all ${
              currentView === 'settings' ? 'text-accent-primary bg-warm-200' : 'text-text-muted'
            }`}
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

