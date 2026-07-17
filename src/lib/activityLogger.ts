import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId || null,
      details: details || {},
    });
    if (error) {
      console.error("[ActivityLogger] Error logging activity:", error);
    }
  } catch (err) {
    console.error("[ActivityLogger] Unexpected error:", err);
  }
}
