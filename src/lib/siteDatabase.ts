import { supabase } from "@/integrations/supabase/client";

export interface Site {
  id: string;
  site_code: string;
  uf: string;
  tipo: string;
  municipio: string | null;
  created_at: string;
  created_by: string | null;
}

export interface SiteInsert {
  site_code: string;
  uf: string;
  tipo: string;
  municipio?: string;
}

export async function fetchSites(): Promise<Site[]> {
  const allSites: Site[] = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  // Fetch all sites using pagination (Supabase has 1000 row limit per query)
  while (hasMore) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('site_code', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }

    if (data && data.length > 0) {
      allSites.push(...data);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allSites;
}

export async function fetchSiteByCode(siteCode: string): Promise<Site | null> {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('site_code', siteCode)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching site:', error);
    throw error;
  }

  return data;
}

export async function insertSites(sites: SiteInsert[]): Promise<{ inserted: number; duplicates: number }> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  let inserted = 0;
  let duplicates = 0;

  // Prepare all sites with user ID and deduplicate by site_code (keep last occurrence)
  const sitesMap = new Map<string, typeof sites[0]>();
  sites.forEach(site => {
    sitesMap.set(site.site_code.toUpperCase().trim(), site);
  });

  const preparedSites = Array.from(sitesMap.values()).map(site => ({
    site_code: site.site_code.toUpperCase().trim(),
    uf: site.uf.toUpperCase().trim(),
    tipo: site.tipo.trim(),
    municipio: site.municipio?.trim() || null,
    created_by: user.user!.id
  }));

  // Insert in batches of 500 to avoid timeout (Supabase recommends <= 1000 per batch)
  const batchSize = 500;
  
  for (let i = 0; i < preparedSites.length; i += batchSize) {
    const batch = preparedSites.slice(i, i + batchSize);
    
    // Use upsert to update existing sites and insert new ones
    const { data, error } = await supabase
      .from('sites')
      .upsert(batch, { 
        onConflict: 'site_code',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error inserting sites batch:', error);
      throw error;
    }

    // Count actually inserted (returned rows = inserted, not duplicates)
    inserted += data?.length || 0;
  }

  // Calculate duplicates (total submitted - actually inserted)
  duplicates = sites.length - inserted;

  return { inserted, duplicates };
}

export async function deleteSite(siteId: string): Promise<void> {
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', siteId);

  if (error) {
    console.error('Error deleting site:', error);
    throw error;
  }
}

export async function updateSite(siteId: string, updates: Partial<SiteInsert>): Promise<void> {
  const { error } = await supabase
    .from('sites')
    .update(updates)
    .eq('id', siteId);

  if (error) {
    console.error('Error updating site:', error);
    throw error;
  }
}
