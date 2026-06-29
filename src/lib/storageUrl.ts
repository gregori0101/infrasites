import { supabase } from '@/integrations/supabase/client';

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/**
 * Create a long-lived signed URL for a path inside a private bucket.
 * Returns null on failure (caller should decide whether to throw).
 */
export async function createLongSignedUrl(bucket: string, path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
    if (error || !data?.signedUrl) {
      console.warn('[storageUrl] createSignedUrl failed', bucket, path, error);
      return null;
    }
    return data.signedUrl;
  } catch (e) {
    console.warn('[storageUrl] createSignedUrl exception', bucket, path, e);
    return null;
  }
}

/**
 * Best-effort: convert a legacy stored URL (public CDN form or already-signed)
 * into a fresh signed URL. Returns the original string when the URL is not a
 * storage object URL we recognize.
 */
export async function resolveStorageUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  // Already a signed URL with a valid token query string? Just return it.
  // For freshness on long expiries we still try to re-sign when possible.
  const publicMarker = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/([^?]+)/;
  const match = url.match(publicMarker);
  if (!match) return url;
  const bucket = decodeURIComponent(match[1]);
  const path = decodeURIComponent(match[2]);
  const signed = await createLongSignedUrl(bucket, path);
  return signed ?? url;
}
