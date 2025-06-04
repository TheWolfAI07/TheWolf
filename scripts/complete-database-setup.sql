-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  security_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS wolf_projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS wolf_team_members (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES wolf_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create wolf_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS wolf_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_wolf_projects_owner_id ON wolf_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_wolf_team_members_project_id ON wolf_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_wolf_team_members_user_id ON wolf_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wolf_activities_user_id ON wolf_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_wolf_activities_entity ON wolf_activities(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for wolf_projects
DROP POLICY IF EXISTS "Users can view their own projects" ON wolf_projects;
CREATE POLICY "Users can view their own projects" ON wolf_projects
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid() IN (
      SELECT user_id FROM wolf_team_members WHERE project_id = wolf_projects.id
    )
  );

DROP POLICY IF EXISTS "Users can update their own projects" ON wolf_projects;
CREATE POLICY "Users can update their own projects" ON wolf_projects
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON wolf_projects;
CREATE POLICY "Users can insert their own projects" ON wolf_projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON wolf_projects;
CREATE POLICY "Users can delete their own projects" ON wolf_projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for wolf_team_members
DROP POLICY IF EXISTS "Users can view team members of their projects" ON wolf_team_members;
CREATE POLICY "Users can view team members of their projects" ON wolf_team_members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM wolf_projects WHERE id = project_id
    ) OR
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Project owners can manage team members" ON wolf_team_members;
CREATE POLICY "Project owners can manage team members" ON wolf_team_members
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM wolf_projects WHERE id = project_id
    )
  );

-- Create RLS policies for wolf_activities
DROP POLICY IF EXISTS "Users can view activities for their projects" ON wolf_activities;
CREATE POLICY "Users can view activities for their projects" ON wolf_activities
  FOR SELECT USING (
    auth.uid() = user_id OR
    (entity_type = 'project' AND entity_id::bigint IN (
      SELECT id FROM wolf_projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM wolf_team_members WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert their own activities" ON wolf_activities;
CREATE POLICY "Users can insert their own activities" ON wolf_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for documents
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create function for document similarity search
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_input uuid
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
    AND user_id = user_id_input
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Create function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
