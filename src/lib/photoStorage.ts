import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'report-photos';

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

  // Generate unique filename
  const extension = base64Data.includes('image/png') ? 'png' : 'jpg';
  const fileName = `${siteCode}/${category}/${uuidv4()}.${extension}`;

  // Convert base64 to blob
  const blob = dataURLToBlob(base64Data);

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: blob.type,
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
  const updatedData = { ...data };

  // Helper function to upload a single photo
  const uploadSinglePhoto = async (
    photo: string | null,
    category: string
  ): Promise<string | null> => {
    if (!photo || photo.startsWith('http')) return photo;
    try {
      return await uploadPhoto(photo, siteCode, category);
    } catch (e) {
      console.error(`Failed to upload ${category}:`, e);
      return photo; // Return original if upload fails
    }
  };

  // Helper function to upload array of photos
  const uploadPhotoArray = async (
    photos: (string | null)[],
    category: string
  ): Promise<(string | null)[]> => {
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

  // Upload observation photo
  updatedData.fotoObservacao = await uploadSinglePhoto(
    data.fotoObservacao,
    'observacao'
  );

  // Upload signature
  updatedData.assinaturaDigital = await uploadSinglePhoto(
    data.assinaturaDigital,
    'assinatura'
  );

  // Upload gabinete photos
  for (let i = 0; i < updatedData.gabinetes.length; i++) {
    const gab = updatedData.gabinetes[i];
    const prefix = `gabinete_${i + 1}`;

    // FCC photos
    gab.fcc.fotoPanoramica = await uploadSinglePhoto(
      gab.fcc.fotoPanoramica,
      `${prefix}_fcc_panoramica`
    );
    gab.fcc.fotoPainel = await uploadSinglePhoto(
      gab.fcc.fotoPainel,
      `${prefix}_fcc_painel`
    );

    // Battery photo
    gab.baterias.fotoBanco = await uploadSinglePhoto(
      gab.baterias.fotoBanco,
      `${prefix}_bateria`
    );

    // Climate photos
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

    // Equipment photos
    gab.fotoTransmissao = await uploadSinglePhoto(
      gab.fotoTransmissao,
      `${prefix}_transmissao`
    );
    gab.fotoAcesso = await uploadSinglePhoto(
      gab.fotoAcesso,
      `${prefix}_acesso`
    );
  }

  // Upload fiber photos
  updatedData.fibra.fotoGeralAbordagens = await uploadSinglePhoto(
    data.fibra.fotoGeralAbordagens,
    'fibra_geral'
  );
  updatedData.fibra.fotoObservacoesDGOs = await uploadSinglePhoto(
    data.fibra.fotoObservacoesDGOs,
    'fibra_obs_dgo'
  );

  // Abordagem photos
  if (data.fibra.abordagem1?.fotoCaixasSubterraneas) {
    updatedData.fibra.abordagem1.fotoCaixasSubterraneas = await uploadPhotoArray(
      data.fibra.abordagem1.fotoCaixasSubterraneas,
      'fibra_abord1_caixa'
    );
  }
  if (data.fibra.abordagem1?.fotoSubidaLateral) {
    updatedData.fibra.abordagem1.fotoSubidaLateral = await uploadPhotoArray(
      data.fibra.abordagem1.fotoSubidaLateral,
      'fibra_abord1_subida'
    );
  }

  if (data.fibra.abordagem2?.fotoCaixasSubterraneas) {
    updatedData.fibra.abordagem2.fotoCaixasSubterraneas = await uploadPhotoArray(
      data.fibra.abordagem2.fotoCaixasSubterraneas,
      'fibra_abord2_caixa'
    );
  }
  if (data.fibra.abordagem2?.fotoSubidaLateral) {
    updatedData.fibra.abordagem2.fotoSubidaLateral = await uploadPhotoArray(
      data.fibra.abordagem2.fotoSubidaLateral,
      'fibra_abord2_subida'
    );
  }

  // Caixas de passagem
  if (data.fibra.fotosCaixasPassagem) {
    updatedData.fibra.fotosCaixasPassagem = await uploadPhotoArray(
      data.fibra.fotosCaixasPassagem,
      'fibra_caixa_passagem'
    );
  }

  // DGO photos
  for (let i = 0; i < updatedData.fibra.dgos.length; i++) {
    const dgo = updatedData.fibra.dgos[i];
    dgo.fotoExterno = await uploadSinglePhoto(
      dgo.fotoExterno,
      `dgo_${i + 1}_externo`
    );
    dgo.fotoCordoes = await uploadSinglePhoto(
      dgo.fotoCordoes,
      `dgo_${i + 1}_cordoes`
    );
  }

  // Energy photos
  updatedData.energia.fotoTransformador = await uploadSinglePhoto(
    data.energia.fotoTransformador,
    'energia_transformador'
  );
  updatedData.energia.fotoQuadroGeral = await uploadSinglePhoto(
    data.energia.fotoQuadroGeral,
    'energia_quadro'
  );
  updatedData.energia.fotoPlaca = await uploadSinglePhoto(
    data.energia.fotoPlaca,
    'energia_placa'
  );
  if (data.energia.cabos) {
    updatedData.energia.cabos.fotoCabos = await uploadSinglePhoto(
      data.energia.cabos.fotoCabos,
      'energia_cabos'
    );
  }

  // Tower photos
  if (data.torre?.fotoNinhos) {
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
