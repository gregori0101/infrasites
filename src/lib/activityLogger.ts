import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, any>
) {
  try {
    const { error } = await supabase.rpc("log_activity", {
      _action: action,
      _target_type: targetType,
      _target_id: targetId || null,
      _details: details || {},
    });
    if (error) {
      console.error("[ActivityLogger] Error logging activity:", error);
    }
  } catch (err) {
    console.error("[ActivityLogger] Unexpected error:", err);
  }
}
