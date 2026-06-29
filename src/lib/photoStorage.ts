import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { compressToMaxSize, isBase64DataURL, getBase64SizeKB } from './imageCompression';

const BUCKET_NAME = 'report-photos';
const MAX_IMAGE_SIZE_KB = 500; // Target max size for compressed images

/**
 * Converts a base64 data URL to a Blob - iOS Safari compatible
 * Uses chunked processing to avoid memory issues on mobile devices
 */
function dataURLToBlob(dataURL: string): Blob {
  try {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    
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
    throw new Error('Falha ao processar imagem para upload.');
  }
}

/**
 * Check if user is authenticated and can upload
 */
async function checkUploadPermission(): Promise<{ allowed: boolean; error?: string }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return { allowed: false, error: 'Usuário não autenticado. Faça login novamente.' };
    }
    
    return { allowed: true };
  } catch (e) {
    console.error('[checkUploadPermission] Error:', e);
    return { allowed: false, error: 'Erro ao verificar autenticação.' };
  }
}

/**
 * Uploads a photo to Supabase Storage and returns the public URL
 * Automatically compresses images before upload
 */
export async function uploadPhoto(
  base64Data: string,
  siteCode: string,
  category: string
): Promise<string> {
  // If it's already a URL (not base64), return it as is
  if (base64Data.startsWith('http')) {
    return base64Data;
  }

  // Compress image before upload if it's base64
  let processedData = base64Data;
  if (isBase64DataURL(base64Data)) {
    const originalSize = getBase64SizeKB(base64Data);
    console.log(`[Photo] Original size: ${originalSize}KB - ${category}`);
    
    try {
      // More aggressive compression for mobile (300KB target)
      const targetSize = originalSize > 1000 ? 300 : MAX_IMAGE_SIZE_KB;
      processedData = await compressToMaxSize(base64Data, targetSize);
      const compressedSize = getBase64SizeKB(processedData);
      const savings = Math.round((1 - compressedSize / originalSize) * 100);
      console.log(`[Photo] Compressed: ${compressedSize}KB (${savings}% reduction) - ${category}`);
    } catch (err) {
      console.warn(`[Photo] Compression failed, using original - ${category}:`, err);
      processedData = base64Data;
    }
  }

  // Generate unique filename (always jpg after compression)
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `${siteCode}/${timestamp}/${category}_${uuidv4().slice(0, 8)}.jpg`;

  // Convert base64 to blob
  let blob: Blob;
  try {
    blob = dataURLToBlob(processedData);
  } catch (blobError) {
    console.error(`[Photo] Blob conversion failed for ${category}:`, blobError);
    throw new Error(`Falha ao processar imagem (${category})`);
  }

  // Upload to Supabase Storage with retry on auth errors
  let retries = 0;
  const maxRetries = 2;
  let lastError: any = null;

  while (retries <= maxRetries) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (!error) {
      // Success - bucket is private; create a long-lived signed URL
      const { data: signedData, error: signErr } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10); // 10 years

      // Clear reference to help GC
      processedData = '';

      if (signErr || !signedData?.signedUrl) {
        console.error(`[Photo] Sign URL failed for ${category}:`, signErr);
        throw new Error(`Falha ao gerar URL da foto (${category})`);
      }
      console.log(`[Photo] Uploaded successfully: ${category} -> ${fileName}`);
      return signedData.signedUrl;
    }

    lastError = error;
    console.error(`[Photo] Upload attempt ${retries + 1} failed for ${category}:`, error);

    // Check for specific error types
    if (error.message?.includes('row-level security') || 
        error.message?.includes('policy') ||
        error.message?.includes('403') ||
        error.message?.includes('Unauthorized')) {
      // Permission error - check auth status
      const permCheck = await checkUploadPermission();
      if (!permCheck.allowed) {
        throw new Error(permCheck.error || 'Sem permissão para upload. Faça login novamente.');
      }
      // If authenticated but still failing, it's a server-side policy issue
      throw new Error(`Sem permissão para enviar fotos (${category}). Verifique se seu usuário está aprovado.`);
    }

    retries++;
    if (retries <= maxRetries) {
      // Wait before retry with exponential backoff
      await delay(500 * retries);
    }
  }

  // All retries failed
  const errorMsg = lastError?.message || 'Erro desconhecido';
  console.error(`[Photo] All upload attempts failed for ${category}:`, errorMsg);
  throw new Error(`Falha no upload (${category}): ${errorMsg}`);
}

/**
 * Uploads all photos from checklist data and returns updated data with URLs
 */
/**
 * Small delay helper for iOS memory management
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Detect if running on iOS Safari
 */
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
  return isIOS || isSafari;
}

/**
 * Upload with retry logic for iOS Safari stability
 */
async function uploadWithRetry(
  base64Data: string,
  siteCode: string,
  category: string,
  maxRetries = 2
): Promise<string> {
  let lastError: Error | null = null;
  const isIOS = isIOSSafari();
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[PhotoUpload] Retry ${attempt}/${maxRetries} for ${category}`);
        // Longer delay on iOS for memory recovery
        await delay(isIOS ? 800 * attempt : 500 * attempt);
      }
      return await uploadPhoto(base64Data, siteCode, category);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[PhotoUpload] Attempt ${attempt + 1} failed for ${category}:`, error);
      
      // On iOS, give extra time for GC before retry
      if (isIOS) {
        await delay(300);
      }
    }
  }
  
  throw lastError || new Error('Upload failed');
}

export async function uploadAllPhotos(
  data: any,
  siteCode: string
): Promise<any> {
  const updatedData = JSON.parse(JSON.stringify(data)); // Deep clone to avoid mutations

  // Helper function to upload a single photo with retry
  const uploadSinglePhoto = async (
    photo: string | null | undefined,
    category: string
  ): Promise<string | null> => {
    if (!photo || photo.startsWith('http')) return photo || null;
    try {
      const result = await uploadWithRetry(photo, siteCode, category);
      // Longer delay on iOS after each upload to prevent memory pressure
      const delayMs = isIOSSafari() ? 200 : 100;
      await delay(delayMs);
      return result;
    } catch (e: any) {
      // CRITICAL: never fall back to returning base64 and accidentally store it in DB.
      console.error(`[uploadAllPhotos] Failed to upload ${category}:`, e);
      const msg = e?.message ? String(e.message) : 'erro desconhecido';
      throw new Error(`Falha ao enviar foto (${category}): ${msg}`);
    }
  };

  // Helper function to upload array of photos SEQUENTIALLY (not parallel) for iOS stability
  const uploadPhotoArray = async (
    photos: (string | null | undefined)[] | undefined,
    category: string
  ): Promise<(string | null)[]> => {
    if (!Array.isArray(photos)) return [];
    const results: (string | null)[] = [];
    for (let idx = 0; idx < photos.length; idx++) {
      const p = photos[idx];
      if (p) {
        results.push(await uploadSinglePhoto(p, `${category}_${idx}`));
      } else {
        results.push(null);
      }
    }
    return results;
  };

  // Upload panoramic photo
  updatedData.fotoPanoramica = await uploadSinglePhoto(
    data.fotoPanoramica,
    'site_panoramica'
  );

  // Upload observation photos with descriptions (FotoObservacao[])
  // CRITICAL: Sequential upload for iOS stability (avoid parallel Promise.all)
  if (Array.isArray(data.fotosObservacao)) {
    updatedData.fotosObservacao = [];
    for (let idx = 0; idx < data.fotosObservacao.length; idx++) {
      const item = data.fotosObservacao[idx];
      const uploadedFoto = item?.foto ? await uploadSinglePhoto(item.foto, `observacao_${idx}`) : null;
      updatedData.fotosObservacao.push({ foto: uploadedFoto, descricao: item?.descricao || '' });
    }
  } else {
    updatedData.fotosObservacao = [];
  }

  // Upload signature
  updatedData.assinaturaDigital = await uploadSinglePhoto(
    data.assinaturaDigital,
    'assinatura'
  );

  // Upload gabinete photos
  const gabinetes = Array.isArray(data.gabinetes) ? data.gabinetes : [];
  for (let i = 0; i < gabinetes.length; i++) {
    const gab = updatedData.gabinetes[i];
    if (!gab) continue;
    
    const prefix = `gabinete_${i + 1}`;

    // FCC photos (array of FCCs)
    if (gab.fcc?.fccs && Array.isArray(gab.fcc.fccs)) {
      for (let j = 0; j < gab.fcc.fccs.length; j++) {
        const fcc = gab.fcc.fccs[j];
        if (!fcc) continue;
        gab.fcc.fccs[j].fotoPanoramica = await uploadSinglePhoto(
          fcc.fotoPanoramica,
          `${prefix}_fcc${j + 1}_panoramica`
        );
        gab.fcc.fccs[j].fotoPainel = await uploadSinglePhoto(
          fcc.fotoPainel,
          `${prefix}_fcc${j + 1}_painel`
        );
      }
    }

    // Battery photos (array of bancos)
    if (gab.baterias?.bancos && Array.isArray(gab.baterias.bancos)) {
      for (let j = 0; j < gab.baterias.bancos.length; j++) {
        const banco = gab.baterias.bancos[j];
        if (!banco) continue;
        gab.baterias.bancos[j].fotoBanco = await uploadSinglePhoto(
          banco.fotoBanco,
          `${prefix}_bateria${j + 1}`
        );
      }
    }

    // Climate photos
    if (gab.climatizacao) {
      gab.climatizacao.fotoAR1 = await uploadSinglePhoto(
        gab.climatizacao.fotoAR1,
        `${prefix}_ar1`
      );
      gab.climatizacao.fotoAR2 = await uploadSinglePhoto(
        gab.climatizacao.fotoAR2,
        `${prefix}_ar2`
      );
      gab.climatizacao.fotoAR3 = await uploadSinglePhoto(
        gab.climatizacao.fotoAR3,
        `${prefix}_ar3`
      );
      gab.climatizacao.fotoAR4 = await uploadSinglePhoto(
        gab.climatizacao.fotoAR4,
        `${prefix}_ar4`
      );
      gab.climatizacao.fotoCondensador = await uploadSinglePhoto(
        gab.climatizacao.fotoCondensador,
        `${prefix}_condensador`
      );
      gab.climatizacao.fotoEvaporador = await uploadSinglePhoto(
        gab.climatizacao.fotoEvaporador,
        `${prefix}_evaporador`
      );
      gab.climatizacao.fotoControlador = await uploadSinglePhoto(
        gab.climatizacao.fotoControlador,
        `${prefix}_controlador`
      );
    }

    // Gabinete photos
    gab.fotoPanoramicaGabinete = await uploadSinglePhoto(
      gab.fotoPanoramicaGabinete,
      `${prefix}_panoramica`
    );
    gab.fotoTransmissao = await uploadSinglePhoto(
      gab.fotoTransmissao,
      `${prefix}_transmissao`
    );
    gab.fotoAcesso = await uploadSinglePhoto(
      gab.fotoAcesso,
      `${prefix}_acesso`
    );
  }

  // Upload fiber optic photos (fibraOptica - new structure)
  if (data.fibraOptica) {
    if (!updatedData.fibraOptica) {
      updatedData.fibraOptica = {};
    }

    // Upload abordagens photos
    const abordagens = Array.isArray(data.fibraOptica.abordagens) ? data.fibraOptica.abordagens : [];
    if (!Array.isArray(updatedData.fibraOptica.abordagens)) {
      updatedData.fibraOptica.abordagens = [];
    }
    for (let i = 0; i < abordagens.length; i++) {
      const abordagem = abordagens[i];
      if (!updatedData.fibraOptica.abordagens[i]) {
        updatedData.fibraOptica.abordagens[i] = { ...abordagem };
      }
      if (Array.isArray(abordagem?.fotos)) {
        updatedData.fibraOptica.abordagens[i].fotos = await uploadPhotoArray(
          abordagem.fotos,
          `fibra_abord${i + 1}_foto`
        );
      }
    }

    // Upload caixas de passagem photos
    updatedData.fibraOptica.fotosCaixasPassagem = await uploadPhotoArray(
      data.fibraOptica.fotosCaixasPassagem,
      'fibra_caixa_passagem'
    );

    // Upload caixas subterraneas photos
    updatedData.fibraOptica.fotosCaixasSubterraneas = await uploadPhotoArray(
      data.fibraOptica.fotosCaixasSubterraneas,
      'fibra_caixa_subterranea'
    );

    // Upload subidas laterais photos
    updatedData.fibraOptica.fotosSubidasLaterais = await uploadPhotoArray(
      data.fibraOptica.fotosSubidasLaterais,
      'fibra_subida_lateral'
    );

    // Upload DGO photos
    const dgos = Array.isArray(data.fibraOptica.dgos) ? data.fibraOptica.dgos : [];
    console.log(`[PhotoUpload] Processing ${dgos.length} DGOs`);
    
    if (!Array.isArray(updatedData.fibraOptica.dgos)) {
      updatedData.fibraOptica.dgos = [];
    }
    
    for (let i = 0; i < dgos.length; i++) {
      const dgo = dgos[i];
      if (!dgo) continue;
      
      // Ensure the DGO object exists in updatedData
      if (!updatedData.fibraOptica.dgos[i]) {
        updatedData.fibraOptica.dgos[i] = { ...dgo };
      } else {
        // Copy all properties from original dgo to preserve non-photo fields
        updatedData.fibraOptica.dgos[i] = { 
          ...dgo,
          ...updatedData.fibraOptica.dgos[i]
        };
      }
      
      // Upload DGO main photo
      if (dgo.fotoDGO) {
        console.log(`[PhotoUpload] Uploading DGO ${i + 1} main photo`);
        updatedData.fibraOptica.dgos[i].fotoDGO = await uploadSinglePhoto(
          dgo.fotoDGO,
          `dgo_${i + 1}_foto`
        );
      }
      
      // Upload cordões photo if exists
      if (dgo.fotoCordesDetalhada) {
        console.log(`[PhotoUpload] Uploading DGO ${i + 1} cordões photo`);
        updatedData.fibraOptica.dgos[i].fotoCordesDetalhada = await uploadSinglePhoto(
          dgo.fotoCordesDetalhada,
          `dgo_${i + 1}_cordoes`
        );
      }
      
      // Preserve other fields from original DGO
      updatedData.fibraOptica.dgos[i].identificacao = dgo.identificacao;
      updatedData.fibraOptica.dgos[i].capacidadeFO = dgo.capacidadeFO;
      updatedData.fibraOptica.dgos[i].estadoCordoes = dgo.estadoCordoes;
    }
    
    console.log(`[PhotoUpload] DGO upload complete. Result:`, updatedData.fibraOptica.dgos.map((d: any) => ({
      id: d?.identificacao,
      foto: d?.fotoDGO ? 'uploaded' : 'none',
      cordoes: d?.fotoCordesDetalhada ? 'uploaded' : 'none'
    })));
  }

  // Upload energy photos
  if (data.energia) {
    if (!updatedData.energia) {
      updatedData.energia = {};
    }
    if (data.energia.fotoTransformador) {
      updatedData.energia.fotoTransformador = await uploadSinglePhoto(
        data.energia.fotoTransformador,
        'energia_transformador'
      );
    }
    if (data.energia.fotoQuadroGeral) {
      updatedData.energia.fotoQuadroGeral = await uploadSinglePhoto(
        data.energia.fotoQuadroGeral,
        'energia_quadro'
      );
    }
    // Upload relógio photo if exists
    if (data.energia.fotoRelogio) {
      updatedData.energia.fotoRelogio = await uploadSinglePhoto(
        data.energia.fotoRelogio,
        'energia_relogio'
      );
    }
  }

  // Upload tower photos
  if (data.torre) {
    if (!updatedData.torre) {
      updatedData.torre = { ...data.torre };
    }
    if (data.torre.fotoFibrasProtegidas) {
      updatedData.torre.fotoFibrasProtegidas = await uploadSinglePhoto(
        data.torre.fotoFibrasProtegidas,
        'torre_fibras_protegidas'
      );
    }
    if (data.torre.fotoNinhos) {
      updatedData.torre.fotoNinhos = await uploadSinglePhoto(
        data.torre.fotoNinhos,
        'torre_ninhos'
      );
    }
    if (data.torre.fotoAterramento) {
      updatedData.torre.fotoAterramento = await uploadSinglePhoto(
        data.torre.fotoAterramento,
        'torre_aterramento'
      );
    }
    if (data.torre.fotoZeladoria) {
      updatedData.torre.fotoZeladoria = await uploadSinglePhoto(
        data.torre.fotoZeladoria,
        'torre_zeladoria'
      );
    }
  }

  // Upload GMG photos
  if (data.gmg) {
    if (!updatedData.gmg) {
      updatedData.gmg = { ...data.gmg };
    }
    if (data.gmg.fotoGMG) {
      updatedData.gmg.fotoGMG = await uploadSinglePhoto(
        data.gmg.fotoGMG,
        'gmg_painel'
      );
    }
    // Upload GMG alarm photo
    if (data.gmg.fotoAlarme) {
      updatedData.gmg.fotoAlarme = await uploadSinglePhoto(
        data.gmg.fotoAlarme,
        'gmg_alarme'
      );
    }
  }

  // Upload extra photos (fotosExtras map)
  if (data.fotosExtras && typeof data.fotosExtras === 'object') {
    updatedData.fotosExtras = {};
    const keys = Object.keys(data.fotosExtras);
    for (const key of keys) {
      const photos = data.fotosExtras[key];
      if (Array.isArray(photos) && photos.length > 0) {
        updatedData.fotosExtras[key] = await uploadPhotoArray(photos, `extra_${key}`);
      }
    }
  }

  return updatedData;
}

/**
 * Get public URL for a stored photo
 */
export function getPhotoUrl(path: string): string {
  if (path.startsWith('http')) return path;
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

function extractBucketPathFromPublicUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    // Expected path: /storage/v1/object/public/<bucket>/<path>
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.pathname.substring(idx + marker.length));
  } catch {
    return null;
  }
}

/**
 * Deletes photos from storage given their public URLs.
 * Only URLs that belong to the configured bucket will be deleted.
 */
export async function deletePhotosByPublicUrls(publicUrls: string[]): Promise<{ deleted: number }>{
  const paths = Array.from(
    new Set(
      (publicUrls || [])
        .filter((u): u is string => typeof u === 'string' && u.startsWith('http'))
        .map(extractBucketPathFromPublicUrl)
        .filter((p): p is string => !!p)
    )
  );

  if (paths.length === 0) return { deleted: 0 };

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(paths);

  if (error) {
    console.error('Error deleting photos from storage:', error);
    throw new Error(`Erro ao excluir fotos do armazenamento: ${error.message}`);
  }

  return { deleted: paths.length };
}
