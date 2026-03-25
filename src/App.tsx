
import React, { useState, useEffect } from 'react';
import { useStore } from './app/store';
import { LoginPage } from './app/pages/Login';
import { IntroPage } from './app/pages/Intro';
import { NotesPage } from './app/pages/Notes';
import { ShoppingPage } from './app/pages/Shopping';
import { DocumentsPage } from './app/pages/Documents';
import { SettingsPage } from './app/pages/Settings';
import { ActivityPage } from './app/pages/Activity';
import { PasswordsPage } from './app/pages/Passwords';
import { VoiceNotesPage } from './app/pages/VoiceNotes';
import { Button } from './shared/ui';
import { TemplateRepository } from './infra/db';

const App: React.FC = () => {
  const [hasError, setHasError] = useState<Error | null>(null);
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-red-950 text-white p-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Error Crítico</h1>
        <p className="mb-4 text-red-200">{hasError.message}</p>
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="bg-white text-red-900 px-4 py-2 rounded font-bold"
        >
          Resetear y Reintentar
        </button>
      </div>
    );
  }

  return <AppContent onError={setHasError} />;
};

const AppContent: React.FC<{ onError: (e: Error) => void }> = ({ onError }) => {
  const { isLocked, lock, settings, wipe } = useStore();
  const [activeTab, setActiveTab] = useState('notes');
  const [globalSearch, setGlobalSearch] = useState('');
  
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return localStorage.getItem("bp_seen_intro_v1") !== "1";
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      TemplateRepository.seed();
    } catch (e) {
      console.error("Seed error", e);
      onError(e as Error);
    }

    let timeout: number;
    const resetTimer = () => {
      clearTimeout(timeout);
      if (!isLocked && !showIntro) {
        timeout = window.setTimeout(lock, settings.autoLockMinutes * 60000);
      }
    };

    const userEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    userEvents.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      userEvents.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, [lock, settings.autoLockMinutes, isLocked, showIntro, onError]);

  if (showIntro) {
    return <IntroPage onComplete={() => setShowIntro(false)} />;
  }

  if (isLocked) {
    return <LoginPage />;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#050505] text-gray-200 selection:bg-blue-500/30 ${settings.seniorMode ? 'senior-mode' : ''}`}>
      <header className="bg-black/50 backdrop-blur-xl border-b border-white/5 p-4 grid grid-cols-3 items-center sticky top-0 z-50 no-print safe-area-top">
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Búsqueda..." 
              className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white w-64 focus:outline-none focus:border-blue-500 transition-all"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-center">
          <h1 className="text-xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            BÓVEDA <span className="text-blue-500">PERSONAL</span>
          </h1>
        </div>

        <div className="flex justify-end gap-2">
          {settings.panicModeEnabled && (
            <button 
              onClick={() => confirm("¿PÁNICO? Se borrará TODO.") && wipe()}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              🔥 Pánico
            </button>
          )}
          <Button variant="ghost" size="sm" onClick={lock} className="border border-white/10 hover:bg-white/5">
            🔒 Bloquear
          </Button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-12 pb-32 max-w-6xl mx-auto w-full flex flex-col items-center">
        <div className="w-full">
          {activeTab === 'notes' && <NotesPage />}
          {activeTab === 'docs' && <DocumentsPage />}
          {activeTab === 'passwords' && <PasswordsPage />}
          {activeTab === 'voice' && <VoiceNotesPage />}
          {activeTab === 'shopping' && <ShoppingPage />}
          {activeTab === 'activity' && <ActivityPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-dark-surface/90 backdrop-blur-xl border-t border-dark-border flex justify-around items-center z-50 no-print safe-area-bottom pb-2 pt-2">
        <NavBtn act={activeTab === 'notes'} onClick={() => setActiveTab('notes')} label="Notas" icon="📝" />
        <NavBtn act={activeTab === 'docs'} onClick={() => setActiveTab('docs')} label="Docs" icon="📁" />
        <NavBtn act={activeTab === 'passwords'} onClick={() => setActiveTab('passwords')} label="Claves" icon="🔑" />
        <NavBtn act={activeTab === 'voice'} onClick={() => setActiveTab('voice')} label="Voz" icon="🎙️" />
        <NavBtn act={activeTab === 'shopping'} onClick={() => setActiveTab('shopping')} label="Lista" icon="🛒" />
        <NavBtn act={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ajustes" icon="⚙️" />
      </nav>
    </div>
  );
};

const NavBtn: React.FC<{ act: boolean; onClick: () => void; icon: string; label: string }> = ({ act, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center flex-1 py-1 transition-all ${act ? 'text-blue-500' : 'text-gray-500'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-bold uppercase mt-1">{label}</span>
  </button>
);

export default App;
