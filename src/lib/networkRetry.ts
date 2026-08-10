import { toast } from 'sonner';
import { uploadStatus } from '@/lib/uploadStatus';

/** Wait until the browser reports it is online again (or until timeout). */
export function waitForOnline(timeoutMs = 120000): Promise<boolean> {
  if (typeof navigator === 'undefined' || navigator.onLine) return Promise.resolve(true);

  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      window.removeEventListener('online', onOnline);
      clearTimeout(timer);
      resolve(ok);
    };
    const onOnline = () => finish(true);
    const timer = setTimeout(() => finish(false), timeoutMs);
    window.addEventListener('online', onOnline);
  });
}

/** Errors caused by connectivity (worth retrying) vs. permission/validation errors (not). */
export function isNetworkError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();
  if (!message) return false;
  if (
    message.includes('row-level security') ||
    message.includes('policy') ||
    message.includes('unauthorized') ||
    message.includes('403') ||
    message.includes('duplicate key') ||
    message.includes('violates')
  ) {
    return false;
  }
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network error') ||
    message.includes('load failed') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('aborted') ||
    message.includes('connection') ||
    message.includes('offline') ||
    message.includes('fetch') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  );
}

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  label?: string;
  /** Show a toast informing the user that a retry is happening. */
  notify?: boolean;
}

/**
 * Runs an async operation, retrying automatically when the connection drops.
 * Waits for the browser to be back online before each retry.
 */
export async function retryOnNetworkError<T>(
  operation: () => Promise<T>,
  { retries = 4, baseDelayMs = 800, label, notify = true }: RetryOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (notify && attempt === 0) {
        toast.warning('Sem conexão — aguardando a rede voltar para continuar o envio...', { duration: 5000 });
      }
      await waitForOnline();
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isNetworkError(error)) throw error;

      uploadStatus.syncRetry(attempt + 1, label);
      if (notify) {
        toast.warning(
          `Conexão instável${label ? ` (${label})` : ''}. Tentando novamente (${attempt + 1}/${retries})...`,
          { duration: 4000 },
        );
      }

      uploadStatus.setRetrying(true);
      await waitForOnline();
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)));
      uploadStatus.setRetrying(false);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Falha de conexão.');
}
