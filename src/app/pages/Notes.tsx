import React, { useState, useEffect } from 'react';
import { db, Logger } from '../../infra/db';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { Note, ID } from '../../domain/types';

export const NotesPage: React.FC = () => {
  const { dek } = useStore();
  const [notes, setNotes] = useState<(Note & { decryptedTitle?: string; decryptedContent?: string })[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [tempContent, setTempContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [dek]);

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

  const deleteNote = async (id: ID) => {
    if (!confirm("¿Borrar esta nota?")) return;
    await db.notes.delete(id);
    await Logger.log("NOTAS", "Nota eliminada");
    loadNotes();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Mis Notas</h2>
        <Button onClick={() => { setEditingNote(null); setTempTitle(''); setTempContent(''); setIsModalOpen(true); }}>
          + Nueva Nota
        </Button>
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
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{n.decryptedContent}</p>
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
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

