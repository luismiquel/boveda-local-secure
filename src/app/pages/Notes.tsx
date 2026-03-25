import React, { useState, useEffect, useCallback } from 'react';
import { db, Logger } from '../../infra/db';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { Note, ID, Template } from '../../domain/types';

export const NotesPage: React.FC = () => {
  const { dek } = useStore();
  const [notes, setNotes] = useState<(Note & { decryptedTitle?: string; decryptedContent?: string })[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [tempContent, setTempContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    if (!dek) return;
    setLoading(true);
    try {
      const allNotes = await db.notes.orderBy('updatedAt').reverse().toArray();
      const decryptedNotes = await Promise.all(allNotes.map(async n => {
        try {
          return {
            ...n,
            decryptedTitle: await decryptRaw(n.title.ciphertext, n.title.iv, dek),
            decryptedContent: await decryptRaw(n.content.ciphertext, n.content.iv, dek)
          };
        } catch (e) {
          return { ...n, decryptedTitle: '[Error de descifrado]', decryptedContent: '' };
        }
      }));
      setNotes(decryptedNotes);
      
      const allTemplates = await db.templates.toArray();
      setTemplates(allTemplates);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dek]);

  useEffect(() => {
    loadNotes();
  }, [dek, loadNotes]);

  const handleSave = async () => {
    if (!dek || !tempTitle) return;
    
    const encryptedTitle = await encryptRaw(tempTitle, dek);
    const encryptedContent = await encryptRaw(tempContent, dek);
    
    const noteData: Note = {
      id: editingNote?.id || crypto.randomUUID(),
      title: encryptedTitle,
      content: encryptedContent,
      isFavorite: editingNote?.isFavorite || false,
      createdAt: editingNote?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    await db.notes.put(noteData);
    await Logger.log("NOTAS", `${editingNote?.id ? 'Editada' : 'Creada'} nota: ${tempTitle}`);
    setIsModalOpen(false);
    setEditingNote(null);
    setTempTitle('');
    setTempContent('');
    loadNotes();
  };

  const applyTemplate = (template: Template) => {
    setEditingNote(null);
    setTempTitle(template.name.replace(/^[^\s]+\s/, '')); // Remove icon from title
    setTempContent(template.content);
    setIsTemplateModalOpen(false);
    setIsModalOpen(true);
  };

  const deleteNote = async (id: ID) => {
    if (!confirm("¿Borrar esta nota?")) return;
    await db.notes.delete(id);
    await Logger.log("NOTAS", "Nota eliminada");
    loadNotes();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Contenedor oculto para impresión */}
      <div className="print-content">
        <div className="print-header">
          <h1 className="print-title">{tempTitle || 'Sin título'}</h1>
          <p className="print-meta">
            Fecha: {new Date().toLocaleDateString()} | Bóveda Personal
          </p>
        </div>
        <div className="print-body">
          {tempContent}
        </div>
        <div className="print-footer">
          Documento generado de forma segura en Bóveda Personal.
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Mis Notas</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" className="flex-grow md:flex-grow-0" onClick={() => setIsTemplateModalOpen(true)}>
            📋 Plantillas
          </Button>
          <Button className="flex-grow md:flex-grow-0" onClick={() => { setEditingNote(null); setTempTitle(''); setTempContent(''); setIsModalOpen(true); }}>
            + Nueva Nota
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Descifrando boveda...</p>
      ) : notes.length === 0 ? (
        <Card className="text-center py-20 border-dashed">
          <p className="text-gray-500">No hay notas guardadas.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <Card key={n.id} className="group hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => {
              setEditingNote(n);
              setTempTitle(n.decryptedTitle || '');
              setTempContent(n.decryptedContent || '');
              setIsModalOpen(true);
            }}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white truncate pr-4">{n.decryptedTitle}</h3>
                <button onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">{n.decryptedContent}</p>
              <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center">
                <span className="text-[9px] text-gray-600 font-bold uppercase">{new Date(n.updatedAt).toLocaleDateString()}</span>
                {n.isFavorite && <span className="text-blue-500 text-xs">★</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote ? 'Editar Nota' : 'Nueva Nota'}>
        <div className="space-y-4">
          <Input 
            placeholder="Título de la nota" 
            value={tempTitle} 
            onChange={e => setTempTitle(e.target.value)}
          />
          <textarea 
            className="w-full bg-dark border border-dark-border rounded-lg p-4 text-sm text-gray-200 min-h-[200px] focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Escribe aquí..."
            value={tempContent}
            onChange={e => setTempContent(e.target.value)}
          />
          <div className="flex gap-2">
            <Button className="flex-grow" onClick={handleSave}>Guardar Nota Cifrada</Button>
            {editingNote && (
              <Button variant="secondary" onClick={handlePrint} title="Exportar a PDF">
                🖨️ PDF
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Nueva Nota desde Plantilla">
        <div className="grid grid-cols-1 gap-2">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="w-full text-left p-4 bg-dark border border-dark-border rounded-xl hover:border-blue-500 transition-all group"
            >
              <div className="font-bold text-white group-hover:text-blue-500 transition-colors">{t.name}</div>
              <div className="text-[10px] text-gray-500 mt-1 truncate">{t.content.substring(0, 50)}...</div>
            </button>
          ))}
          {templates.length === 0 && <p className="text-center text-gray-500 py-4">No hay plantillas disponibles.</p>}
        </div>
      </Modal>
    </div>
  );
};

