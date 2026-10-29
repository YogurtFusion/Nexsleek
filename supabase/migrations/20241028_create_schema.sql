-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create my_list table
CREATE TABLE IF NOT EXISTS my_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- Create watch_progress table
CREATE TABLE IF NOT EXISTS watch_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  video_id TEXT NOT NULL,
  seconds_watched INTEGER DEFAULT 0,
  duration INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  stream_url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('tmdb', 'youtube', 'self-hosted')),
  is_public_domain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- My list policies
CREATE POLICY "Users can view own my_list"
  ON my_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own my_list"
  ON my_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own my_list"
  ON my_list FOR DELETE
  USING (auth.uid() = user_id);

-- Watch progress policies
CREATE POLICY "Users can view own watch_progress"
  ON watch_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch_progress"
  ON watch_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch_progress"
  ON watch_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Videos policies (public read)
CREATE POLICY "Everyone can view videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = auth.uid());

CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  USING (auth.uid() IS NOT NULL);
