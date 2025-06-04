-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT CHECK (interval IN ('month', 'year')) DEFAULT 'month',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create frontend admins table
CREATE TABLE IF NOT EXISTS frontend_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('ui_admin', 'content_manager', 'support_admin')) NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, currency, interval, features) VALUES
('Basic', 'Essential features for individuals', 9.99, 'USD', 'month', '["Basic Dashboard", "Email Support", "5 Projects"]'),
('Pro', 'Advanced features for professionals', 29.99, 'USD', 'month', '["Advanced Dashboard", "Priority Support", "Unlimited Projects", "Analytics"]'),
('Enterprise', 'Full features for teams', 99.99, 'USD', 'month', '["Enterprise Dashboard", "24/7 Support", "Unlimited Everything", "Custom Integrations"]')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS frontend_admins_user_id_idx ON frontend_admins(user_id);
CREATE INDEX IF NOT EXISTS frontend_admins_role_idx ON frontend_admins(role);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frontend_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage frontend admins" ON frontend_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );
