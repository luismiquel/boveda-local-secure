import React, { useState } from 'react';
import { Button } from '../../shared/ui';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { 
  Shield, 
  WifiOff, 
  HardDrive, 
  Download, 
  Mic, 
  MapPin, 
  Smartphone,
  Lock,
  Check
} from 'lucide-react';

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
      id: '01',
      icon: <WifiOff className="w-6 h-6" />,
      title: "Sin Internet", 
      text: "Funciona 100% offline, ideal para viajes o zonas sin cobertura." 
    },
    { 
      id: '02',
      icon: <HardDrive className="w-6 h-6" />,
      title: "Solo Local", 
      text: "Tus datos nunca salen de este dispositivo. Sin nubes ni servidores." 
    },
    { 
      id: '03',
      icon: <Download className="w-6 h-6" />,
      title: "Backup Local", 
      text: "Exporta tus datos cifrados en un archivo JSON cuando quieras." 
    },
    { 
      id: '04',
      icon: <Mic className="w-6 h-6" />,
      title: "Voz a Texto", 
      text: "Dicta tus notas de forma privada usando la Web Speech API." 
    },
    { 
      id: '05',
      icon: <MapPin className="w-6 h-6" />,
      title: "GPS Privado", 
      text: "Guarda ubicaciones precisas sin compartirlas con terceros." 
    },
    { 
      id: '06',
      icon: <Smartphone className="w-6 h-6" />,
      title: "App Instalable", 
      text: "Instálala como PWA para acceso rápido desde tu pantalla de inicio." 
    },
  ];

  return (
    <div className={`min-h-screen bg-[#050505] text-gray-200 flex flex-col items-center justify-center overflow-x-hidden selection:bg-blue-500 selection:text-white p-6 md:p-12 relative ${settings.seniorMode ? 'senior-mode' : ''}`}>
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Background Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[120%] bg-blue-600/[0.03] blur-[220px] rounded-full" 
        />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center w-full max-w-4xl text-center"
      >
        
        {/* Header Section - Fully Centered */}
        <header className="flex flex-col items-center space-y-8 mb-16 md:mb-20 w-full">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl"
          >
            <Shield className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400/80">Soberanía Digital Garantizada</span>
          </motion.div>
          
          <div className="space-y-4 w-full">
            <motion.h1 
              initial={{ opacity: 0, filter: 'blur(20px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.2 }}
              className="text-5xl md:text-[8rem] font-black text-white leading-[0.8] tracking-tighter uppercase italic text-center"
            >
              BÓVEDA<br />
              <span className="text-blue-600 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]">PERSONAL</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
              className="text-gray-400 text-lg md:text-xl font-medium tracking-tight max-w-2xl mx-auto leading-relaxed"
            >
              Tu asistente de privacidad 100% local.<br />Sin nubes, sin rastreo, sin compromisos.
            </motion.p>
          </div>

          <div className="flex flex-col items-center gap-6 pt-4 w-full">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                className="w-full md:w-fit px-16 h-16 text-xl font-black uppercase tracking-[0.25em] bg-white text-black hover:bg-blue-600 hover:text-white transition-all duration-700 shadow-[0_20px_40px_rgba(37,99,235,0.4)]"
                onClick={handleEnter}
              >
                Comenzar
              </Button>
            </motion.div>
            
            <label className="flex items-center gap-4 group cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer hidden" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <div className="w-6 h-6 border-2 border-white/10 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                  <Check className="w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform" />
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-[0.3em]">
                No volver a mostrar
              </span>
            </label>
          </div>
        </header>

        {/* Features Grid - Balanced & Centered */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-32 w-full">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + (i * 0.1) }}
              className="relative group p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/30 transition-all duration-700 text-center flex flex-col items-center gap-8 backdrop-blur-sm"
            >
              <div className="text-blue-500/40 group-hover:text-blue-500 transition-colors duration-500 scale-125">
                {f.icon}
              </div>
              <div className="space-y-3">
                <h3 className="font-black uppercase text-sm tracking-[0.2em] text-white group-hover:text-blue-400 transition-colors duration-500">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-[200px] mx-auto group-hover:text-gray-400 transition-colors duration-500">{f.text}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Security Protocols - Centered Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="w-full bg-blue-600/[0.02] border border-blue-500/10 rounded-[5rem] p-16 md:p-24 text-center space-y-20 backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent opacity-30" />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <Lock className="w-10 h-10 text-blue-600 mb-2" />
            <h3 className="text-[14px] font-black uppercase tracking-[0.7em] text-blue-500/80">Protocolos de Integridad</h3>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="space-y-5 group">
              <p className="text-sm font-black text-white uppercase tracking-[0.25em] group-hover:text-blue-400 transition-colors">01. Accesibilidad</p>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[180px] mx-auto">Activa el Modo Senior para una experiencia optimizada de alta visibilidad.</p>
            </div>
            <div className="space-y-5 group">
              <p className="text-sm font-black text-white uppercase tracking-[0.25em] group-hover:text-blue-400 transition-colors">02. Respaldo</p>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[180px] mx-auto">Genera copias de seguridad cifradas localmente para máxima portabilidad.</p>
            </div>
            <div className="space-y-5 group">
              <p className="text-sm font-black text-white uppercase tracking-[0.25em] group-hover:text-blue-400 transition-colors">03. Seguridad</p>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[180px] mx-auto">Toda la computación y el cifrado ocurren exclusivamente en tu procesador.</p>
            </div>
          </div>
        </motion.section>

        {/* Footer Info */}
        <footer className="mt-40 pt-20 border-t border-white/5 flex flex-col items-center gap-16 text-center w-full">
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-10">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Cifrado</span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">AES-GCM 256</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Privacidad</span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Zero-Knowledge</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Almacenamiento</span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">IndexedDB V3</span>
            </div>
          </div>
          
          <div className="space-y-6 opacity-30">
            <p className="max-w-3xl text-[11px] text-gray-600 uppercase font-black tracking-[0.4em] leading-relaxed mx-auto">
              SISTEMA OPERATIVO v3.5.0 // ESTADO: SEGURO // LOCALHOST ONLY
            </p>
            <p className="max-w-4xl text-[10px] text-gray-700 uppercase font-black tracking-[0.3em] leading-relaxed mx-auto">
              La Bóveda Personal es una herramienta de soberanía digital. La seguridad física del dispositivo y la gestión de la clave maestra son responsabilidad exclusiva del usuario.
            </p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
