// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "report-photos";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Extract storage path from any supabase storage URL variant, or return null
function extractPath(value: string): string | null {
  const m = value.match(/\/storage\/v1\/object\/(?:public|sign)\/report-photos\/([^?"]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

async function signPath(path: string): Promise<string | null> {
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

// Rewrite a single value: string, JSON-array string, or JSON of objects with .url
async function rewriteValue(val: any): Promise<{ changed: boolean; value: any }> {
  if (val == null) return { changed: false, value: val };

  if (typeof val === "string") {
    // Try to parse JSON arrays
    const trimmed = val.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const res = await rewriteValue(parsed);
        return res.changed
          ? { changed: true, value: JSON.stringify(res.value) }
          : { changed: false, value: val };
      } catch {
        // fall through as plain string
      }
    }
    // Only re-sign public/ URLs (signed URLs are already 10y valid)
    if (!val.includes("/object/public/report-photos/")) {
      return { changed: false, value: val };
    }
    const path = extractPath(val);
    if (!path) return { changed: false, value: val };
    const signed = await signPath(path);
    if (!signed) return { changed: false, value: val };
    return { changed: true, value: signed };
  }

  if (Array.isArray(val)) {
    let changed = false;
    const out: any[] = [];
    for (const item of val) {
      const r = await rewriteValue(item);
      if (r.changed) changed = true;
      out.push(r.value);
    }
    return { changed, value: out };
  }

  if (typeof val === "object") {
    let changed = false;
    const out: Record<string, any> = { ...val };
    for (const k of Object.keys(out)) {
      const r = await rewriteValue(out[k]);
      if (r.changed) changed = true;
      out[k] = r.value;
    }
    return { changed, value: out };
  }

  return { changed: false, value: val };
}

async function getPhotoColumns(): Promise<string[]> {
  const { data, error } = await admin.rpc("exec_sql" as any, {}).catch(() => ({ data: null, error: true }));
  if (data) return data as string[];
  // Fallback hard list from information_schema via direct query
  const { data: cols, error: colErr } = await admin
    .from("information_schema_columns_view" as any)
    .select("*")
    .limit(1)
    .catch(() => ({ data: null, error: true }));
  // If neither works, use a known static regex list — but simpler: hardcode a wide net
  return HARDCODED_COLUMNS;
}

const HARDCODED_COLUMNS = [
  "energia_foto_cabos","energia_foto_placa","energia_foto_quadro_geral","energia_foto_relogio","energia_foto_transformador",
  "fibra_abord1_foto","fibra_abord2_foto","fibra_abord3_foto","fibra_abord4_foto",
  "fibra_dgo1_cordoes_foto","fibra_dgo1_foto","fibra_dgo2_cordoes_foto","fibra_dgo2_foto",
  "fibra_dgo3_cordoes_foto","fibra_dgo3_foto","fibra_dgo4_cordoes_foto","fibra_dgo4_foto",
  "fibra_foto_caixas_passagem","fibra_foto_caixas_subterraneas","fibra_foto_subidas_laterais",
  "fotos_extras","observacao_foto_url","panoramic_photo_url",
  "gmg_foto_alarme","gmg_foto_painel",
  "torre_foto_aterramento","torre_foto_esteiramento_horizontal","torre_foto_esteiramento_vertical",
  "torre_foto_fibras_protegidas","torre_foto_ninhos","torre_foto_zeladoria",
];
for (let g = 1; g <= 7; g++) {
  HARDCODED_COLUMNS.push(
    `gab${g}_bat_foto`,
    `gab${g}_clima_foto_ar1`,`gab${g}_clima_foto_ar2`,`gab${g}_clima_foto_ar3`,`gab${g}_clima_foto_ar4`,
    `gab${g}_clima_foto_condensador`,`gab${g}_clima_foto_controlador`,`gab${g}_clima_foto_evaporador`,
    `gab${g}_fcc_foto_painel`,`gab${g}_fcc_foto_panoramica`,
    `gab${g}_foto_acesso`,`gab${g}_foto_panoramica`,`gab${g}_foto_transmissao`,
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);

    const cols = HARDCODED_COLUMNS;
    const selectList = ["id", ...cols].join(",");

    const { data: rows, error } = await admin
      .from("reports")
      .select(selectList)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    let totalRewritten = 0;
    let rowsUpdated = 0;

    for (const row of rows ?? []) {
      const patch: Record<string, any> = {};
      for (const c of cols) {
        const v = (row as any)[c];
        const r = await rewriteValue(v);
        if (r.changed) {
          patch[c] = r.value;
          totalRewritten++;
        }
      }
      if (Object.keys(patch).length > 0) {
        const { error: upErr } = await admin.from("reports").update(patch).eq("id", (row as any).id);
        if (!upErr) rowsUpdated++;
      }
    }

    return new Response(
      JSON.stringify({
        offset,
        limit,
        processed: rows?.length ?? 0,
        rowsUpdated,
        fieldsRewritten: totalRewritten,
        nextOffset: offset + (rows?.length ?? 0),
      }),
      { headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
