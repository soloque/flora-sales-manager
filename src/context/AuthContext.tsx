
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateAndCleanDatabase } from '@/utils/databaseValidation';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Create a basic user object if profile doesn't exist
        return {
          id: supabaseUser.id,
          name: supabaseUser.email || '',
          email: supabaseUser.email || '',
          role: 'seller' as UserRole,
          createdAt: new Date(),
        };
      }

      return {
        id: profile.id,
        name: profile.name || supabaseUser.email || '',
        email: profile.email || supabaseUser.email || '',
        role: (profile.role as UserRole) || 'seller',
        createdAt: new Date(profile.created_at),
        avatar_url: profile.avatar_url,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return {
        id: supabaseUser.id,
        name: supabaseUser.email || '',
        email: supabaseUser.email || '',
        role: 'seller' as UserRole,
        createdAt: new Date(),
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          try {
            const userProfile = await fetchUserProfile(session.user);
            if (mounted) {
              setUser(userProfile);
              
              // Run database validation when user logs in
              if (event === 'SIGNED_IN') {
                setTimeout(() => {
                  validateAndCleanDatabase(session.user.id);
                }, 1000);
              }
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            if (mounted) {
              setUser(null);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          try {
            const userProfile = await fetchUserProfile(session.user);
            if (mounted) {
              setUser(userProfile);
              
              // Run validation for existing session
              setTimeout(() => {
                validateAndCleanDatabase(session.user.id);
              }, 1000);
            }
          } catch (error) {
            console.error('Error fetching user profile on init:', error);
            if (mounted) {
              setUser(null);
            }
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: 'seller',
        },
      },
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, redirect to login
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const logout = signOut; // Alias for signOut

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!session && !!user,
    signOut,
    logout,
    login,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
