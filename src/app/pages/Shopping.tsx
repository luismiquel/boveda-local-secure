import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../infra/db';
import { useStore } from '../store';
import { encryptRaw, decryptRaw } from '../../shared/crypto';
import { Button, Card, Input } from '../../shared/ui';
import { ShoppingItem, ID } from '../../domain/types';
import { ShoppingCart, Plus, Trash2, CheckCircle2, Circle, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ShoppingPage: React.FC = () => {
  const { dek } = useStore();
  const [items, setItems] = useState<(ShoppingItem & { decText?: string })[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    if (!dek) return;
    setLoading(true);
    try {
      const all = await db.shoppingList.orderBy('createdAt').reverse().toArray();
      const decrypted = await Promise.all(all.map(async item => {
        try {
          return {
            ...item,
            decText: await decryptRaw(item.text.ciphertext, item.text.iv, dek)
          };
        } catch (e) {
          return { ...item, decText: '[Error]' };
        }
      }));
      setItems(decrypted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dek]);

  useEffect(() => {
    loadItems();
  }, [dek, loadItems]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dek || !newItem.trim()) return;
    
    const encryptedText = await encryptRaw(newItem.trim(), dek);
    const item: ShoppingItem = {
      id: crypto.randomUUID(),
      text: encryptedText,
      completed: false,
      createdAt: Date.now()
    };

    await db.shoppingList.add(item);
    setNewItem('');
    loadItems();
  };

  const toggleItem = async (id: ID, completed: boolean) => {
    await db.shoppingList.update(id, { completed: !completed });
    loadItems();
  };

  const deleteItem = async (id: ID) => {
    await db.shoppingList.delete(id);
    loadItems();
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 bg-blue-500/10 rounded-full">
          <ShoppingCart className="w-12 h-12 text-blue-500" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Lista de Compras</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">Privacidad en el Consumo Diario</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            const itemsHtml = items.map(item => `
              <div style="padding: 10px; border-bottom: 1px solid #eee; font-family: sans-serif; display: flex; align-items: center; gap: 10px;">
                <div style="width: 15px; height: 15px; border: 1px solid #000; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
                  ${item.completed ? '✓' : ''}
                </div>
                <div style="font-size: 14px; ${item.completed ? 'text-decoration: line-through; color: #999;' : ''}">${item.decText}</div>
              </div>
            `).join('');
            printWindow.document.write(`
              <html>
                <head><title>Lista de Compras - Bóveda Personal</title></head>
                <body onload="window.print();window.close();" style="padding: 40px;">
                  <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 2px;">Lista de Compras</h1>
                  <div style="margin-top: 20px;">${itemsHtml}</div>
                  <footer style="margin-top: 40px; text-align: center; font-size: 8px; color: #999; font-family: sans-serif;">Generado localmente desde Bóveda Personal</footer>
                </body>
              </html>
            `);
            printWindow.document.close();
          }}
        >
          <Printer className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input 
          value={newItem} 
          onChange={e => setNewItem(e.target.value)} 
          placeholder="Añadir artículo..." 
          className="flex-grow"
        />
        <Button type="submit" className="px-6">
          <Plus className="w-5 h-5" />
        </Button>
      </form>

      <Card className="p-2 bg-white/[0.01]">
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-600 uppercase text-[10px] font-black tracking-widest">La lista está vacía</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-4 group"
                >
                  <div 
                    className="flex items-center gap-4 cursor-pointer flex-grow"
                    onClick={() => toggleItem(item.id, item.completed)}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-700 group-hover:text-gray-500 transition-colors" />
                    )}
                    <span className={`text-sm transition-all ${item.completed ? 'text-gray-600 line-through' : 'text-gray-200'}`}>
                      {item.decText}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      <footer className="text-center opacity-20">
        <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em]">
          Tus hábitos de compra son privados. Sin rastreadores.
        </p>
      </footer>
    </div>
  );
};
