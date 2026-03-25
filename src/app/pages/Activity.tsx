import React, { useState, useEffect } from 'react';
import { Logger } from '../../infra/db';
import { LogEvent } from '../../domain/types';
import { Card } from '../../shared/ui';
import { Activity, Clock, ShieldAlert, Info, Key, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const recentLogs = await Logger.getRecent();
      setLogs(recentLogs);
    } catch (e) {
      console.error("Error loading logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getIcon = (action: string) => {
    switch (action) {
      case 'SEGURIDAD': return <Key className="w-4 h-4 text-blue-500" />;
      case 'ALERTA': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'PELIGRO': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'NOTAS': return <Info className="w-4 h-4 text-green-500" />;
      case 'DOCUMENTOS': return <Info className="w-4 h-4 text-purple-500" />;
      case 'SISTEMA': return <Activity className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <Activity className="w-16 h-16 text-blue-500 relative z-10" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Registro de Actividad</h2>
        <p className="text-gray-500 max-w-md">Auditoría local de las últimas 20 operaciones realizadas en este dispositivo.</p>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        <div className="flex justify-between items-center px-4">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Historial Reciente</span>
          <button 
            onClick={loadLogs}
            className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:text-blue-400 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin opacity-20" />
          </div>
        ) : logs.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">No hay actividad registrada</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors border-white/5">
                  <div className="p-2 rounded-lg bg-white/5">
                    {getIcon(log.action)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{log.action}</span>
                      <div className="flex items-center gap-1 text-[9px] text-gray-600 font-bold">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleTimeString()} - {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 font-medium">{log.details}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <footer className="pt-8 opacity-30 text-center">
        <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em]">
          Los registros se almacenan localmente y se rotan automáticamente al llegar a 100 entradas.
        </p>
      </footer>
    </div>
  );
};
