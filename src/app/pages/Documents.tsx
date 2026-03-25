import React, { useState, useEffect, useCallback } from 'react';
import { db, Logger } from '../../infra/db';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { Document, ID } from '../../domain/types';
import { FileText, Printer, Trash2, Shield, Plus } from 'lucide-react';

export const DocumentsPage: React.FC<{ searchTerm?: string }> = ({ searchTerm = '' }) => {
  const { dek } = useStore();
  const [docs, setDocs] = useState<(Document & { decryptedName?: string; decryptedContent?: string; decryptedCategory?: string })[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempContent, setTempContent] = useState('');
  const [tempCategory, setTempCategory] = useState('General');
  const [loading, setLoading] = useState(true);

  const loadDocs = useCallback(async () => {
    if (!dek) return;
    setLoading(true);
    try {
      const allDocs = await db.documents.toArray();
      const decryptedDocs = await Promise.all(allDocs.map(async d => {
        try {
          return {
            ...d,
            decryptedName: await decryptRaw(d.name.ciphertext, d.name.iv, dek),
            decryptedContent: await decryptRaw(d.content.ciphertext, d.content.iv, dek),
            decryptedCategory: await decryptRaw(d.category.ciphertext, d.category.iv, dek)
          };
        } catch (e) {
          return { ...d, decryptedName: '[Error]', decryptedContent: '', decryptedCategory: 'Error' };
        }
      }));
      setDocs(decryptedDocs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dek]);

  useEffect(() => {
    loadDocs();
  }, [dek, loadDocs]);

  const filteredDocs = docs.filter(d => 
    d.decryptedName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.decryptedContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.decryptedCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!dek || !tempName) return;
    
    const encryptedName = await encryptRaw(tempName, dek);
    const encryptedContent = await encryptRaw(tempContent, dek);
    const encryptedCategory = await encryptRaw(tempCategory, dek);
    
    const docData: Document = {
      id: editingDoc?.id || crypto.randomUUID(),
      name: encryptedName,
      content: encryptedContent,
      category: encryptedCategory,
      type: 'text',
      createdAt: editingDoc?.createdAt || Date.now()
    };

    await db.documents.put(docData);
    await Logger.log("DOCUMENTOS", `${editingDoc?.id ? 'Editado' : 'Creado'} documento: ${tempName}`);
    setIsModalOpen(false);
    setEditingDoc(null);
    setTempName('');
    setTempContent('');
    loadDocs();
  };

  const deleteDoc = async (id: ID) => {
    if (!confirm("¿Borrar este documento?")) return;
    await db.documents.delete(id);
    await Logger.log("DOCUMENTOS", "Documento eliminado");
    loadDocs();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Contenedor oculto para impresión */}
      <div className="print-content">
        <div className="print-header">
          <h1 className="print-title">{tempName || 'Documento sin nombre'}</h1>
          <p className="print-meta">
            Categoría: {tempCategory} | Fecha: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="print-body" style={{ whiteSpace: 'pre-wrap' }}>
          {tempContent}
        </div>
        <div className="print-footer">
          Documento oficial generado desde Bóveda Personal (Entorno Seguro y Local).
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mb-12">
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter text-center">Documentos Seguros</h2>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex items-center gap-2 px-8" onClick={() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            const docsHtml = filteredDocs.map(d => `
              <div style="page-break-after: always; padding: 1in; font-family: Georgia, serif;">
                <h1 style="font-size: 24pt; border-bottom: 2px solid #000; margin-bottom: 10px;">${d.decryptedName || 'Sin nombre'}</h1>
                <p style="font-style: italic; color: #666;">Categoría: ${d.decryptedCategory} | Fecha: ${new Date(d.createdAt).toLocaleDateString()}</p>
                <div style="white-space: pre-wrap; margin-top: 20px; font-size: 12pt; line-height: 1.6;">${d.decryptedContent}</div>
                <footer style="margin-top: 50px; border-top: 1px solid #eee; font-size: 8pt; color: #999; text-align: center;">
                  Documento oficial generado desde Bóveda Personal (Entorno Seguro y Local).
                </footer>
              </div>
            `).join('');
            printWindow.document.write(`<html><body onload="window.print();window.close();">${docsHtml}</body></html>`);
            printWindow.document.close();
          }}>
            <Printer className="w-4 h-4" />
            PDF
          </Button>
          <Button className="flex items-center gap-2 px-8" onClick={() => { setEditingDoc(null); setTempName(''); setTempContent(''); setTempCategory('General'); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            Nuevo Documento
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Accediendo a archivos...</p>
      ) : filteredDocs.length === 0 ? (
        <Card className="text-center py-20 border-dashed">
          <p className="text-gray-500">{searchTerm ? 'No se encontraron documentos para esta búsqueda.' : 'No hay documentos almacenados.'}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(d => (
            <Card key={d.id} className="group hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => {
              setEditingDoc(d);
              setTempName(d.decryptedName || '');
              setTempContent(d.decryptedContent || '');
              setTempCategory(d.decryptedCategory || 'General');
              setIsModalOpen(true);
            }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{d.decryptedCategory}</span>
                  <h3 className="font-bold text-white truncate pr-4">{d.decryptedName}</h3>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setTempName(d.decryptedName || '');
                      setTempContent(d.decryptedContent || '');
                      setTempCategory(d.decryptedCategory || 'General');
                      setTimeout(() => window.print(), 100);
                    }} 
                    className="text-gray-600 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Exportar a PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteDoc(d.id); }} 
                    className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{d.decryptedContent}</p>
              <div className="mt-4 pt-4 border-t border-dark-border flex justify-between items-center">
                <span className="text-[9px] text-gray-600 font-bold uppercase">{new Date(d.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-gray-600" />
                  <span className="text-[9px] bg-dark-border px-2 py-0.5 rounded text-gray-400 uppercase">Texto</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoc ? 'Editar Documento' : 'Nuevo Documento'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="Nombre del documento" 
              value={tempName} 
              onChange={e => setTempName(e.target.value)}
            />
            <Input 
              placeholder="Categoría (Contrato, ID...)" 
              value={tempCategory} 
              onChange={e => setTempCategory(e.target.value)}
            />
          </div>
          <textarea 
            className="w-full bg-dark border border-dark-border rounded-lg p-4 text-sm text-gray-200 min-h-[300px] focus:outline-none focus:border-blue-500 transition-colors font-mono"
            placeholder="Contenido del documento..."
            value={tempContent}
            onChange={e => setTempContent(e.target.value)}
          />
          <div className="flex gap-2">
            <Button className="flex-grow flex items-center justify-center gap-2" onClick={handleSave}>
              <Shield className="w-4 h-4" />
              Guardar en Bóveda
            </Button>
            {editingDoc && (
              <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Exportar a PDF
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
