import React from 'react';
import { Card } from '../../shared/ui';
import { Mic, Waves } from 'lucide-react';

export const VoiceNotesPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-8">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
      <Mic className="w-24 h-24 text-blue-500 relative z-10" />
    </div>
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Notas de Voz</h2>
      <p className="text-gray-500 max-w-md mx-auto">Dictado privado y cifrado. Usa la Web Speech API para convertir tu voz en texto sin salir de tu dispositivo.</p>
    </div>
    <div className="flex gap-1 h-12 items-end">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="w-1 bg-blue-500/30 rounded-full animate-bounce" style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
    <Card className="p-8 border-dashed flex items-center gap-4 bg-blue-500/5 border-blue-500/20">
      <Waves className="w-6 h-6 text-blue-400" />
      <span className="text-xs font-black uppercase tracking-widest text-blue-400">Procesamiento Local de Audio</span>
    </Card>
  </div>
);
