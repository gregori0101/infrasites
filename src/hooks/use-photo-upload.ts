import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import {
  compressWithFallback,
  isBase64DataURL,
  getBase64SizeKB,
  compressFileToBlobWithFallback,
} from '@/lib/imageCompression';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const BUCKET_NAME = 'report-photos';
const MAX_SIZE_KB = 400; // Target size for localStorage-safe storage (fallback only)

const DRAFT_SITE_CODE_KEY = 'draftSiteCode';

function getOrCreateDraftSiteCode(): string {
  // Use sessionStorage so it survives navigation but resets when the tab is closed
  try {
    const existing = sessionStorage.getItem(DRAFT_SITE_CODE_KEY);
    if (existing) return existing;

    const draft = `rascunho_${new Date().toISOString().slice(0, 10)}_${uuidv4().slice(0, 8)}`;
    sessionStorage.setItem(DRAFT_SITE_CODE_KEY, draft);
    return draft;
  } catch {
    // Very defensive fallback (should be rare)
    return `rascunho_${Date.now()}_${uuidv4().slice(0, 8)}`;
  }
}

interface UsePhotoUploadOptions {
  siteCode?: string;
  category: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Convert base64 data URL to Blob - iOS Safari compatible
 */
function dataURLToBlob(dataURL: string): Blob {
  try {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // Use a safer base64 decoding approach for iOS
    const base64 = arr[1];
    const byteCharacters = atob(base64);

    // Process in smaller chunks to avoid memory issues on iOS
    const sliceSize = 512;
    const byteArrays: BlobPart[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray.buffer);
    }

    return new Blob(byteArrays, { type: mime });
  } catch (error) {
    console.error('[dataURLToBlob] Error:', error);
    throw new Error('Falha ao processar imagem. Tente capturar novamente.');
  }
}

/**
 * Hook that handles photo upload to Storage immediately after capture.
 * Key rule for stability: avoid keeping base64 in memory/state/localStorage whenever possible.
 */
export function usePhotoUpload({ siteCode, category, onSuccess, onError }: UsePhotoUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isMobileFromHook = useIsMobile();

  // Enhanced mobile detection for iOS Safari and other mobile browsers
  const isMobile =
    isMobileFromHook ||
    (typeof navigator !== 'undefined' &&
      (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document))); // iPad with desktop mode

  const effectiveSiteCode = siteCode || getOrCreateDraftSiteCode();

  /**
   * Upload a File directly (memory-efficient, avoids base64)
   * This is the preferred method for mobile devices.
   */
  const uploadPhotoFile = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true);
      setUploadProgress(10);

      try {
        // CRITICAL: Larger delay for mobile to allow UI to stabilize
        await new Promise((resolve) => setTimeout(resolve, isMobile ? 200 : 50));
        
        // Compress file directly to blob (no base64)
        console.log(`[PhotoUpload] Compressing file: ${Math.round(file.size / 1024)}KB - ${category}`);
        
        // CRITICAL: Much smaller target for mobile to prevent OOM crashes
        const targetSizeKB = isMobile ? 250 : 500;
        const blob = await compressFileToBlobWithFallback(file, targetSizeKB, isMobile);
        console.log(`[PhotoUpload] Compressed to: ${Math.round(blob.size / 1024)}KB - ${category}`);

        setUploadProgress(50);
        
        // CRITICAL: Longer GC pause on mobile to prevent crash
        await new Promise((resolve) => setTimeout(resolve, isMobile ? 100 : 30));

        // Generate unique filename
        const timestamp = new Date().toISOString().slice(0, 10);
        const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${effectiveSiteCode}/${timestamp}/${category}_${uuidv4().slice(0, 8)}.${ext}`;

        setUploadProgress(60);

        // Upload to Storage with retry
        let uploadError: { message: string } | null = null;
        let retries = 0;
        const maxRetries = 2;

        while (retries <= maxRetries) {
          const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, blob, {
            contentType: blob.type,
            upsert: true,
          });

          if (!error) {
            uploadError = null;
            break;
          }

          uploadError = error;
          retries++;

          if (retries <= maxRetries) {
            console.log(`[PhotoUpload] Retry ${retries}/${maxRetries} for ${category}`);
            await new Promise((resolve) => setTimeout(resolve, 800 * retries));
          }
        }

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        setUploadProgress(90);

        // Get public URL
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        setUploadProgress(100);
        console.log(`[PhotoUpload] Success: ${fileName}`);

        onSuccess?.(publicUrl);
        return publicUrl;
      } catch (error) {
        console.error('[PhotoUpload] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        onError?.(new Error(errorMessage));

        // Return null on failure - no fallback to base64 to avoid memory issues
        toast.error('Falha no upload da foto', {
          description: 'Tente novamente ou verifique sua conexão.',
        });
        return null;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [category, effectiveSiteCode, isMobile, onError, onSuccess],
  );

  /**
   * Legacy method: Upload from base64 data URL
   * Kept for backwards compatibility
   */
  const uploadPhoto = useCallback(
    async (base64Data: string): Promise<string | null> => {
      // If already a URL, return it directly
      if (base64Data.startsWith('http')) {
        onSuccess?.(base64Data);
        return base64Data;
      }

      setIsUploading(true);
      setUploadProgress(10);

      try {
        // Compress image first
        let processedData = base64Data;
        if (isBase64DataURL(base64Data)) {
          const originalSize = getBase64SizeKB(base64Data);
          console.log(`[PhotoUpload] Original: ${originalSize}KB - ${category}`);

          try {
            processedData = await compressWithFallback(base64Data, 500);
            const compressedSize = getBase64SizeKB(processedData);
            console.log(`[PhotoUpload] Compressed: ${compressedSize}KB - ${category}`);
          } catch (err) {
            console.warn('[PhotoUpload] Compression warning:', err);
          }
        }

        setUploadProgress(40);

        // Generate unique filename
        const timestamp = new Date().toISOString().slice(0, 10);
        const fileName = `${effectiveSiteCode}/${timestamp}/${category}_${uuidv4().slice(0, 8)}.jpg`;

        // Convert base64 to blob using iOS-safe method
        const blob = dataURLToBlob(processedData);

        setUploadProgress(60);

        // Upload to Storage with retry for iOS
        let uploadError: { message: string } | null = null;
        let retries = 0;
        const maxRetries = 2;

        while (retries <= maxRetries) {
          const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

          if (!error) {
            uploadError = null;
            break;
          }

          uploadError = error;
          retries++;

          if (retries <= maxRetries) {
            console.log(`[PhotoUpload] Retry ${retries}/${maxRetries} for ${category}`);
            // Small delay before retry
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        setUploadProgress(90);

        // Get public URL
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        setUploadProgress(100);
        console.log(`[PhotoUpload] Success: ${fileName}`);

        onSuccess?.(publicUrl);
        return publicUrl;
      } catch (error) {
        console.error('[PhotoUpload] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        onError?.(new Error(errorMessage));

        // Fallback: return compressed base64 if upload fails
        try {
          const fallback = await compressWithFallback(base64Data, MAX_SIZE_KB);
          console.log('[PhotoUpload] Using compressed base64 fallback');
          toast.warning('Foto salva localmente', {
            description: 'Será enviada ao finalizar o relatório.',
          });
          return fallback;
        } catch {
          return null;
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [category, effectiveSiteCode, onError, onSuccess],
  );

  const deletePhoto = useCallback(async (url: string): Promise<boolean> => {
    if (!url.startsWith('http') || !url.includes(BUCKET_NAME)) {
      return true; // Not a storage URL, nothing to delete
    }

    try {
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return true;

      const path = decodeURIComponent(url.substring(idx + marker.length));

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

      if (error) {
        console.warn('[PhotoUpload] Delete warning:', error);
      }

      return true;
    } catch (error) {
      console.warn('[PhotoUpload] Delete error:', error);
      return false;
    }
  }, []);

  return {
    uploadPhoto,
    uploadPhotoFile,
    deletePhoto,
    isUploading,
    uploadProgress,
  };
}
