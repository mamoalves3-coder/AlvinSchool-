import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clspweibsxnemsotqxwv.supabase.co';
const supabaseKey = 'sb_publishable_dELN_Byn9f8EeBbGS9Ge5Q_TsNLkrmK';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  status: 'pendente' | 'pago';
  phone: string;
};

export type ExamResult = {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  passed: boolean;
  created_at: string;
  profiles?: { name: string; email: string }; // Joined data
  courses?: { title: string }; // Joined data
};

export type Ebook = {
  id: string;
  title: string;
  description?: string;
  price: number;
  cover_url: string;
  active: boolean;
  created_at: string;
};

export type AppSetting = {
  key: string;
  value: string;
};
