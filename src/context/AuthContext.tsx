import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'student';
export type PaymentStatus = 'pendente' | 'pago';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: PaymentStatus;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string, role?: string}>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  updateUserStatus: (userId: string, status: PaymentStatus) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout de segurança para evitar loop infinito de loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Check active session immediately
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Se for o admin, podemos liberar o loading imediatamente e buscar o perfil em background
          if (session.user.email === 'mamoalves3@gmail.com') {
            setUser({
              id: session.user.id,
              name: 'Admin',
              email: session.user.email,
              phone: '',
              role: 'admin',
              status: 'pago'
            });
            setLoading(false);
            fetchProfile(session.user.id, session.user.email!).catch(console.error);
          } else {
            await fetchProfile(session.user.id, session.user.email!);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (session.user.email === 'mamoalves3@gmail.com') {
          setUser({
            id: session.user.id,
            name: 'Admin',
            email: session.user.email,
            phone: '',
            role: 'admin',
            status: 'pago'
          });
          setLoading(false);
          fetchProfile(session.user.id, session.user.email!).catch(console.error);
        } else {
          await fetchProfile(session.user.id, session.user.email!);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, let's create it
          const newProfile = {
            id: userId,
            email: email,
            name: email.split('@')[0], // Fallback name
            role: email === 'mamoalves3@gmail.com' ? 'admin' : 'student',
            status: 'pendente',
            phone: ''
          };
          
          const { data: createdData, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }
          
          const userData = {
            id: createdData.id,
            name: createdData.name,
            email: createdData.email,
            phone: createdData.phone,
            role: createdData.role as UserRole,
            status: createdData.status as PaymentStatus
          };
          setUser(userData);
          return userData;
        }
        console.error('Error fetching profile:', error);
        return null;
      } else if (data) {
        // Check if it's the admin email and ensure role is admin
        if (email === 'mamoalves3@gmail.com' && data.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
          data.role = 'admin';
        }

        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role as UserRole,
          status: data.status as PaymentStatus
        };
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{success: boolean, error?: string, role?: string}> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Redirecionamento forçado imediato para o admin sem esperar o fetchProfile
        if (email === 'mamoalves3@gmail.com') {
          // Inicia a busca do perfil em background para atualizar o estado local
          fetchProfile(data.user.id, data.user.email!).catch(console.error);
          return { success: true, role: 'admin' };
        }
        
        const profile = await fetchProfile(data.user.id, data.user.email!);
        return { success: true, role: profile?.role };
      }
      return { success: false, error: 'Erro desconhecido ao fazer login.' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Erro ao fazer login.' };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string): Promise<{success: boolean, error?: string}> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'Erro ao registar.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUserStatus = async (userId: string, status: PaymentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state if it's the current user
      if (user && user.id === userId) {
        setUser({ ...user, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        role: p.role as UserRole,
        status: p.status as PaymentStatus
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserStatus, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
