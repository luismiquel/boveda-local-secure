
import React, { useState, useEffect, useMemo } from 'react';
import { db, Logger } from '../../infra/db';
import { Note, Collection, Template } from '../../domain/types';
import { useSecurity } from '../hooks/useSecurity';
import { Button, Card, Input, Modal } from '../../shared/ui';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [activeCol, setActiveCol] = useState('all');
  const [isNoteModal, setIsNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', colId: '' });
  const { encrypt, decrypt } = useSecurity();

  const load = async () => {
    const [rawNotes, rawCols, rawTemps] = await Promise.all([
      db.notes.orderBy('updatedAt').reverse().toArray(),
      db.collections.toArray(),
      db.templates.toArray()
    ]);
    const decoded = await Promise.all(rawNotes.map(async n => ({
      ...n,
      title: await decrypt(n.title),
      content: await decrypt(n.content)
    })));
    setNotes(decoded);
    setCollections(rawCols);
    setTemplates(rawTemps);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return notes.filter(n => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
      const matchCol = activeCol === 'all' || n.collectionId === activeCol;
      return matchSearch && matchCol;
    });
  }, [notes, search, activeCol]);

  const saveNote = async () => {
    if (!newNote.title) return;
    await db.notes.add({
      id: crypto.randomUUID(),
      collectionId: newNote.colId || undefined,
      title: await encrypt(newNote.title),
      content: await encrypt(newNote.content),
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    Logger.log("NOTA", `Nota "${newNote.title}" creada`);
    setNewNote({ title: '', content: '', colId: '' });
    setIsNoteModal(false);
    load();
  };

  const exportPDF = (note: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${note.title}</title>
      <style>body{font-family:sans-serif;padding:40px;}h1{border-bottom:2px solid #333;}p{white-space:pre-wrap;}</style>
      </head><body>
      <h1>${note.title}</h1>
      <small>Generado localmente el ${new Date().toLocaleString()}</small>
      <p>${note.content}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
    Logger.log("EXPORTAR", `Nota "${note.title}" exportada a PDF`);
  };

  const deleteNote = async (id: string, title: string) => {
    if (confirm("¿Eliminar nota?")) {
      await db.notes.delete(id);
      Logger.log("NOTA", `Nota "${title}" eliminada`);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase">Mis Notas</h2>
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setActiveCol('all')} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${activeCol === 'all' ? 'bg-blue-600 text-white' : 'bg-dark-surface text-gray-500 border border-dark-border'}`}>Todos</button>
            {collections.map(c => (
              <button key={c.id} onClick={() => setActiveCol(c.id)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${activeCol === c.id ? 'bg-blue-600 text-white' : 'bg-dark-surface text-gray-500 border border-dark-border'}`}>
                <span>{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-48 text-xs" />
          <Button onClick={() => setIsNoteModal(true)}>Nueva</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(n => (
          <Card key={n.id} className="group flex flex-col h-full hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-white">{n.title}</h3>
              {n.collectionId && <span className="text-[8px] border border-dark-border px-1 rounded uppercase font-bold text-gray-500">{collections.find(c => c.id === n.collectionId)?.name}</span>}
            </div>
            <p className="text-sm text-gray-400 flex-grow line-clamp-5 whitespace-pre-wrap">{n.content}</p>
            <div className="mt-4 pt-3 border-t border-dark-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-mono text-gray-600">{new Date(n.updatedAt).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button onClick={() => exportPDF(n)} className="text-blue-500 text-xs font-bold uppercase hover:underline">PDF</button>
                <button onClick={() => deleteNote(n.id, n.title)} className="text-red-500 text-xs font-bold uppercase hover:underline">Eliminar</button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-20 text-center text-gray-600 italic">No se encontraron notas.</div>}
      </div>

      <Modal isOpen={isNoteModal} onClose={() => setIsNoteModal(false)} title="Nueva Nota Segura">
        <div className="space-y-4">
          <Input placeholder="Título" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
          <div className="flex flex-wrap gap-1">
            {templates.map(t => (
              <button key={t.id} onClick={() => setNewNote({...newNote, content: t.content, title: t.name.split(' ')[1] || t.name})} className="text-[10px] bg-dark px-2 py-1 rounded border border-dark-border text-gray-400 hover:text-white">+{t.name}</button>
            ))}
          </div>
          <select className="w-full bg-dark border border-dark-border rounded-lg p-2 text-sm text-gray-400" value={newNote.colId} onChange={e => setNewNote({...newNote, colId: e.target.value})}>
            <option value="">Sin carpeta</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <textarea className="w-full h-60 bg-dark border border-dark-border rounded-lg p-3 text-sm text-white resize-none" placeholder="Escriba aquí..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
          <Button className="w-full" onClick={saveNote}>Cifrar y Guardar</Button>
        </div>
      </Modal>
    </div>
  );
};
