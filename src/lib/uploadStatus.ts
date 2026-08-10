/**
 * Tiny global store that tracks photo uploads and sync retries,
 * so the UI can show how many photos are done / pending / retrying.
 */
import { useSyncExternalStore } from 'react';

export interface UploadTask {
  id: string;
  label: string;
  status: 'pendente' | 'enviando' | 'concluida' | 'falhou';
  attempt: number;
}

export interface UploadStatusState {
  tasks: UploadTask[];
  total: number;
  enviadas: number;
  pendentes: number;
  falhas: number;
  retentando: boolean;
  ultimaRetentativa: string | null;
  syncLabel: string | null;
}

let tasks: UploadTask[] = [];
let ultimaRetentativa: string | null = null;
let retryingCount = 0;
let syncLabel: string | null = null;
let snapshot: UploadStatusState = buildSnapshot();

const listeners = new Set<() => void>();

function buildSnapshot(): UploadStatusState {
  const enviadas = tasks.filter((t) => t.status === 'concluida').length;
  const falhas = tasks.filter((t) => t.status === 'falhou').length;
  const pendentes = tasks.filter((t) => t.status === 'pendente' || t.status === 'enviando').length;
  return {
    tasks,
    total: tasks.length,
    enviadas,
    pendentes,
    falhas,
    retentando: retryingCount > 0,
    ultimaRetentativa,
    syncLabel,
  };
}

function emit() {
  snapshot = buildSnapshot();
  listeners.forEach((l) => l());
}

function timeNow() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export const uploadStatus = {
  start(id: string, label: string) {
    tasks = [...tasks.filter((t) => t.id !== id), { id, label, status: 'enviando', attempt: 0 }];
    emit();
  },
  retry(id: string, attempt: number, label?: string) {
    ultimaRetentativa = `${timeNow()} — tentativa ${attempt}${label ? ` (${label})` : ''}`;
    tasks = tasks.map((t) => (t.id === id ? { ...t, attempt, status: 'enviando' } : t));
    emit();
  },
  success(id: string) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, status: 'concluida' } : t));
    emit();
  },
  fail(id: string) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, status: 'falhou' } : t));
    emit();
  },
  /** Marks a sync/save retry (not tied to a photo). */
  syncRetry(attempt: number, label?: string) {
    ultimaRetentativa = `${timeNow()} — reenvio dos dados, tentativa ${attempt}${label ? ` (${label})` : ''}`;
    emit();
  },
  syncStart(label: string) {
    syncLabel = label;
    retryingCount = 0;
    emit();
  },
  syncEnd() {
    syncLabel = null;
    emit();
  },
  setRetrying(active: boolean) {
    retryingCount = Math.max(0, retryingCount + (active ? 1 : -1));
    emit();
  },
  reset() {
    tasks = [];
    ultimaRetentativa = null;
    retryingCount = 0;
    syncLabel = null;
    emit();
  },
};

export function useUploadStatus(): UploadStatusState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );
}
