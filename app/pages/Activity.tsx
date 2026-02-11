
import React, { useState, useEffect } from 'react';
import { Logger } from '../../infra/db';
import { LogEvent } from '../../domain/types';
import { Card } from '../../shared/ui';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEvent[]>([]);

  useEffect(() => {
    Logger.getRecent().then(setLogs);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Actividad Reciente</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Eventos guardados localmente (Últimos 20)</p>
      </header>

      <div className="space-y-2">
        {logs.map(log => (
          <Card key={log.id} className="flex justify-between items-center py-3 border-l-4 border-blue-600">
            <div>
              <span className="text-[10px] font-black bg-blue-600/20 text-blue-500 px-2 py-0.5 rounded mr-3 uppercase">{log.action}</span>
              <span className="text-sm text-gray-300">{log.details}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
          </Card>
        ))}
        {logs.length === 0 && <div className="text-center py-20 text-gray-600 italic">No hay actividad registrada.</div>}
      </div>
    </div>
  );
};
