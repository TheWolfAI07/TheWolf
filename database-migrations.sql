-- Additional tables for enhanced functionality

-- Chat messages table
CREATE TABLE IF NOT EXISTS wolf_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  response TEXT,
  type VARCHAR(20) DEFAULT 'user',
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function execution logs
CREATE TABLE IF NOT EXISTS wolf_function_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  result JSONB,
  error TEXT,
  execution_time INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System metrics table
CREATE TABLE IF NOT EXISTS wolf_system_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  metric_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON wolf_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_function_logs_executed_at ON wolf_function_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON wolf_system_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON wolf_api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON wolf_api_logs(endpoint);

-- RLS Policies
ALTER TABLE wolf_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_function_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wolf_api_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own data
CREATE POLICY "Users can view chat messages" ON wolf_chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert chat messages" ON wolf_chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view function logs" ON wolf_function_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert function logs" ON wolf_function_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view system metrics" ON wolf_system_metrics FOR SELECT USING (true);
CREATE POLICY "Users can insert system metrics" ON wolf_system_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view API logs" ON wolf_api_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert API logs" ON wolf_api_logs FOR INSERT WITH CHECK (true);

-- Function to clean up old logs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Delete chat messages older than 30 days
  DELETE FROM wolf_chat_messages WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete function logs older than 7 days
  DELETE FROM wolf_function_logs WHERE executed_at < NOW() - INTERVAL '7 days';
  
  -- Delete system metrics older than 30 days
  DELETE FROM wolf_system_metrics WHERE recorded_at < NOW() - INTERVAL '30 days';
  
  -- Delete API logs older than 7 days
  DELETE FROM wolf_api_logs WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
