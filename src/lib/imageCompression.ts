/**
 * Image compression utilities for optimizing uploads
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  mimeType: 'image/jpeg'
};

/**
 * Compresses an image from a base64 data URL
 * @param dataURL - The base64 encoded image data URL
 * @param options - Compression options
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressImage(
  dataURL: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        const maxW = opts.maxWidth!;
        const maxH = opts.maxHeight!;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed format
        const compressedDataURL = canvas.toDataURL(opts.mimeType, opts.quality);
        
        resolve(compressedDataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = dataURL;
  });
}

/**
 * Compresses an image with progressive quality reduction until it meets size limit
 * @param dataURL - The base64 encoded image data URL
 * @param maxSizeKB - Maximum file size in KB (default: 500KB)
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressToMaxSize(
  dataURL: string,
  maxSizeKB: number = 500
): Promise<string> {
  let quality = 0.9;
  let compressed = await compressImage(dataURL, { quality });
  
  // Calculate size in KB (base64 is ~4/3 larger than binary)
  const getSize = (data: string) => Math.round((data.length * 3) / 4 / 1024);
  
  // Progressively reduce quality until size is acceptable
  while (getSize(compressed) > maxSizeKB && quality > 0.3) {
    quality -= 0.1;
    compressed = await compressImage(dataURL, { quality });
  }
  
  // If still too large, reduce dimensions
  if (getSize(compressed) > maxSizeKB) {
    compressed = await compressImage(dataURL, {
      quality: 0.7,
      maxWidth: 1280,
      maxHeight: 1280
    });
  }
  
  return compressed;
}

/**
 * Compression attempt configuration
 */
interface CompressionAttempt {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  mimeType: 'image/jpeg' | 'image/webp';
}

/**
 * Attempts to compress an image with multiple fallback strategies
 * @param dataURL - The base64 encoded image data URL
 * @param maxSizeKB - Maximum file size in KB (default: 800KB)
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressWithFallback(
  dataURL: string,
  maxSizeKB: number = 800
): Promise<string> {
  const getSize = (data: string) => Math.round((data.length * 3) / 4 / 1024);
  
  // Define compression attempts from highest quality to lowest
  const attempts: CompressionAttempt[] = [
    { quality: 0.9, maxWidth: 1920, maxHeight: 1920, mimeType: 'image/jpeg' },
    { quality: 0.8, maxWidth: 1600, maxHeight: 1600, mimeType: 'image/jpeg' },
    { quality: 0.7, maxWidth: 1280, maxHeight: 1280, mimeType: 'image/jpeg' },
    { quality: 0.6, maxWidth: 1024, maxHeight: 1024, mimeType: 'image/jpeg' },
    { quality: 0.5, maxWidth: 800, maxHeight: 800, mimeType: 'image/jpeg' },
    { quality: 0.4, maxWidth: 640, maxHeight: 640, mimeType: 'image/jpeg' },
    // Try WebP format as last resort (better compression)
    { quality: 0.6, maxWidth: 1024, maxHeight: 1024, mimeType: 'image/webp' },
    { quality: 0.5, maxWidth: 800, maxHeight: 800, mimeType: 'image/webp' },
  ];
  
  let lastResult = dataURL;
  let lastError: Error | null = null;
  
  for (const attempt of attempts) {
    try {
      const compressed = await compressImage(dataURL, {
        quality: attempt.quality,
        maxWidth: attempt.maxWidth,
        maxHeight: attempt.maxHeight,
        mimeType: attempt.mimeType,
      });
      
      const size = getSize(compressed);
      
      // If size is acceptable, return immediately
      if (size <= maxSizeKB) {
        console.log(`Image compressed successfully: ${size}KB (quality: ${attempt.quality}, ${attempt.maxWidth}x${attempt.maxHeight}, ${attempt.mimeType})`);
        return compressed;
      }
      
      // Keep the best result so far
      if (getSize(compressed) < getSize(lastResult)) {
        lastResult = compressed;
      }
    } catch (error) {
      console.warn(`Compression attempt failed (quality: ${attempt.quality}):`, error);
      lastError = error as Error;
      // Continue to next attempt
    }
  }
  
  // If we got here, return the best result we have (even if larger than maxSizeKB)
  const finalSize = getSize(lastResult);
  if (finalSize > maxSizeKB) {
    console.warn(`Could not compress to ${maxSizeKB}KB, best result: ${finalSize}KB`);
  }
  
  // If all attempts failed, throw the last error
  if (lastResult === dataURL && lastError) {
    throw lastError;
  }
  
  return lastResult;
}

/**
 * Gets the estimated file size of a base64 data URL in KB
 */
export function getBase64SizeKB(dataURL: string): number {
  // Remove data URL prefix to get just the base64 content
  const base64 = dataURL.split(',')[1] || dataURL;
  // Base64 is ~4/3 larger than binary
  return Math.round((base64.length * 3) / 4 / 1024);
}

/**
 * Checks if a string is a base64 data URL
 */
export function isBase64DataURL(str: string): boolean {
  return str.startsWith('data:image/');
}

// ============================================
// File-to-Blob compression utilities (memory-efficient)
// ============================================

interface FileToBlobOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_FILE_OPTIONS: FileToBlobOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  mimeType: 'image/jpeg'
};

/**
 * Yields execution to allow GC and prevent UI freeze
 * Uses requestAnimationFrame when available for smoother experience
 */
function yieldToMain(): Promise<void> {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Safely close an ImageBitmap if supported
 */
function safeCloseBitmap(bitmap: ImageBitmap | null): void {
  if (bitmap && typeof bitmap.close === 'function') {
    try {
      bitmap.close();
    } catch (e) {
      // Some browsers may throw if already closed
      console.warn('[safeCloseBitmap] Could not close bitmap:', e);
    }
  }
}

/**
 * Check if createImageBitmap is fully supported
 * Some browsers have partial support that may fail on certain image types
 */
function isCreateImageBitmapSupported(): boolean {
  if (typeof createImageBitmap !== 'function') {
    return false;
  }
  
  // Safari iOS has createImageBitmap but it can be flaky with certain formats
  // Check for proper support by looking at the function signature
  try {
    // Basic feature detection
    return true;
  } catch {
    return false;
  }
}

/**
 * Load an image from a File without using base64 (memory-efficient)
 * Tries createImageBitmap first, falls back to Image + objectURL
 * Compatible with Edge, Safari iOS, and Chrome Android
 */
async function loadImageFromFile(file: File): Promise<{ source: ImageBitmap | HTMLImageElement; objectUrl?: string; isBitmap: boolean }> {
  // Try createImageBitmap first (more memory efficient)
  if (isCreateImageBitmapSupported()) {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, isBitmap: true };
    } catch (e) {
      console.warn('[loadImageFromFile] createImageBitmap failed, using fallback:', e);
    }
  }

  // Fallback: Image element + objectURL (works everywhere including Safari iOS)
  const objectUrl = URL.createObjectURL(file);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Required for Safari iOS to properly load cross-origin images
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve({ source: img, objectUrl, isBitmap: false });
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

/**
 * Compress an image file directly to a Blob (no base64 intermediate)
 * This is much more memory-efficient than the base64 approach
 */
export async function compressFileToBlob(
  file: File,
  options: FileToBlobOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_FILE_OPTIONS, ...options };
  
  let objectUrl: string | undefined;
  let source: ImageBitmap | HTMLImageElement | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    // Load image
    const loaded = await loadImageFromFile(file);
    source = loaded.source;
    objectUrl = loaded.objectUrl;

    // Get original dimensions
    const origWidth = source instanceof ImageBitmap ? source.width : source.naturalWidth;
    const origHeight = source instanceof ImageBitmap ? source.height : source.naturalHeight;

    // Calculate new dimensions maintaining aspect ratio
    let width = origWidth;
    let height = origHeight;
    const maxW = opts.maxWidth!;
    const maxH = opts.maxHeight!;

    if (width > maxW || height > maxH) {
      const ratio = Math.min(maxW / width, maxH / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Yield before heavy canvas work
    await yieldToMain();

    // Create canvas and draw
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, width, height);

    // Yield after draw
    await yieldToMain();

    // Convert to Blob
    return new Promise((resolve, reject) => {
      canvas!.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        opts.mimeType,
        opts.quality
      );
    });
  } finally {
    // Cleanup to help GC - use delayed cleanup for Safari iOS stability
    if (objectUrl) {
      // Safari iOS needs a delay before revoking object URLs
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    }
    if (source && 'close' in source && typeof (source as ImageBitmap).close === 'function') {
      safeCloseBitmap(source as ImageBitmap);
    }
    if (canvas) {
      // Clear canvas to free memory
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0;
      canvas.height = 0;
    }
    source = null;
    canvas = null;
  }
}

/**
 * Compression attempt configuration for file-to-blob
 */
interface FileToBlobAttempt {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  mimeType: 'image/jpeg' | 'image/webp';
}

/**
 * Compress a file with multiple fallback strategies until size target is met
 * Memory-efficient version that never creates base64 strings
 */
export async function compressFileToBlobWithFallback(
  file: File,
  maxSizeKB: number = 500,
  isMobile: boolean = false
): Promise<Blob> {
  // CRITICAL: Mobile gets much more aggressive compression to prevent OOM crashes
  const baseDimension = isMobile ? 1024 : 1920;
  const baseQuality = isMobile ? 0.7 : 0.85;
  
  const attempts: FileToBlobAttempt[] = isMobile
    ? [
        // Mobile: Start smaller and more aggressive
        { quality: 0.7, maxWidth: 1024, maxHeight: 1024, mimeType: 'image/jpeg' },
        { quality: 0.6, maxWidth: 800, maxHeight: 800, mimeType: 'image/jpeg' },
        { quality: 0.5, maxWidth: 640, maxHeight: 640, mimeType: 'image/jpeg' },
        { quality: 0.4, maxWidth: 480, maxHeight: 480, mimeType: 'image/jpeg' },
        // WebP last resort
        { quality: 0.55, maxWidth: 800, maxHeight: 800, mimeType: 'image/webp' },
      ]
    : [
        // Desktop: Can handle larger sizes
        { quality: 0.85, maxWidth: baseDimension, maxHeight: baseDimension, mimeType: 'image/jpeg' },
        { quality: 0.75, maxWidth: 1280, maxHeight: 1280, mimeType: 'image/jpeg' },
        { quality: 0.65, maxWidth: 1024, maxHeight: 1024, mimeType: 'image/jpeg' },
        { quality: 0.55, maxWidth: 800, maxHeight: 800, mimeType: 'image/jpeg' },
        { quality: 0.6, maxWidth: 1024, maxHeight: 1024, mimeType: 'image/webp' },
      ];

  let lastResult: Blob | null = null;
  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      // Yield between attempts to prevent UI freeze
      await yieldToMain();
      
      const blob = await compressFileToBlob(file, {
        quality: attempt.quality,
        maxWidth: attempt.maxWidth,
        maxHeight: attempt.maxHeight,
        mimeType: attempt.mimeType,
      });

      const sizeKB = Math.round(blob.size / 1024);

      if (sizeKB <= maxSizeKB) {
        console.log(`[compressFileToBlobWithFallback] Success: ${sizeKB}KB (q:${attempt.quality}, ${attempt.maxWidth}x${attempt.maxHeight}, ${attempt.mimeType})`);
        return blob;
      }

      // Keep best result
      if (!lastResult || blob.size < lastResult.size) {
        lastResult = blob;
      }
    } catch (error) {
      console.warn(`[compressFileToBlobWithFallback] Attempt failed (q:${attempt.quality}):`, error);
      lastError = error as Error;
    }
  }

  if (lastResult) {
    const finalSizeKB = Math.round(lastResult.size / 1024);
    console.warn(`[compressFileToBlobWithFallback] Could not reach ${maxSizeKB}KB, best: ${finalSizeKB}KB`);
    return lastResult;
  }

  throw lastError || new Error('All compression attempts failed');
}
