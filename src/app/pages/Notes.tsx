import React, { useState, useEffect, useCallback } from 'react';
import { db, Logger } from '../../infra/db';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { Note, ID, Template } from '../../domain/types';
import { Printer, Trash2, Star, Plus, ClipboardList, Shield } from 'lucide-react';

export const NotesPage: React.FC<{ searchTerm?: string }> = ({ searchTerm = '' }) => {
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

  const filteredNotes = notes.filter(n => 
    n.decryptedTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.decryptedContent?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="print-body" style={{ whiteSpace: 'pre-wrap' }}>
          {tempContent}
        </div>
        <div className="print-footer">
          Documento generado de forma segura en Bóveda Personal (Entorno 100% Local).
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mb-12">
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter text-center">Mis Notas</h2>
        <div className="flex gap-4 w-full md:w-auto justify-center">
          <Button variant="secondary" className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-8" onClick={() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            const notesHtml = filteredNotes.map(n => `
              <div style="page-break-after: always; padding: 1in; font-family: Georgia, serif;">
                <h1 style="font-size: 24pt; border-bottom: 2px solid #000; margin-bottom: 10px;">${n.decryptedTitle || 'Sin título'}</h1>
                <p style="font-style: italic; color: #666;">Fecha: ${new Date(n.createdAt).toLocaleDateString()}</p>
                <div style="white-space: pre-wrap; margin-top: 20px; font-size: 12pt; line-height: 1.6;">${n.decryptedContent}</div>
                <footer style="margin-top: 50px; border-top: 1px solid #eee; font-size: 8pt; color: #999; text-align: center;">
                  Documento oficial generado desde Bóveda Personal (Entorno Seguro y Local).
                </footer>
              </div>
            `).join('');
            printWindow.document.write(`<html><body onload="window.print();window.close();">${notesHtml}</body></html>`);
            printWindow.document.close();
          }}>
            <Printer className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="secondary" className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-8" onClick={() => setIsTemplateModalOpen(true)}>
            <ClipboardList className="w-4 h-4" />
            Plantillas
          </Button>
          <Button className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-8" onClick={() => { setEditingNote(null); setTempTitle(''); setTempContent(''); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            Nueva Nota
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Descifrando boveda...</p>
      ) : filteredNotes.length === 0 ? (
        <Card className="text-center py-20 border-dashed">
          <p className="text-gray-500">{searchTerm ? 'No se encontraron notas para esta búsqueda.' : 'No hay notas guardadas.'}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(n => (
            <Card key={n.id} className="group hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => {
              setEditingNote(n);
              setTempTitle(n.decryptedTitle || '');
              setTempContent(n.decryptedContent || '');
              setIsModalOpen(true);
            }}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white truncate pr-4">{n.decryptedTitle}</h3>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setTempTitle(n.decryptedTitle || '');
                      setTempContent(n.decryptedContent || '');
                      setTimeout(() => window.print(), 100);
                    }} 
                    className="text-gray-600 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Exportar a PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} 
                    className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">{n.decryptedContent}</p>
              <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center">
                <span className="text-[9px] text-gray-600 font-bold uppercase">{new Date(n.updatedAt).toLocaleDateString()}</span>
                {n.isFavorite && <Star className="w-3 h-3 text-blue-500 fill-blue-500" />}
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
            <Button className="flex-grow flex items-center justify-center gap-2" onClick={handleSave}>
              <Shield className="w-4 h-4" />
              Guardar Nota Cifrada
            </Button>
            {editingNote && (
              <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Exportar a PDF
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

