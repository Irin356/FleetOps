import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null; user: User | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const authError = urlParams.get('error_description') || hashParams.get('error_description');
    if (authError) {
      setError(authError.replace(/\+/g, ' '));
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Check existing active session
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes (token refresh, sign in, sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase credentials not configured' } as AuthError };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
      setSession(data.session);
    }
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError(null);
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase credentials not configured' } as AuthError, user: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    }
    return { error, user: data.user };
  };

  const signInWithGoogle = async () => {
    setError(null);
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase credentials not configured' } as AuthError };
    }

    try {
      const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          apikey: supabaseAnonKey,
        },
      });

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        const googleEnabled = Array.isArray(settings.external)
          ? settings.external.includes('google')
          : typeof settings.external?.google === 'boolean'
            ? settings.external.google
            : settings.external?.google?.enabled === true;

        if (googleEnabled === false || (settings.external && typeof settings.external === 'object' && !Array.isArray(settings.external) && !Object.prototype.hasOwnProperty.call(settings.external, 'google'))) {
          const friendlyMessage = 'Google sign-in is not enabled in this Supabase project. Enable Google under Authentication → Providers and configure its OAuth credentials.';
          setError(friendlyMessage);
          return { error: { message: friendlyMessage } as AuthError };
        }
      }
    } catch {
      // If the settings endpoint is unreachable, let Supabase OAuth handle it normally.
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      const providerDisabled = /provider.*(not enabled|unsupported)|unsupported provider|validation_failed/i.test(error.message);
      const friendlyMessage = providerDisabled
        ? 'Google sign-in is not configured in this Supabase project. Enable Google under Authentication → Providers, then add Google OAuth credentials and the FleetOps redirect URL.'
        : error.message;
      setError(friendlyMessage);
      return { error: { ...error, message: friendlyMessage } as AuthError };
    }
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
