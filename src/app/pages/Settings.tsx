import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { db, Logger } from '../../infra/db';
import { Template } from '../../domain/types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, wipe } = useStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTemplates = async () => {
    const all = await db.templates.toArray();
    setTemplates(all);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    await db.templates.put(editingTemplate);
    await Logger.log("AJUSTES", `Plantilla actualizada: ${editingTemplate.name}`);
    setIsModalOpen(false);
    loadTemplates();
  };

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
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Gestión de Plantillas</h3>
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {templates.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-dark border border-dark-border rounded-lg">
                <span className="text-sm font-bold text-white">{t.name}</span>
                <Button size="sm" variant="ghost" onClick={() => { setEditingTemplate(t); setIsModalOpen(true); }}>
                  Editar
                </Button>
              </div>
            ))}
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

      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Copia de Seguridad</h3>
        <Card className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Exporta todos tus datos cifrados en un archivo JSON. Puedes usar este archivo para restaurar tu bóveda en otro dispositivo.
          </p>
          <Button 
            variant="secondary" 
            className="w-full flex items-center justify-center gap-2"
            onClick={async () => {
              try {
                const allNotes = await db.notes.toArray();
                const allDocs = await db.documents.toArray();
                const allPasswords = await db.passwords.toArray();
                const allShopping = await db.shoppingList.toArray();
                
                const backup = {
                  version: '3.5.0',
                  timestamp: Date.now(),
                  data: {
                    notes: allNotes,
                    documents: allDocs,
                    passwords: allPasswords,
                    shoppingList: allShopping
                  }
                };

                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `boveda_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                await Logger.log("SISTEMA", "Copia de seguridad exportada correctamente");
                alert("Copia de seguridad exportada con éxito.");
              } catch (e) {
                console.error(e);
                alert("Error al exportar la copia de seguridad.");
              }
            }}
          >
            Exportar Backup (JSON)
          </Button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Plantilla">
        {editingTemplate && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nombre de la Plantilla</label>
              <Input 
                value={editingTemplate.name} 
                onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Contenido Predefinido</label>
              <textarea 
                className="w-full bg-dark border border-dark-border rounded-lg p-4 text-sm text-gray-200 min-h-[200px] focus:outline-none focus:border-blue-500 transition-colors"
                value={editingTemplate.content}
                onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-grow" onClick={handleSaveTemplate}>Guardar Cambios</Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

