
import React, { useState, useEffect } from 'react';
import { DocumentRepository } from '../../infra/db';
import { Document } from '../../domain/types';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { useSecurity } from '../hooks/useSecurity';

export const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', category: '', content: '' });
  const { encrypt, decrypt } = useSecurity();

  const load = async () => {
    const raw = await DocumentRepository.getAll();
    // Fix: Decrypt document metadata and content for display and usage
    const decoded = await Promise.all(raw.map(async (doc) => ({
      ...doc,
      name: await decrypt(doc.name),
      category: await decrypt(doc.category),
      content: await decrypt(doc.content)
    })));
    setDocs(decoded);
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewDoc({ ...newDoc, name: file.name, content: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!newDoc.name || !newDoc.content) return;
    
    // Fix: Encrypt sensitive fields before saving
    const encryptedName = await encrypt(newDoc.name);
    const encryptedCategory = await encrypt(newDoc.category || 'General');
    const encryptedContent = await encrypt(newDoc.content);

    await DocumentRepository.add({
      id: crypto.randomUUID(),
      name: encryptedName,
      category: encryptedCategory,
      content: encryptedContent,
      type: newDoc.content.startsWith('data:') ? 'file' : 'text',
      createdAt: Date.now()
    });
    setNewDoc({ name: '', category: '', content: '' });
    setIsModalOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documentos Seguros</h2>
        <Button onClick={() => setIsModalOpen(true)}>Añadir</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {docs.map(doc => (
          <Card key={doc.id} className="relative group">
            <div className="text-3xl mb-2">{doc.type === 'file' ? '📄' : '📝'}</div>
            <h4 className="font-bold truncate">{doc.name}</h4>
            <p className="text-xs text-gray-500 uppercase">{doc.category}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => {
                const link = window.document.createElement('a');
                link.href = doc.content;
                link.download = doc.name;
                link.click();
              }}>Descargar</Button>
              <Button size="sm" variant="ghost" onClick={async () => {
                if(confirm('¿Eliminar?')) { await DocumentRepository.delete(doc.id); load(); }
              }}>Eliminar</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Documento">
        <div className="space-y-4">
          <Input placeholder="Nombre o Título" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} />
          <Input placeholder="Categoría" value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})} />
          <div className="border-2 border-dashed border-dark-border p-8 text-center rounded-xl">
            <input type="file" id="file-up" className="hidden" onChange={handleFileUpload} />
            <label htmlFor="file-up" className="cursor-pointer text-blue-500 hover:text-blue-400">
              Haga clic para subir un archivo o arrástrelo
            </label>
            {newDoc.name && <p className="mt-2 text-xs text-green-500">Seleccionado: {newDoc.name}</p>}
          </div>
          <Button className="w-full" onClick={handleSave}>Guardar en Bóveda</Button>
        </div>
      </Modal>
    </div>
  );
};
