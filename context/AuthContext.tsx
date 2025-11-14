import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
// FIX: Removed `UserCredentials` as it is deprecated and no longer exported from `supabase-js`.
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import * as api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  alert: { message: string; type: 'success' | 'error' } | null;
  setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
  databaseError: any;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (params: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User & { first_name?: string; last_name?: string; birth_date?: string; avatar_url?: string }>) => Promise<void>;
  updateAuthUser: (credentials: { email?: string; password?: string; }) => Promise<{ error: any; }>;
  resetPassword: (email: string) => Promise<{ error: any; }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [databaseError, setDatabaseError] = useState<any>(false);
  
  const getProfile = useCallback(async (user: SupabaseUser) => {
    const retries = 6;
    const initialDelay = 350;

    for (let i = 0; i < retries; i++) {
      const profile = await api.fetchUserProfile(user.id);
      
      if (profile) {
        return profile; // Return profile directly, state will be set in the effect
      }
      
      if (i < retries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Profil tidak ditemukan, mencoba lagi dalam ${delay}ms... (Percobaan ${i + 2}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.warn(`Gagal mengambil profil untuk pengguna ${user.id}. Mencoba membuat profil darurat...`);
    try {
        const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            first_name: user.user_metadata?.first_name || 'Pengguna',
            last_name: user.user_metadata?.last_name || 'Baru',
            phone: user.user_metadata?.phone || user.phone,
        });

        if (insertError && insertError.code !== '23505') { // 23505 = unique_violation
            console.error('Gagal membuat profil darurat:', insertError);
            return null;
        }

        const finalProfile = await api.fetchUserProfile(user.id);
        if (finalProfile) {
            console.log("Profil darurat berhasil dibuat/diambil.");
            return finalProfile;
        }
    } catch (e) {
        console.error("Error saat mencoba membuat profil darurat:", e);
    }

    console.error(`Gagal mengambil atau membuat profil untuk pengguna ${user.id}.`);
    return null;
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // FIX: The early return for 'TOKEN_REFRESHED' could cause the app to get stuck
        // on the initial loading screen if the token was refreshed before the initial
        // session processing was complete. Removing this special case ensures that
        // setLoading(false) is always reached, fixing the freeze. While this might
        // cause a harmless re-fetch of the profile on token refresh, it's safer
        // than a frozen app.
        
        setDatabaseError(null);
        setSession(session);
        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          try {
            const profile = await getProfile(user);
            if (!profile) {
              // This indicates a critical failure in getProfile after all retries.
              throw new Error('Gagal memuat profil pengguna. Hubungi dukungan.');
            }
            setUserProfile(profile);
          } catch (e: any) {
            console.error("Critical error during auth state change:", e);
            setDatabaseError(e);
            // FIX (v2): Aggressive manual state clearing is removed.
            // The App component will now handle displaying an error screen
            // based on the `databaseError` state, while preserving the session.
            // This allows the user to manually log out instead of being forced out
            // on a temporary network error.
          }
        } else {
          // This handles SIGNED_OUT or an invalid initial session
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    // Initial loading state when app boots
    // The first `onAuthStateChange` event (INITIAL_SESSION) will set loading to false.
    setLoading(true);

    return () => {
      subscription.unsubscribe();
    };
  }, [getProfile]);


  const login = async (email: string, pass: string) => {
    // Let onAuthStateChange handle loading state
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signUp = async ({ firstName, lastName, email, phone, password }: any) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        },
      }
    });
    // setLoading is handled by onAuthStateChange after verification
    if (error) setLoading(false);
    return { error };
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    return { error };
  };

  const logout = async () => {
    setSession(null);
    setUser(null);
    setUserProfile(null);
    setDatabaseError(false);
  
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during sign out:", error.message);
    }
  };

  const updateProfile = async (updates: Partial<User & { first_name?: string; last_name?: string; birth_date?: string; avatar_url?: string }>) => {
    if (user) {
        await api.updateUserProfile(user.id, updates);
        // Re-fetch profile to update state across the app
        const updatedProfile = await getProfile(user);
        if (updatedProfile) {
            setUserProfile(updatedProfile);
        }
    }
  };
  
  const updateAuthUser = async (credentials: { email?: string; password?: string; }) => {
    const { data, error } = await supabase.auth.updateUser(credentials);
    return { error };
  }

  const value = {
    session,
    user,
    userProfile,
    loading,
    alert,
    setAlert,
    databaseError,
    login,
    signUp,
    logout,
    updateProfile,
    updateAuthUser,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
