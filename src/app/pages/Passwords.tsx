import React, { useState, useEffect, useCallback } from 'react';
import { db, Logger } from '../../infra/db';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { Credential, ID } from '../../domain/types';
import { Key, ShieldCheck, Plus, Trash2, Eye, EyeOff, Globe, User, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const PasswordsPage: React.FC = () => {
  const { dek } = useStore();
  const [passwords, setPasswords] = useState<(Credential & { decSite?: string; decUser?: string; decPass?: string })[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPass, setEditingPass] = useState<Partial<Credential> | null>(null);
  const [tempSite, setTempSite] = useState('');
  const [tempUser, setTempUser] = useState('');
  const [tempPass, setTempPass] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [showPassId, setShowPassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPasswords = useCallback(async () => {
    if (!dek) return;
    setLoading(true);
    try {
      const all = await db.passwords.orderBy('updatedAt').reverse().toArray();
      const decrypted = await Promise.all(all.map(async p => {
        try {
          return {
            ...p,
            decSite: await decryptRaw(p.site.ciphertext, p.site.iv, dek),
            decUser: await decryptRaw(p.username.ciphertext, p.username.iv, dek),
            decPass: await decryptRaw(p.password.ciphertext, p.password.iv, dek)
          };
        } catch (e) {
          return { ...p, decSite: '[Error]', decUser: '', decPass: '' };
        }
      }));
      setPasswords(decrypted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dek]);

  useEffect(() => {
    loadPasswords();
  }, [dek, loadPasswords]);

  const handleSave = async () => {
    if (!dek || !tempSite || !tempPass) return;
    
    const encSite = await encryptRaw(tempSite, dek);
    const encUser = await encryptRaw(tempUser, dek);
    const encPass = await encryptRaw(tempPass, dek);
    
    const data: Credential = {
      id: editingPass?.id || crypto.randomUUID(),
      site: encSite,
      username: encUser,
      password: encPass,
      url: tempUrl,
      createdAt: editingPass?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    await db.passwords.put(data);
    await Logger.log("SEGURIDAD", `${editingPass?.id ? 'Editada' : 'Creada'} credencial para: ${tempSite}`);
    setIsModalOpen(false);
    setEditingPass(null);
    setTempSite('');
    setTempUser('');
    setTempPass('');
    setTempUrl('');
    loadPasswords();
  };

  const deletePass = async (id: ID) => {
    if (!confirm("¿Borrar esta contraseña?")) return;
    await db.passwords.delete(id);
    await Logger.log("SEGURIDAD", "Credencial eliminada");
    loadPasswords();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <Key className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Gestor de Claves</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cifrado AES-256-GCM Activo</p>
          </div>
        </div>
        <Button className="flex items-center gap-2 px-8" onClick={() => { setEditingPass(null); setTempSite(''); setTempUser(''); setTempPass(''); setTempUrl(''); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Nueva Clave
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : passwords.length === 0 ? (
        <Card className="text-center py-20 border-dashed bg-white/[0.01]">
          <div className="flex flex-col items-center gap-4">
            <ShieldCheck className="w-12 h-12 text-gray-700" />
            <p className="text-gray-500 uppercase text-[10px] font-black tracking-[0.2em]">No hay claves almacenadas</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passwords.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{p.decSite}</h3>
                      {p.url && (
                        <a href={p.url.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                          {p.url} <ExternalLink className="w-2 h-2" />
                        </a>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deletePass(p.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <User className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-300 truncate">{p.decUser || 'Sin usuario'}</span>
                    </div>
                    <button onClick={() => copyToClipboard(p.decUser || '')} className="text-gray-500 hover:text-white transition-colors p-1">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Key className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-300 font-mono tracking-wider">
                        {showPassId === p.id ? p.decPass : '••••••••••••'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowPassId(showPassId === p.id ? null : p.id)} className="text-gray-500 hover:text-white transition-colors p-1">
                        {showPassId === p.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button onClick={() => copyToClipboard(p.decPass || '')} className="text-gray-500 hover:text-white transition-colors p-1">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPass ? 'Editar Clave' : 'Nueva Clave'}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Sitio / Servicio</label>
              <Input value={tempSite} onChange={e => setTempSite(e.target.value)} placeholder="Ej: Gmail, Netflix..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">URL (Opcional)</label>
              <Input value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Usuario / Email</label>
              <Input value={tempUser} onChange={e => setTempUser(e.target.value)} placeholder="usuario@mail.com" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Contraseña</label>
              <Input type="password" value={tempPass} onChange={e => setTempPass(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-grow" onClick={handleSave}>Guardar Credencial</Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
