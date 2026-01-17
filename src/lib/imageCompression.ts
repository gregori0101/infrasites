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
