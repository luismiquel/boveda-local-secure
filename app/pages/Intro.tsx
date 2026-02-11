
import React, { useState } from 'react';
import { Button, Card } from '../../shared/ui';
import { useStore } from '../store';

interface IntroProps {
  onComplete: () => void;
}

export const IntroPage: React.FC<IntroProps> = ({ onComplete }) => {
  const { settings } = useStore();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleEnter = () => {
    if (dontShowAgain) {
      localStorage.setItem("bp_seen_intro_v1", "1");
    }
    onComplete();
  };

  const features = [
    { 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"/><path d="M8.5 16.5c1.9-1.9 5.1-1.9 7 0"/><path d="M5 13c3.9-3.9 10.1-3.9 14 0"/><path d="M2 9c5.5-5.5 14.5-5.5 20 0"/><path d="m2 2 20 20"/></svg>, 
      title: "Sin Internet", 
      text: "Funciona 100% offline, ideal para viajes o zonas sin cobertura." 
    },
    { 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>, 
      title: "Solo Local", 
      text: "Tus datos nunca salen de este dispositivo. Sin nubes ni servidores." 
    },
    { 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>, 
      title: "Backup Local", 
      text: "Exporta tus datos cifrados en un archivo JSON cuando quieras." 
    },
    { 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>, 
      title: "Voz a Texto", 
      text: "Dicta tus notas de forma privada usando la Web Speech API." 
    },
    { 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>, 
      title: "GPS Privado", 
      text: "Guarda ubicaciones precisas sin compartirlas con terceros." 
    },
    { 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>, 
      title: "App Instalable", 
      text: "Instálala como PWA para acceso rápido desde tu pantalla de inicio." 
    },
  ];

  return (
    <div className={`min-h-screen bg-dark text-gray-200 flex flex-col p-4 md:p-8 overflow-x-hidden ${settings.seniorMode ? 'senior-mode' : ''}`}>
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col gap-8 py-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <header className="text-center space-y-4">
          <div className="inline-block p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-4">
            <svg className="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            BÓVEDA <span className="text-blue-500">PERSONAL</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm md:text-lg tracking-wide max-w-lg mx-auto leading-relaxed">
            Privada · Offline · Sin nube · Sin IA · Sin APIs externas
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Card key={i} className="group p-5 bg-dark-surface/50 border-dark-border hover:border-blue-500/40 transition-all duration-300 flex flex-col gap-3">
              <div className="text-blue-500 bg-blue-500/10 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-black uppercase text-xs tracking-widest text-white">{f.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{f.text}</p>
            </Card>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-300">Consejos de seguridad</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] md:text-xs text-gray-400 font-bold uppercase">
            <li className="flex gap-2">
              <span className="text-blue-500">01.</span> Activa Modo Senior en Ajustes si prefieres botones más grandes.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">02.</span> Exporta un Backup antes de cambiar de dispositivo.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">03.</span> Usa "Reparar" en Ajustes si la app no carga correctamente.
            </li>
          </ul>
        </Card>

        {/* Footer & Actions */}
        <div className="mt-auto flex flex-col items-center gap-6 pt-8">
          <label className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="peer hidden" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <div className="w-6 h-6 border-2 border-dark-border rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                <svg className="w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-tight">
              No volver a mostrar esta presentación
            </span>
          </label>

          <Button 
            size="lg" 
            className="w-full max-w-xs h-14 md:h-16 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20"
            onClick={handleEnter}
          >
            Comenzar ahora
          </Button>

          <p className="max-w-md text-center text-[9px] md:text-[10px] text-gray-600 uppercase font-black tracking-tighter leading-tight opacity-60">
            Aviso de Privacidad: Todo el cifrado ocurre localmente. Si tu dispositivo está desbloqueado y sin protección física, cualquier persona con acceso podría ver el contenido una vez abierta la sesión.
          </p>
        </div>
      </div>
    </div>
  );
};
