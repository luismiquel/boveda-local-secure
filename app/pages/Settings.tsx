
import React from 'react';
import { useStore } from '../store';
import { Button, Card } from '../../shared/ui';
import { db, Logger } from '../../infra/db';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, config, wipe } = useStore();

  const handleExport = async () => {
    if (!config) return;
    const data = {
      version: "3.5-ultra-enhanced",
      security: {
        salt: config.salt,
        canary: config.canary,
        iterations: config.iterations,
        encryptedDEK: config.encryptedDEK
      },
      content: {
        notes: await db.notes.toArray(),
        documents: await db.documents.toArray(),
        shopping: await db.shoppingList.toArray(),
        appointments: await db.appointments.toArray(),
        collections: await db.collections.toArray()
      },
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `backup_boveda_${Date.now()}.json`; a.click();
    await Logger.log("EXPORTAR", "Copia de seguridad generada");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!confirm("Esto reemplazará todos los datos actuales.")) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        await Promise.all([db.notes.clear(), db.documents.clear(), db.shoppingList.clear(), db.appointments.clear(), db.collections.clear()]);
        await db.notes.bulkAdd(data.content.notes);
        await db.documents.bulkAdd(data.content.documents);
        await db.shoppingList.bulkAdd(data.content.shopping);
        await db.appointments.bulkAdd(data.content.appointments);
        if(data.content.collections) await db.collections.bulkAdd(data.content.collections);
        localStorage.setItem('bv_sec_cfg', JSON.stringify(data.security));
        await Logger.log("IMPORTAR", "Restauración de backup completada");
        window.location.reload();
      } catch (err: any) { alert("Error: " + err.message); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="text-3xl">⚙️</div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Ajustes Maestro</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Configuración de seguridad total</p>
        </div>
      </header>
      
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-dark-border pb-2">Preferencias de Interfaz</h3>
        <Card className="space-y-4">
          <Toggle label="Modo Senior (Fuentes Grandes)" checked={settings.seniorMode} onChange={v => updateSettings({ seniorMode: v })} />
          <Toggle label="Modo Pánico (Botón de Autodestrucción)" checked={settings.panicModeEnabled} onChange={v => updateSettings({ panicModeEnabled: v })} />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-300">Bloqueo por inactividad</span>
            <select 
              className="bg-dark border border-dark-border rounded px-2 py-1 text-xs text-white"
              value={settings.autoLockMinutes}
              onChange={e => updateSettings({ autoLockMinutes: Number(e.target.value) })}
            >
              <option value={1}>1 minuto</option>
              <option value={5}>5 minutos</option>
              <option value={15}>15 minutos</option>
            </select>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-dark-border pb-2">Almacenamiento</h3>
        <Card className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>Exportar JSON</Button>
          <div className="relative">
            <Button variant="secondary" size="sm" className="w-full">Importar JSON</Button>
            <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </Card>
      </section>

      <section className="space-y-4 pt-8">
        <h3 className="text-[10px] font-black text-red-900 uppercase tracking-widest border-b border-red-900/30 pb-2">Control Crítico</h3>
        <Card className="border-red-900/20 bg-red-900/5">
          <Button variant="danger" className="w-full uppercase font-black tracking-widest" onClick={() => { if(confirm("¿ELIMINAR TODO?")) wipe(); }}>
            Destrucción Total (Wipe)
          </Button>
        </Card>
      </section>
    </div>
  );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-bold text-gray-300">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-blue-600' : 'bg-dark-border'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);
