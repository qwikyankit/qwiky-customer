/*
  # Loyalty and Offers System

  1. New Tables
    - `loyalty_offers` - Common offers and promotions
    - `user_offers` - User-specific offers and referrals
    - `referrals` - Referral tracking system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Features
    - Referral system with ₹100 discount
    - Common promotional offers
    - User-specific targeted offers
    - Offer usage tracking
*/

-- Loyalty offers table (common offers)
CREATE TABLE IF NOT EXISTS loyalty_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  offer_type text NOT NULL CHECK (offer_type IN ('discount', 'cashback', 'free_service', 'referral')),
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10, 2),
  min_order_amount decimal(10, 2) DEFAULT 0,
  max_discount_amount decimal(10, 2),
  promo_code text UNIQUE,
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  terms_conditions text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User offers table (user-specific offers)
CREATE TABLE IF NOT EXISTS user_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  loyalty_offer_id uuid REFERENCES loyalty_offers(id),
  title text NOT NULL,
  description text NOT NULL,
  offer_type text NOT NULL CHECK (offer_type IN ('discount', 'cashback', 'free_service', 'referral')),
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10, 2),
  min_order_amount decimal(10, 2) DEFAULT 0,
  max_discount_amount decimal(10, 2),
  promo_code text,
  is_used boolean DEFAULT false,
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  used_at timestamptz,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_amount decimal(10, 2) DEFAULT 100.00,
  reward_given boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referee_id)
);

-- Enable Row Level Security
ALTER TABLE loyalty_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_offers (public read for active offers)
CREATE POLICY "Anyone can read active loyalty offers"
  ON loyalty_offers
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- RLS Policies for user_offers
CREATE POLICY "Users can read own offers"
  ON user_offers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own offers"
  ON user_offers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for referrals
CREATE POLICY "Users can read own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- Insert sample loyalty offers
INSERT INTO loyalty_offers (title, description, offer_type, discount_type, discount_value, min_order_amount, max_discount_amount, promo_code, usage_limit, terms_conditions) VALUES
('FREE Service', 'Use code FREE on your next booking for 1 hour of FREE service', 'free_service', 'fixed', 99.00, 0, NULL, 'FREE', 1000, ARRAY['Valid for new users only', 'Cannot be combined with other offers', 'Valid for 30 days from signup']),
('Save ₹25 on this booking!', 'Use code TRYNEW & get ₹15 off on this booking', 'discount', 'fixed', 25.00, 100.00, 25.00, 'SPECIALS', 500, ARRAY['Valid on minimum order of ₹100', 'Valid for limited time', 'Cannot be combined with other offers']),
('Referral Bonus', 'Refer a friend and get ₹100 discount on your next booking', 'referral', 'fixed', 100.00, 0, 100.00, NULL, NULL, ARRAY['Friend must complete their first booking', 'Discount valid for 90 days', 'No limit on referrals']);

-- Insert sample user offers (these would be created dynamically)
-- This is just for testing purposes
INSERT INTO user_offers (user_id, title, description, offer_type, discount_type, discount_value, min_order_amount, promo_code, valid_until) 
SELECT 
  id as user_id,
  'Welcome Offer',
  'Get ₹50 off on your first booking',
  'discount',
  'fixed',
  50.00,
  99.00,
  'WELCOME50',
  now() + interval '30 days'
FROM users 
LIMIT 1;

-- Function to create referral offer for user
CREATE OR REPLACE FUNCTION create_referral_offer(referrer_user_id uuid)
RETURNS uuid AS $$
DECLARE
  offer_id uuid;
BEGIN
  INSERT INTO user_offers (
    user_id,
    title,
    description,
    offer_type,
    discount_type,
    discount_value,
    min_order_amount,
    promo_code,
    valid_until
  ) VALUES (
    referrer_user_id,
    'Referral Reward',
    'You earned ₹100 discount for successful referral!',
    'referral',
    'fixed',
    100.00,
    0,
    'REF' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6)),
    now() + interval '90 days'
  ) RETURNING id INTO offer_id;
  
  RETURN offer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;