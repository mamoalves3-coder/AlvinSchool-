-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  phone text,
  role text default 'student',
  status text default 'pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create courses table
create table if not exists public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text,
  description text,
  thumbnail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lessons table
create table if not exists public.lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses on delete cascade not null,
  title text not null,
  description text,
  video_url text,
  duration text,
  "order" integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_progress table
create table if not exists public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  lesson_id uuid references public.lessons on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- Create exam_results table
create table if not exists public.exam_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  score numeric not null,
  passed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.user_progress enable row level security;
alter table public.exam_results enable row level security;

-- Create policies
-- Profiles: Users can read their own profile. Admins can read all.
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Courses: Everyone can read courses. Only admins can insert/update/delete.
create policy "Courses are viewable by everyone." on public.courses for select using (true);
create policy "Admins can insert courses." on public.courses for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update courses." on public.courses for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete courses." on public.courses for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Lessons: Everyone can read lessons. Only admins can insert/update/delete.
create policy "Lessons are viewable by everyone." on public.lessons for select using (true);
create policy "Admins can insert lessons." on public.lessons for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update lessons." on public.lessons for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete lessons." on public.lessons for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- User Progress: Users can read/insert their own progress. Admins can read all.
create policy "Users can view own progress." on public.user_progress for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Users can insert own progress." on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress." on public.user_progress for update using (auth.uid() = user_id);

-- Exam Results: Users can read/insert their own results. Admins can read all.
create policy "Users can view own exam results." on public.exam_results for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Users can insert own exam results." on public.exam_results for insert with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, status)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'student', 'pendente');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
