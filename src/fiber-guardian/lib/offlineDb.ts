import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Reparo, FotoReparo, PendingSync } from '@/fiber-guardian/types/database';

interface FibraReparoDB extends DBSchema {
  reparos: {
    key: string;
    value: Reparo;
    indexes: { 'by-usuario': string; 'by-status': string };
  };
  fotos: {
    key: string;
    value: FotoReparo & { blob?: Blob };
    indexes: { 'by-reparo': string };
  };
  pendingSync: {
    key: string;
    value: PendingSync;
    indexes: { 'by-type': string };
  };
}

let db: IDBPDatabase<FibraReparoDB> | null = null;

export async function getDb(): Promise<IDBPDatabase<FibraReparoDB>> {
  if (db) return db;
  db = await openDB<FibraReparoDB>('fibra-reparo-db', 1, {
    upgrade(database) {
      const reparosStore = database.createObjectStore('reparos', { keyPath: 'id' });
      reparosStore.createIndex('by-usuario', 'usuario_id');
      reparosStore.createIndex('by-status', 'status');
      const fotosStore = database.createObjectStore('fotos', { keyPath: 'id' });
      fotosStore.createIndex('by-reparo', 'reparo_id');
      const syncStore = database.createObjectStore('pendingSync', { keyPath: 'id' });
      syncStore.createIndex('by-type', 'type');
    },
  });
  return db;
}

export async function saveReparoOffline(reparo: Reparo): Promise<void> {
  const database = await getDb();
  await database.put('reparos', reparo);
}

export async function getReparosOffline(usuarioId?: string): Promise<Reparo[]> {
  const database = await getDb();
  if (usuarioId) return database.getAllFromIndex('reparos', 'by-usuario', usuarioId);
  return database.getAll('reparos');
}

export async function getReparoOffline(id: string): Promise<Reparo | undefined> {
  const database = await getDb();
  return database.get('reparos', id);
}

export async function deleteReparoOffline(id: string): Promise<void> {
  const database = await getDb();
  await database.delete('reparos', id);
}

export async function saveFotoOffline(foto: FotoReparo, blob?: Blob): Promise<void> {
  const database = await getDb();
  await database.put('fotos', { ...foto, blob });
}

export async function getFotosOffline(reparoId: string): Promise<(FotoReparo & { blob?: Blob })[]> {
  const database = await getDb();
  return database.getAllFromIndex('fotos', 'by-reparo', reparoId);
}

export async function deleteFotoOffline(id: string): Promise<void> {
  const database = await getDb();
  await database.delete('fotos', id);
}

export async function addPendingSync(sync: PendingSync): Promise<void> {
  const database = await getDb();
  await database.put('pendingSync', sync);
}

export async function getPendingSyncs(): Promise<PendingSync[]> {
  const database = await getDb();
  return database.getAll('pendingSync');
}

export async function removePendingSync(id: string): Promise<void> {
  const database = await getDb();
  await database.delete('pendingSync', id);
}

export async function getPendingSyncCount(): Promise<number> {
  const database = await getDb();
  return database.count('pendingSync');
}

export async function clearOfflineData(): Promise<void> {
  const database = await getDb();
  await database.clear('reparos');
  await database.clear('fotos');
  await database.clear('pendingSync');
}
