
import React, { useState, useEffect } from 'react';
import { useStore } from './app/store';
import { LoginPage } from './app/pages/Login';
import { IntroPage } from './app/pages/Intro';
import { NotesPage } from './app/pages/Notes';
import { ShoppingPage } from './app/pages/Shopping';
import { DocumentsPage } from './app/pages/Documents';
import { AppointmentsPage } from './app/pages/Appointments';
import { SettingsPage } from './app/pages/Settings';
import { ActivityPage } from './app/pages/Activity';
import { Button } from './shared/ui';
import { TemplateRepository } from './infra/db';

const App: React.FC = () => {
  const { isLocked, lock, settings, wipe } = useStore();
  const [activeTab, setActiveTab] = useState('notes');
  
  // Determinamos si se debe mostrar la pantalla de Intro al arrancar
  const [showIntro, setShowIntro] = useState(() => {
    // Solo se muestra si el valor en localStorage no es "1"
    return localStorage.getItem("bp_seen_intro_v1") !== "1";
  });

  useEffect(() => {
    // Inicialización de plantillas base en la DB local
    TemplateRepository.seed();

    // Sistema de auto-bloqueo por inactividad
    let timeout: number;
    const resetTimer = () => {
      clearTimeout(timeout);
      // Solo activamos el cronómetro si no estamos en la intro y la app está desbloqueada
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
  }, [lock, settings.autoLockMinutes, isLocked, showIntro]);

  // Pantalla 1: Presentación / Onboarding
  if (showIntro) {
    return <IntroPage onComplete={() => setShowIntro(false)} />;
  }

  // Pantalla 2: Bloqueo de Seguridad (Acceso mediante PIN)
  if (isLocked) {
    return <LoginPage />;
  }

  // Pantalla 3: Bóveda Principal (AppShell)
  return (
    <div className={`min-h-screen flex flex-col bg-dark text-gray-200 selection:bg-blue-500/30 ${settings.seniorMode ? 'senior-mode' : ''}`}>
      {/* Header Fijo */}
      <header className="bg-dark-surface border-b border-dark-border p-4 flex justify-between items-center sticky top-0 z-50 no-print safe-area-top">
        <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
          BÓVEDA <span className="text-blue-500">PERSONAL</span>
        </h1>
        <div className="flex gap-2">
          {settings.panicModeEnabled && (
            <button 
              onClick={() => confirm("¿Deseas activar el MODO PÁNICO? Esto destruirá todos los datos de forma irreversible.") && wipe()}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase animate-pulse border border-red-500/50"
            >
              🔥 Pánico
            </button>
          )}
          <Button variant="ghost" size="sm" onClick={lock} className="border border-dark-border h-10 px-4">
            🔒 Bloquear
          </Button>
        </div>
      </header>

      {/* Contenido Dinámico */}
      <main className="flex-grow p-4 md:p-8 pb-32 max-w-7xl mx-auto w-full">
        {activeTab === 'notes' && <NotesPage />}
        {activeTab === 'docs' && <DocumentsPage />}
        {activeTab === 'shopping' && <ShoppingPage />}
        {activeTab === 'apps' && <AppointmentsPage />}
        {activeTab === 'activity' && <ActivityPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Navegación Inferior (Mobile Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-surface/90 backdrop-blur-xl border-t border-dark-border flex justify-around items-center z-50 no-print safe-area-bottom pb-2 pt-2">
        <NavBtn 
          act={activeTab === 'notes'} 
          onClick={() => setActiveTab('notes')} 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>} 
          label="Notas" 
        />
        <NavBtn 
          act={activeTab === 'docs'} 
          onClick={() => setActiveTab('docs')} 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>} 
          label="Docs" 
        />
        <NavBtn 
          act={activeTab === 'shopping'} 
          onClick={() => setActiveTab('shopping')} 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>} 
          label="Lista" 
        />
        <NavBtn 
          act={activeTab === 'activity'} 
          onClick={() => setActiveTab('activity')} 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4-4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>} 
          label="Logs" 
        />
        <NavBtn 
          act={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} 
          label="Ajustes" 
        />
      </nav>

      <style>{`
        .safe-area-top { padding-top: max(1rem, env(safe-area-inset-top)); }
        .safe-area-bottom { padding-bottom: max(0.5rem, env(safe-area-inset-bottom)); }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .card { border: 1px solid #ccc !important; box-shadow: none !important; background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
};

const NavBtn: React.FC<{ act: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ act, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 h-14 justify-center ${act ? 'text-blue-500 scale-105' : 'text-gray-500 opacity-60'}`}
  >
    <div className={`${act ? 'scale-110' : 'scale-100'} transition-transform`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest mt-1">{label}</span>
  </button>
);

export default App;
