import React from 'react';
import { Card } from '../../shared/ui';
import { Key, ShieldCheck } from 'lucide-react';

export const PasswordsPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-8">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
      <Key className="w-24 h-24 text-blue-500 relative z-10" />
    </div>
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestor de Claves</h2>
      <p className="text-gray-500 max-w-md mx-auto">Tus contraseñas se cifran localmente con AES-256. Próximamente disponible en la versión 4.0.</p>
    </div>
    <Card className="p-8 border-dashed flex items-center gap-4 bg-blue-500/5 border-blue-500/20">
      <ShieldCheck className="w-6 h-6 text-blue-400" />
      <span className="text-xs font-black uppercase tracking-widest text-blue-400">Protocolo de Seguridad Activo</span>
    </Card>
  </div>
);
