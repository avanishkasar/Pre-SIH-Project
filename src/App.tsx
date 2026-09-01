import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { HubView } from './views/HubView';
import { ScanView } from './views/ScanView';
import { RepoView } from './views/RepoView';
import { ForensicsView } from './views/ForensicsView';
import { AnalyticsView } from './views/AnalyticsView';
import { DocsView } from './views/DocsView';
import { SettingsView } from './views/SettingsView';
import { MLModelView } from './views/MLModelView';
import { SOARRemediationView } from './views/SOARRemediationView';
import { GitHubSyncView } from './views/GitHubSyncView';
import { Chatbot } from './components/Chatbot';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentUser = {
    username: 'Security Researcher',
    email: 'ciso@matrix-mesh.internal',
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#2D5A4A]/20 selection:text-[#2D5A4A]">
      {/* Matrix Glass Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'home' && <HomeView onNavigate={setCurrentView} />}
        {currentView === 'hub' && <HubView onNavigate={setCurrentView} />}
        {currentView === 'scan' && <ScanView />}
        {currentView === 'ml' && <MLModelView />}
        {currentView === 'soar' && <SOARRemediationView />}
        {currentView === 'repo' && <RepoView />}
        {currentView === 'forensics' && <ForensicsView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'github' && <GitHubSyncView />}
        {currentView === 'docs' && <DocsView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Floating Matrix AI Security Assistant Trigger */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="btn-primary py-3 px-4 rounded-full shadow-2xl gap-2 text-xs font-semibold flex items-center border border-white/20 animate-bounce"
            title="Ask Matrix AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span>Matrix AI Copilot</span>
          </button>
        )}

        <Chatbot
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>
    </div>
  );
}

