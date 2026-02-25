/**
 * Compatibility wrapper that adapts the main project's AuthContext
 * to the Fiber Guardian auth interface.
 */
import { useAuth } from '@/contexts/AuthContext';
import { FGProfile } from '@/fiber-guardian/types/database';

export function useFGAuth() {
  const auth = useAuth();

  // Build a FGProfile-compatible object from the main auth
  const profile: FGProfile | null = auth.user
    ? {
        id: auth.user.id,
        nome: auth.user.user_metadata?.nome || auth.user.email?.split('@')[0] || '',
        email: auth.user.email || '',
        avatar_url: auth.user.user_metadata?.avatar_url,
        criado_em: auth.user.created_at,
      }
    : null;

  return {
    user: auth.user,
    session: auth.session,
    profile,
    loading: auth.isLoading,
    isAdmin: auth.isAdmin || auth.isGestor, // Gestors also act as admins in FG context
    isTecnico: auth.isTecnico,
    signIn: auth.signIn,
    signOut: auth.signOut,
  };
}
