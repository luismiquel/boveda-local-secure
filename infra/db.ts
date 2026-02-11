
import { Dexie, type Table } from 'dexie';
import { Note, Document, ShoppingItem, Appointment, Collection, LogEvent, Template } from '../domain/types';

/**
 * Configuración de Base de Datos Local con Dexie.js
 * Proporciona almacenamiento indexado y reactivo en el navegador.
 */
export class BovedaDB extends Dexie {
  notes!: Table<Note>;
  documents!: Table<Document>;
  shoppingList!: Table<ShoppingItem>;
  appointments!: Table<Appointment>;
  collections!: Table<Collection>;
  logs!: Table<LogEvent>;
  templates!: Table<Template>;

  constructor() {
    super('BovedaDB_V3');
    
    // Fix: Use the inherited version method correctly. 
    // Property 'version' is a method on Dexie class used to define the schema.
    this.version(1).stores({
      notes: 'id, collectionId, isFavorite, createdAt, updatedAt',
      documents: 'id, collectionId, createdAt',
      shoppingList: 'id, completed, createdAt',
      appointments: 'id, date, createdAt',
      collections: 'id, name, createdAt',
      logs: 'id, timestamp',
      templates: 'id, name'
    });
  }
}

export const db = new BovedaDB();

/**
 * Gestor de Logs de Actividad
 */
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

/**
 * Repositorio para la Lista de Compras
 */
export const ShoppingRepository = {
  getAll: () => db.shoppingList.toArray(),
  add: (item: ShoppingItem) => db.shoppingList.add(item),
  toggle: (id: string, completed: boolean) => db.shoppingList.update(id, { completed }),
  delete: (id: string) => db.shoppingList.delete(id)
};

/**
 * Repositorio para Documentos Seguros
 */
export const DocumentRepository = {
  getAll: () => db.documents.toArray(),
  add: (doc: Document) => db.documents.add(doc),
  delete: (id: string) => db.documents.delete(id)
};

/**
 * Repositorio para Citas y Recordatorios
 */
export const AppointmentRepository = {
  getAll: () => db.appointments.toArray(),
  add: (app: Appointment) => db.appointments.add(app),
  delete: (id: string) => db.appointments.delete(id)
};

/**
 * Repositorio de Plantillas de Notas
 */
export const TemplateRepository = {
  seed: async () => {
    const count = await db.templates.count();
    if (count > 0) return;
    await db.templates.bulkAdd([
      { id: 't1', name: '🩺 Médico', content: 'FECHA: \nDOCTOR: \nSÍNTOMAS: \nDIAGNÓSTICO: \nTRATAMIENTO: ' },
      { id: 't2', name: '💰 Finanzas', content: 'CONCEPTO: \nMONTO: \nCATEGORÍA: \nNOTAS: ' },
      { id: 't3', name: '⚠️ Incidencia', content: 'TIPO: \nFECHA: \nDESCRIPCIÓN: \nACCIONES TOMADAS: ' },
      { id: 't4', name: '🧳 Lista de viaje', content: 'DESTINO: \nFECHA: \n[ ] Documentos\n[ ] Ropa\n[ ] Cargadores' },
      { id: 't5', name: '👤 Contacto VIP', content: 'NOMBRE: \nRELACIÓN: \nTELÉFONO: \nDIRECCIÓN: \nNOTAS IMPORTANTES: ' }
    ]);
  }
};
