import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type AppRole = 'administrador' | 'gestor' | 'tecnico';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isApproved: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  isTecnico: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      return data as UserRole;
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return null;
    }
  };

  const refreshRole = async () => {
    // Get current session to ensure we have the latest user
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const role = await fetchUserRole(currentSession.user.id);
      setUserRole(role);
      setUser(currentSession.user);
      setSession(currentSession);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(async () => {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
            setIsLoading(false);
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id).then((role) => {
          setUserRole(role);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null, data: data ? { user: data.user } : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const isApproved = userRole?.approved ?? false;
  const isAdmin = userRole?.role === 'administrador' && isApproved;
  const isGestor = (userRole?.role === 'gestor' || userRole?.role === 'administrador') && isApproved;
  const isTecnico = userRole?.role === 'tecnico' && isApproved;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isApproved,
        isAdmin,
        isGestor,
        isTecnico,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
