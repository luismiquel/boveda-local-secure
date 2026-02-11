
export type ID = string;

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string;         // Base64
}

export interface Collection {
  id: ID;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface Note {
  id: ID;
  collectionId?: ID;
  title: EncryptedData;
  content: EncryptedData;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Document {
  id: ID;
  collectionId?: ID;
  name: EncryptedData;
  content: EncryptedData; 
  category: EncryptedData;
  type: 'text' | 'file';
  createdAt: number;
}

export interface ShoppingItem {
  id: ID;
  text: EncryptedData;
  completed: boolean;
  createdAt: number;
}

export interface Appointment {
  id: ID;
  title: EncryptedData;
  date: string;
  description: EncryptedData;
  createdAt: number;
}

export interface LogEvent {
  id: ID;
  action: string;
  details: string;
  timestamp: number;
}

export interface Template {
  id: ID;
  name: string;
  content: string;
}

export interface SecurityConfig {
  salt: string;
  iterations: number;
  encryptedDEK: EncryptedData;
  canary: EncryptedData;
}

export interface AppSettings {
  seniorMode: boolean;
  autoLockMinutes: number;
  panicModeEnabled: boolean;
}
