
import React, { useState, useEffect } from 'react';
import { ShoppingRepository } from '../../infra/db';
import { ShoppingItem } from '../../domain/types';
import { Button, Card, Input } from '../../shared/ui';
import { useSecurity } from '../hooks/useSecurity';

export const ShoppingPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const { encrypt, decrypt } = useSecurity();

  const load = async () => {
    const raw = await ShoppingRepository.getAll();
    // Fix: Decrypt items in memory for display
    const decoded = await Promise.all(raw.map(async (item) => ({
      ...item,
      text: await decrypt(item.text)
    })));
    setItems(decoded);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    // Fix: Encrypt text before saving to the database
    const encryptedText = await encrypt(newItem);
    
    await ShoppingRepository.add({
      id: crypto.randomUUID(),
      text: encryptedText,
      completed: false,
      createdAt: Date.now()
    });
    setNewItem('');
    load();
  };

  // Fix: handleToggle now accepts current status to properly pass the toggled value to the repository
  const handleToggle = async (id: string, currentStatus: boolean) => {
    await ShoppingRepository.toggle(id, !currentStatus);
    load();
  };

  const handleDelete = async (id: string) => {
    await ShoppingRepository.delete(id);
    load();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Lista de Compras</h2>
      
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input 
          placeholder="¿Qué necesitas comprar?" 
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
        />
        <Button type="submit">Añadir</Button>
      </form>

      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={item.completed}
                // Pass current completion status to the toggle handler
                onChange={() => handleToggle(item.id, item.completed)}
                className="w-5 h-5 rounded border-dark-border text-blue-600 bg-dark-surface"
              />
              <span className={`${item.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                {item.text}
              </span>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              className="text-gray-500 hover:text-red-500"
            >
              &times;
            </button>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-600 py-10">La lista está vacía.</p>
      )}
    </div>
  );
};
