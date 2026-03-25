
import { Dexie, type Table } from 'dexie';
import { Note, Document, ShoppingItem, Appointment, Collection, LogEvent, Template, Credential, VoiceNote } from '../domain/types';

export class BovedaDB extends Dexie {
  notes!: Table<Note>;
  documents!: Table<Document>;
  shoppingList!: Table<ShoppingItem>;
  appointments!: Table<Appointment>;
  passwords!: Table<Credential>;
  voiceNotes!: Table<VoiceNote>;
  collections!: Table<Collection>;
  logs!: Table<LogEvent>;
  templates!: Table<Template>;

  constructor() {
    super('BovedaDB_V3');
    
    (this as BovedaDB).version(1).stores({
      notes: 'id, collectionId, isFavorite, createdAt, updatedAt',
      documents: 'id, collectionId, createdAt',
      shoppingList: 'id, completed, createdAt',
      appointments: 'id, date, createdAt',
      passwords: 'id, site, createdAt',
      voiceNotes: 'id, createdAt',
      collections: 'id, name, createdAt',
      logs: 'id, timestamp',
      templates: 'id, name'
    });
  }
}

export const db = new BovedaDB();

export const Logger = {
  log: async (action: string, details: string) => {
    await db.logs.add({ id: crypto.randomUUID(), action, details, timestamp: Date.now() });
    const count = await db.logs.count();
    if (count > 100) {
      const oldest = await db.logs.orderBy('timestamp').first();
      if (oldest) await db.logs.delete(oldest.id);
    }
  },
  getRecent: () => db.logs.orderBy('timestamp').reverse().limit(20).toArray()
};

export const ShoppingRepository = {
  getAll: () => db.shoppingList.toArray(),
  add: (item: ShoppingItem) => db.shoppingList.add(item),
  toggle: (id: string, completed: boolean) => db.shoppingList.update(id, { completed }),
  delete: (id: string) => db.shoppingList.delete(id)
};

export const DocumentRepository = {
  getAll: () => db.documents.toArray(),
  add: (doc: Document) => db.documents.add(doc),
  delete: (id: string) => db.documents.delete(id)
};

export const AppointmentRepository = {
  getAll: () => db.appointments.toArray(),
  add: (app: Appointment) => db.appointments.add(app),
  delete: (id: string) => db.appointments.delete(id)
};

export const PasswordRepository = {
  getAll: () => db.passwords.toArray(),
  add: (cred: Credential) => db.passwords.add(cred),
  update: (id: string, cred: Partial<Credential>) => db.passwords.update(id, cred),
  delete: (id: string) => db.passwords.delete(id)
};

export const VoiceNoteRepository = {
  getAll: () => db.voiceNotes.toArray(),
  add: (vn: VoiceNote) => db.voiceNotes.add(vn),
  delete: (id: string) => db.voiceNotes.delete(id)
};

export const TemplateRepository = {
  seed: async () => {
    const count = await db.templates.count();
    if (count > 0) return;
    await db.templates.bulkPut([
      { id: 't1', name: '🩺 Médico', content: 'FECHA: \nDOCTOR: \nSÍNTOMAS: \nDIAGNÓSTICO: \nTRATAMIENTO: ' },
      { id: 't2', name: '💰 Finanzas', content: 'CONCEPTO: \nMONTO: \nCATEGORÍA: \nNOTAS: ' },
      { id: 't3', name: '⚠️ Incidencia', content: 'TIPO: \nFECHA: \nDESCRIPCIÓN: \nACCIONES TOMADAS: ' },
      { id: 't4', name: '🧳 Lista de viaje', content: 'DESTINO: \nFECHA: \n[ ] Documentos\n[ ] Ropa\n[ ] Cargadores' },
      { id: 't5', name: '👤 Contacto VIP', content: 'NOMBRE: \nRELACIÓN: \nTELÉFONO: \nDIRECCIÓN: \nNOTAS IMPORTANTES: ' }
    ]);
  }
};
