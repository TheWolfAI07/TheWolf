-- Wolf Platform Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_projects table
CREATE TABLE IF NOT EXISTS wolf_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'archived')),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_analytics table
CREATE TABLE IF NOT EXISTS wolf_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  category TEXT DEFAULT 'general',
  comparison_value NUMERIC,
  comparison_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_activities table
CREATE TABLE IF NOT EXISTS wolf_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_settings table
CREATE TABLE IF NOT EXISTS wolf_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_chat_messages table
CREATE TABLE IF NOT EXISTS wolf_chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message TEXT NOT NULL,
  response TEXT,
  type TEXT DEFAULT 'user' CHECK (type IN ('user', 'ai', 'system')),
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wolf_function_logs table
CREATE TABLE IF NOT EXISTS wolf_function_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  function_id TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT false,
  result JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_wolf_projects_owner_id ON wolf_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_wolf_projects_status ON wolf_projects(status);
CREATE INDEX IF NOT EXISTS idx_wolf_activities_user_id ON wolf_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_wolf_activities_created_at ON wolf_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_wolf_analytics_metric_name ON wolf_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_wolf_analytics_created_at ON wolf_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_wolf_chat_messages_created_at ON wolf_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_wolf_function_logs_function_id ON wolf_function_logs(function_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wolf_projects_updated_at BEFORE UPDATE ON wolf_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wolf_settings_updated_at BEFORE UPDATE ON wolf_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
INSERT INTO users (username, email, status) VALUES
  ('demo_user', 'demo@wolf.com', 'active'),
  ('test_user', 'test@wolf.com', 'active'),
  ('admin_user', 'admin@wolf.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- Get the demo user ID for foreign key references
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  SELECT id INTO demo_user_id FROM users WHERE email = 'demo@wolf.com' LIMIT 1;
  
  IF demo_user_id IS NOT NULL THEN
    -- Insert demo projects
    INSERT INTO wolf_projects (name, description, status, owner_id) VALUES
      ('Demo Project', 'A demo project for testing', 'active', demo_user_id),
      ('Test Project', 'A test project for development', 'active', demo_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Insert demo activities
    INSERT INTO wolf_activities (user_id, action, details) VALUES
      (demo_user_id, 'login', '{"ip": "127.0.0.1"}'),
      (demo_user_id, 'create_project', '{"project_name": "Demo Project"}')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert demo analytics
INSERT INTO wolf_analytics (metric_name, metric_value, category) VALUES
  ('users', 3, 'system'),
  ('projects', 2, 'system'),
  ('active_sessions', 1, 'system')
ON CONFLICT DO NOTHING;

-- Insert demo settings
INSERT INTO wolf_settings (key, value) VALUES
  ('theme', '"dark"'),
  ('notifications', 'true'),
  ('auto_save', 'true')
ON CONFLICT (key) DO NOTHING;

-- Create RLS policies (optional, for security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_activities ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your auth setup)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can view all projects" ON wolf_projects FOR SELECT USING (true);
CREATE POLICY "Users can view all activities" ON wolf_activities FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Wolf Platform database setup completed successfully!' as message;
