import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { compressWithFallback, isBase64DataURL, getBase64SizeKB } from '@/lib/imageCompression';
import { toast } from 'sonner';

const BUCKET_NAME = 'report-photos';
const MAX_SIZE_KB = 400; // Target size for localStorage-safe storage

interface UsePhotoUploadOptions {
  siteCode?: string;
  category: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook that handles photo upload to Supabase Storage immediately after capture
 * This prevents localStorage quota issues by storing URLs instead of base64 data
 */
export function usePhotoUpload({ siteCode, category, onSuccess, onError }: UsePhotoUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhoto = useCallback(async (base64Data: string): Promise<string | null> => {
    // If already a URL, return it directly
    if (base64Data.startsWith('http')) {
      onSuccess?.(base64Data);
      return base64Data;
    }

    // If no siteCode, fall back to localStorage-compatible compression
    if (!siteCode) {
      try {
        setIsUploading(true);
        setUploadProgress(30);
        
        // Compress more aggressively for localStorage
        const compressed = await compressWithFallback(base64Data, MAX_SIZE_KB);
        setUploadProgress(100);
        onSuccess?.(compressed);
        return compressed;
      } catch (error) {
        console.error('Compression failed:', error);
        onError?.(error as Error);
        return null;
      } finally {
        setIsUploading(false);
      }
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
      const fileName = `${siteCode}/${timestamp}/${category}_${uuidv4().slice(0, 8)}.jpg`;

      // Convert base64 to blob
      const arr = processedData.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });

      setUploadProgress(60);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      setUploadProgress(90);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      
      setUploadProgress(100);
      console.log(`[PhotoUpload] Success: ${fileName}`);
      
      onSuccess?.(publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('[PhotoUpload] Error:', error);
      onError?.(error as Error);
      
      // Fallback: return compressed base64 if upload fails
      try {
        const fallback = await compressWithFallback(base64Data, MAX_SIZE_KB);
        console.log('[PhotoUpload] Using compressed base64 fallback');
        return fallback;
      } catch {
        return null;
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [siteCode, category, onSuccess, onError]);

  const deletePhoto = useCallback(async (url: string): Promise<boolean> => {
    if (!url.startsWith('http') || !url.includes(BUCKET_NAME)) {
      return true; // Not a storage URL, nothing to delete
    }

    try {
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return true;
      
      const path = decodeURIComponent(url.substring(idx + marker.length));
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

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
    deletePhoto,
    isUploading,
    uploadProgress,
  };
}
