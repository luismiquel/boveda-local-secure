
import React, { useState, useEffect } from 'react';
import { AppointmentRepository } from '../../infra/db';
import { Appointment } from '../../domain/types';
import { Button, Card, Input, Modal } from '../../shared/ui';
import { useSecurity } from '../hooks/useSecurity';

export const AppointmentsPage: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({ title: '', date: '', description: '' });
  const { encrypt, decrypt } = useSecurity();

  const load = async () => {
    const raw = await AppointmentRepository.getAll();
    // Fix: Decrypt appointment details in memory for rendering
    const decoded = await Promise.all(raw.map(async (app) => ({
      ...app,
      title: await decrypt(app.title),
      description: await decrypt(app.description)
    })));
    setApps(decoded);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!newApp.title || !newApp.date) return;
    
    // Fix: Encrypt title and description before persistence
    const encryptedTitle = await encrypt(newApp.title);
    const encryptedDescription = await encrypt(newApp.description);

    await AppointmentRepository.add({
      id: crypto.randomUUID(),
      title: encryptedTitle,
      date: newApp.date,
      description: encryptedDescription,
      createdAt: Date.now()
    });
    setNewApp({ title: '', date: '', description: '' });
    setIsModalOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Citas y Recordatorios</h2>
        <Button onClick={() => setIsModalOpen(true)}>Agendar</Button>
      </div>

      <div className="space-y-3">
        {apps.map(app => {
          const isPast = new Date(app.date) < new Date();
          return (
            <Card key={app.id} className={`flex items-center justify-between ${isPast ? 'opacity-50' : ''}`}>
              <div>
                <div className="text-xs text-blue-500 font-bold uppercase tracking-tighter">
                  {new Date(app.date).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
                <h4 className="text-lg font-semibold">{app.title}</h4>
                <p className="text-sm text-gray-500">{app.description}</p>
              </div>
              <Button variant="ghost" onClick={async () => { await AppointmentRepository.delete(app.id); load(); }}>
                &times;
              </Button>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Cita">
        <div className="space-y-4">
          <Input placeholder="Título de la cita" value={newApp.title} onChange={e => setNewApp({...newApp, title: e.target.value})} />
          <Input type="datetime-local" value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})} />
          <textarea 
            placeholder="Detalles adicionales..."
            className="w-full bg-dark-surface border border-dark-border rounded-lg p-3 text-white"
            value={newApp.description}
            onChange={e => setNewApp({...newApp, description: e.target.value})}
          />
          <Button className="w-full" onClick={handleSave}>Confirmar Cita</Button>
        </div>
      </Modal>
    </div>
  );
};
