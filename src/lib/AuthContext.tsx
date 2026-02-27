import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Profile } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  trialActive: boolean;
  trialDaysLeft: number;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    trialActive: false,
    trialDaysLeft: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user).then((profile) => {
          setState(buildState(session, profile));
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const profile = await fetchProfile(session.user);
          setState(buildState(session, profile));
        } else {
          setState({
            session: null,
            user: null,
            profile: null,
            loading: false,
            trialActive: false,
            trialDaysLeft: 0,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(user: User): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data;
  }

  function buildState(session: Session, profile: Profile | null): AuthState {
    const now = new Date();
    const trialEnd = profile ? new Date(profile.trial_ends_at) : now;
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const trialActive = profile ? (profile.is_subscribed || daysLeft > 0) : false;

    return {
      session,
      user: session.user,
      profile,
      loading: false,
      trialActive,
      trialDaysLeft: daysLeft,
    };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (state.user) {
      const profile = await fetchProfile(state.user);
      setState((s) => buildState(s.session!, profile));
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
