import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { compressToMaxSize, isBase64DataURL, getBase64SizeKB } from './imageCompression';

const BUCKET_NAME = 'report-photos';
const MAX_IMAGE_SIZE_KB = 500; // Target max size for compressed images

/**
 * Converts a base64 data URL to a Blob
 */
function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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
      processedData = await compressToMaxSize(base64Data, MAX_IMAGE_SIZE_KB);
      const compressedSize = getBase64SizeKB(processedData);
      const savings = Math.round((1 - compressedSize / originalSize) * 100);
      console.log(`[Photo] Compressed: ${compressedSize}KB (${savings}% reduction) - ${category}`);
    } catch (err) {
      console.warn(`[Photo] Compression failed, using original - ${category}:`, err);
      processedData = base64Data;
    }
  }

  // Generate unique filename (always jpg after compression)
  const fileName = `${siteCode}/${category}/${uuidv4()}.jpg`;

  // Convert base64 to blob
  const blob = dataURLToBlob(processedData);

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error('Error uploading photo:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Uploads all photos from checklist data and returns updated data with URLs
 */
export async function uploadAllPhotos(
  data: any,
  siteCode: string
): Promise<any> {
  const updatedData = JSON.parse(JSON.stringify(data)); // Deep clone to avoid mutations

  // Helper function to upload a single photo
  const uploadSinglePhoto = async (
    photo: string | null | undefined,
    category: string
  ): Promise<string | null> => {
    if (!photo || photo.startsWith('http')) return photo || null;
    try {
      return await uploadPhoto(photo, siteCode, category);
    } catch (e) {
      console.error(`Failed to upload ${category}:`, e);
      return photo; // Return original if upload fails
    }
  };

  // Helper function to upload array of photos
  const uploadPhotoArray = async (
    photos: (string | null | undefined)[] | undefined,
    category: string
  ): Promise<(string | null)[]> => {
    if (!Array.isArray(photos)) return [];
    return Promise.all(
      photos.map((p, idx) =>
        p ? uploadSinglePhoto(p, `${category}_${idx}`) : Promise.resolve(null)
      )
    );
  };

  // Upload panoramic photo
  updatedData.fotoPanoramica = await uploadSinglePhoto(
    data.fotoPanoramica,
    'site_panoramica'
  );

  // Upload observation photos (multiple)
  updatedData.fotosObservacao = await uploadPhotoArray(
    data.fotosObservacao,
    'observacao'
  );

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

    // FCC photos
    if (gab.fcc) {
      gab.fcc.fotoPanoramica = await uploadSinglePhoto(
        gab.fcc.fotoPanoramica,
        `${prefix}_fcc_panoramica`
      );
      gab.fcc.fotoPainel = await uploadSinglePhoto(
        gab.fcc.fotoPainel,
        `${prefix}_fcc_painel`
      );
    }

    // Battery photo
    if (gab.baterias) {
      gab.baterias.fotoBanco = await uploadSinglePhoto(
        gab.baterias.fotoBanco,
        `${prefix}_bateria`
      );
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
    updatedData.energia.fotoTransformador = await uploadSinglePhoto(
      data.energia.fotoTransformador,
      'energia_transformador'
    );
    updatedData.energia.fotoQuadroGeral = await uploadSinglePhoto(
      data.energia.fotoQuadroGeral,
      'energia_quadro'
    );
  }

  // Upload tower photos
  if (data.torre?.fotoNinhos) {
    if (!updatedData.torre) {
      updatedData.torre = {};
    }
    updatedData.torre.fotoNinhos = await uploadSinglePhoto(
      data.torre.fotoNinhos,
      'torre_ninhos'
    );
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
