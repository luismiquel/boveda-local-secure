import React from 'react';
import { useStore } from '../store';
import { Button, Card } from '../../shared/ui';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, wipe } = useStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Ajustes del Sistema</h2>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Interfaz y Accesibilidad</h3>
        <Card className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-white">Modo Senior</p>
              <p className="text-xs text-gray-500">Aumenta el tamaño de botones y textos para facilitar la lectura.</p>
            </div>
            <button 
              onClick={() => updateSettings({ seniorMode: !settings.seniorMode })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.seniorMode ? 'bg-blue-600' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.seniorMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Seguridad y Bloqueo</h3>
        <Card className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-white">Auto-bloqueo por inactividad</p>
              <p className="text-xs text-gray-500">Tiempo antes de cerrar la sesión automáticamente.</p>
            </div>
            <select 
              value={settings.autoLockMinutes}
              onChange={e => updateSettings({ autoLockMinutes: Number(e.target.value) })}
              className="bg-dark border border-dark-border rounded px-2 py-1 text-xs text-white"
            >
              <option value={1}>1 minuto</option>
              <option value={5}>5 minutos</option>
              <option value={15}>15 minutos</option>
              <option value={60}>1 hora</option>
            </select>
          </div>

          <div className="pt-6 border-t border-dark-border flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-white">Modo Pánico</p>
              <p className="text-xs text-gray-500">Habilita un botón de destrucción rápida en la cabecera.</p>
            </div>
            <button 
              onClick={() => updateSettings({ panicModeEnabled: !settings.panicModeEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.panicModeEnabled ? 'bg-red-600' : 'bg-dark-border'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.panicModeEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </Card>
      </section>

      <section className="space-y-4 pt-10">
        <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Zona de Peligro</h3>
        <Card className="border-red-900/30 bg-red-900/5">
          <p className="text-xs text-red-200/60 mb-4 leading-relaxed">
            La destrucción de datos es irreversible. Se borrarán todas las notas, documentos, claves y configuraciones de seguridad de este dispositivo.
          </p>
          <Button variant="danger" className="w-full" onClick={() => confirm("¿ESTÁS SEGURO? Esta acción no se puede deshacer.") && wipe()}>
            Destruir Bóveda (Wipe Total)
          </Button>
        </Card>
      </section>
    </div>
  );
};

