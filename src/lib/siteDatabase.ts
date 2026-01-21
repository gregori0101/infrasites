import { supabase } from "@/integrations/supabase/client";

export interface Site {
  id: string;
  site_code: string;
  uf: string;
  tipo: string;
  created_at: string;
  created_by: string | null;
}

export interface SiteInsert {
  site_code: string;
  uf: string;
  tipo: string;
}

export async function fetchSites(): Promise<Site[]> {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('site_code', { ascending: true });

  if (error) {
    console.error('Error fetching sites:', error);
    throw error;
  }

  return data || [];
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

  for (const site of sites) {
    const { error } = await supabase
      .from('sites')
      .insert({
        site_code: site.site_code.toUpperCase().trim(),
        uf: site.uf.toUpperCase().trim(),
        tipo: site.tipo.trim(),
        created_by: user.user.id
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        duplicates++;
      } else {
        console.error('Error inserting site:', error);
        throw error;
      }
    } else {
      inserted++;
    }
  }

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
