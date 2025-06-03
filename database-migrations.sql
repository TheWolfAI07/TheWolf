-- Updated database schema with correct column names

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS wolf_analytics CASCADE;
DROP TABLE IF EXISTS wolf_activities CASCADE;
DROP TABLE IF EXISTS wolf_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS wolf_projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  owner_id UUID REFERENCES users(id),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table with correct column names
CREATE TABLE IF NOT EXISTS wolf_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  category TEXT DEFAULT 'general',
  comparison_value NUMERIC,
  comparison_label TEXT,
  trend TEXT DEFAULT 'stable',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS wolf_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS wolf_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS wolf_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  response TEXT,
  type VARCHAR(20) DEFAULT 'user',
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function execution logs
CREATE TABLE IF NOT EXISTS wolf_function_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_id VARCHAR(100) NOT NULL,
  function_name TEXT,
  status VARCHAR(20) NOT NULL,
  result JSONB,
  error TEXT,
  execution_time INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System metrics table
CREATE TABLE IF NOT EXISTS wolf_system_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  metric_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API request logs
CREATE TABLE IF NOT EXISTS wolf_api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint VARCHAR(200) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo data
INSERT INTO users (username, email, status, role, last_login) VALUES
('wolf_admin', 'admin@wolf.com', 'active', 'admin', NOW()),
('demo_user', 'demo@wolf.com', 'active', 'user', NOW()),
('test_developer', 'dev@wolf.com', 'active', 'developer', NOW()),
('project_manager', 'pm@wolf.com', 'active', 'manager', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert demo projects
INSERT INTO wolf_projects (name, description, status, priority, owner_id, progress) 
SELECT 
  'Wolf Platform Core',
  'Main platform development and maintenance',
  'active',
  'high',
  u.id,
  85
FROM users u WHERE u.email = 'admin@wolf.com'
ON CONFLICT DO NOTHING;

INSERT INTO wolf_projects (name, description, status, priority, owner_id, progress) 
SELECT 
  'API Documentation',
  'Comprehensive API documentation and examples',
  'active',
  'medium',
  u.id,
  60
FROM users u WHERE u.email = 'demo@wolf.com'
ON CONFLICT DO NOTHING;

INSERT INTO wolf_projects (name, description, status, priority, owner_id, progress) 
SELECT 
  'User Dashboard',
  'Enhanced user dashboard with analytics',
  'active',
  'high',
  u.id,
  90
FROM users u WHERE u.email = 'admin@wolf.com'
ON CONFLICT DO NOTHING;

-- Insert analytics data
INSERT INTO wolf_analytics (metric_name, metric_value, category, comparison_value, comparison_label, trend) VALUES
('total_users', 4, 'users', 2, 'vs last week', 'up'),
('active_projects', 3, 'projects', 1, 'vs last week', 'up'),
('api_requests', 1250, 'api', 800, 'vs yesterday', 'up'),
('revenue', 45230, 'financial', 38900, 'vs last month', 'up'),
('growth_rate', 12.5, 'growth', 8.3, 'vs last quarter', 'up')
ON CONFLICT DO NOTHING;

-- Insert activities
INSERT INTO wolf_activities (user_id, action, details, ip_address) 
SELECT 
  u.id,
  'platform_deployment',
  '{"status": "success", "timestamp": "' || NOW() || '"}',
  '127.0.0.1'
FROM users u WHERE u.email = 'admin@wolf.com'
ON CONFLICT DO NOTHING;

INSERT INTO wolf_activities (user_id, action, details, ip_address) 
SELECT 
  u.id,
  'database_initialization',
  '{"tables_created": 7, "demo_data": true}',
  '127.0.0.1'
FROM users u WHERE u.email = 'admin@wolf.com'
ON CONFLICT DO NOTHING;

-- Insert settings
INSERT INTO wolf_settings (key, value, description, category) VALUES
('platform_status', '"live"', 'Current platform operational status', 'system'),
('theme', '"dark"', 'Default UI theme', 'ui'),
('notifications_enabled', 'true', 'Enable system notifications', 'notifications')
ON CONFLICT (key) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON wolf_analytics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON wolf_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON wolf_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON wolf_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_function_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for demo)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON wolf_projects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON wolf_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON wolf_activities FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON wolf_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON wolf_chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON wolf_function_logs FOR ALL USING (true);
