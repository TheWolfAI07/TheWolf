-- Complete Admin System Setup
-- This script creates all necessary tables and functions for the admin system

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
    permissions JSONB DEFAULT '{}',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_reports table
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS admin_roles_user_id_idx ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS admin_roles_role_idx ON admin_roles(role);
CREATE INDEX IF NOT EXISTS admin_activity_logs_admin_id_idx ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_activity_logs_action_idx ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS admin_activity_logs_created_at_idx ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS system_settings_key_idx ON system_settings(key);
CREATE INDEX IF NOT EXISTS user_reports_status_idx ON user_reports(status);
CREATE INDEX IF NOT EXISTS user_reports_reported_user_id_idx ON user_reports(reported_user_id);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('platform_name', '"Wolf Platform"', 'Platform name', 'branding', true),
('platform_version', '"1.0.0"', 'Current platform version', 'system', true),
('maintenance_mode', 'false', 'Maintenance mode status', 'system', false),
('user_registration_enabled', 'true', 'Allow new user registrations', 'auth', false),
('max_users_per_day', '1000', 'Maximum new users per day', 'limits', false),
('api_rate_limit', '100', 'API requests per minute per user', 'limits', false)
ON CONFLICT (key) DO NOTHING;

-- Create RLS policies
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Admin roles policies
CREATE POLICY "Admin roles viewable by admins" ON admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role IN ('super_admin', 'admin', 'moderator')
        )
    );

CREATE POLICY "Admin roles manageable by super_admin" ON admin_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role = 'super_admin'
        )
    );

-- Activity logs policies
CREATE POLICY "Activity logs viewable by admins" ON admin_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role IN ('super_admin', 'admin', 'moderator')
        )
    );

CREATE POLICY "Activity logs insertable by admins" ON admin_activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role IN ('super_admin', 'admin', 'moderator')
        )
    );

-- System settings policies
CREATE POLICY "System settings viewable by admins" ON system_settings
    FOR SELECT USING (
        is_public = true OR
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role IN ('super_admin', 'admin', 'moderator')
        )
    );

CREATE POLICY "System settings manageable by super_admin" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role = 'super_admin'
        )
    );

-- User reports policies
CREATE POLICY "User reports viewable by admins" ON user_reports
    FOR SELECT USING (
        reporter_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role IN ('super_admin', 'admin', 'moderator')
        )
    );

CREATE POLICY "User reports manageable by admins" ON user_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar 
            WHERE ar.user_id = auth.uid() 
            AND ar.role IN ('super_admin', 'admin', 'moderator')
        )
    );

-- Create function to automatically grant super_admin to first user
CREATE OR REPLACE FUNCTION grant_first_super_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user and no super_admin exists
    IF NOT EXISTS (SELECT 1 FROM admin_roles WHERE role = 'super_admin') THEN
        INSERT INTO admin_roles (user_id, role, granted_by, permissions)
        VALUES (NEW.id, 'super_admin', NEW.id, '{"all": true}');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for first user
DROP TRIGGER IF EXISTS grant_first_super_admin_trigger ON auth.users;
CREATE TRIGGER grant_first_super_admin_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION grant_first_super_admin();

-- Create function to check admin status
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_roles 
        WHERE admin_roles.user_id = is_admin.user_id 
        AND role IN ('super_admin', 'admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION get_admin_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM admin_roles 
    WHERE admin_roles.user_id = get_admin_role.user_id;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Log setup completion
INSERT INTO admin_activity_logs (admin_id, action, details, success)
SELECT 
    auth.uid(),
    'admin_system_setup',
    '{"message": "Admin system setup completed", "timestamp": "' || NOW() || '"}',
    true
WHERE auth.uid() IS NOT NULL;

SELECT 'Admin system setup completed successfully!' as result;
