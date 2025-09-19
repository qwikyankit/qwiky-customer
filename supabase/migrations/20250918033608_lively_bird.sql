/*
  # Initial Database Schema for Qwiky Service Booking App

  1. New Tables
    - `users` - User profile information
    - `guest_addresses` - User addresses with Google Maps integration
    - `services` - Available services
    - `orders` - Booking orders
    - `transactions` - Payment transaction records
    - `cart_items` - Shopping cart functionality
    - `discount_codes` - Discount/promo codes

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for service data access

  3. Features
    - Google Maps integration for addresses
    - Cart functionality with discounts
    - Complete order and payment tracking
    - User profile management
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text UNIQUE NOT NULL,
  name text DEFAULT '',
  email text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Guest addresses table
CREATE TABLE IF NOT EXISTS guest_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  address_line_1 text NOT NULL,
  address_line_2 text DEFAULT '',
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  google_place_id text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10, 2) NOT NULL,
  duration_minutes integer NOT NULL,
  category_id text NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10, 2) NOT NULL,
  min_order_amount decimal(10, 2) DEFAULT 0,
  max_discount_amount decimal(10, 2),
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  scheduled_date date,
  scheduled_time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  guest_address_id uuid REFERENCES guest_addresses(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  subtotal decimal(10, 2) NOT NULL,
  discount_amount decimal(10, 2) DEFAULT 0,
  discount_code_id uuid REFERENCES discount_codes(id),
  total_amount decimal(10, 2) NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table (for multiple services in one order)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  quantity integer DEFAULT 1,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  payment_gateway text NOT NULL,
  gateway_transaction_id text,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled', 'refunded')),
  gateway_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for guest_addresses
CREATE POLICY "Users can manage own addresses"
  ON guest_addresses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for services (public read)
CREATE POLICY "Anyone can read active services"
  ON services
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for discount_codes (public read for active codes)
CREATE POLICY "Anyone can read active discount codes"
  ON discount_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- RLS Policies for cart_items
CREATE POLICY "Users can manage own cart"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for orders
CREATE POLICY "Users can manage own orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for order_items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- RLS Policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Insert sample services
INSERT INTO services (name, description, price, duration_minutes, category_id, image_url) VALUES
('Home Cleaning', 'Complete home cleaning service including dusting, mopping, and sanitization', 500.00, 120, 'cleaning', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=300'),
('Cooking Help', 'Professional cooking assistance for daily meals', 300.00, 180, 'cooking', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'),
('Baby Sitting', 'Trusted babysitting service with experienced caregivers', 400.00, 240, 'babysitting', 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=300'),
('Elder Care', 'Compassionate elder care service with medical assistance', 600.00, 240, 'eldercare', 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=300');

-- Insert sample discount codes
INSERT INTO discount_codes (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit) VALUES
('FIRST50', 'percentage', 50.00, 200.00, 100.00, 100),
('SAVE100', 'fixed', 100.00, 500.00, NULL, 50),
('WELCOME20', 'percentage', 20.00, 100.00, 50.00, 200);