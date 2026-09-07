-- ============================================================================
-- PHONEBAY SUPABASE DATABASE SCHEMA
-- UPDATED VERSION - WITH account_purpose FIELD
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ============================================================================
-- SECTION 2: ENUMS
-- PostgreSQL does not support CREATE TYPE IF NOT EXISTS.
-- ============================================================================

DO $$
BEGIN
  CREATE TYPE role_enum AS ENUM ('ADMIN', 'SELLER', 'SHOP', 'USER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE account_purpose_enum AS ENUM ('buyer', 'seller', 'both', 'shop');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE listing_status AS ENUM (
    'draft',
    'pending',
    'active',
    'sold',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE verification_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE test_result_type AS ENUM (
    'battery',
    'display',
    'camera',
    'microphone',
    'speaker',
    'charging',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;


-- ============================================================================
-- SECTION 3: USERS - UPDATED WITH account_purpose
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,

  role role_enum NOT NULL DEFAULT 'USER',
  account_purpose account_purpose_enum,

  shop_id UUID,

  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,

  trust_score NUMERIC NOT NULL DEFAULT 0,

  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 4: SHOPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  owner_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,

  city TEXT NOT NULL,
  area TEXT,

  phone TEXT,
  website TEXT,

  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,

  rating NUMERIC(3,2),
  total_reviews INTEGER NOT NULL DEFAULT 0,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 5: USERS -> SHOPS FOREIGN KEY
-- Must be added after shops exists because shops also references users.
-- ============================================================================

DO $$
BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT fk_users_shop_id
    FOREIGN KEY (shop_id)
    REFERENCES public.shops(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;


-- ============================================================================
-- SECTION 6: LISTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,

  seller_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  storage TEXT NOT NULL,

  color TEXT,
  condition TEXT NOT NULL,

  price NUMERIC NOT NULL,
  negotiable BOOLEAN NOT NULL DEFAULT FALSE,

  city TEXT NOT NULL,
  area TEXT,

  description TEXT,

  status listing_status NOT NULL DEFAULT 'draft',

  battery_health INTEGER,
  repair_history TEXT,

  photo_count INTEGER NOT NULL DEFAULT 0,

  image_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  verified BOOLEAN NOT NULL DEFAULT FALSE,
  score NUMERIC,

  views INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 7: ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,

  listing_id TEXT NOT NULL
    REFERENCES public.listings(id)
    ON DELETE CASCADE,

  buyer_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  seller_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  price NUMERIC NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending',

  payment_method TEXT,
  shipping_address TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 8: CONVERSATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,

  participant_1_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  participant_2_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  listing_id TEXT
    REFERENCES public.listings(id)
    ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 9: MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,

  conversation_id TEXT NOT NULL
    REFERENCES public.conversations(id)
    ON DELETE CASCADE,

  sender_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  content TEXT NOT NULL,

  read_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 10: REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,

  listing_id TEXT
    REFERENCES public.listings(id)
    ON DELETE SET NULL,

  reviewer_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  reviewed_user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  rating INTEGER NOT NULL
    CHECK (rating >= 1 AND rating <= 5),

  comment TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 11: CERTIFICATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,

  listing_id TEXT NOT NULL
    REFERENCES public.listings(id)
    ON DELETE CASCADE,

  certificate_type TEXT NOT NULL,

  issued_date DATE NOT NULL,
  expiry_date DATE,

  issuer TEXT,
  document_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 12: TESTING RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.testing_records (
  id TEXT PRIMARY KEY,

  listing_id TEXT NOT NULL
    REFERENCES public.listings(id)
    ON DELETE CASCADE,

  test_type test_result_type NOT NULL,

  result TEXT NOT NULL,
  notes TEXT,

  tested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 13: VERIFICATION REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id TEXT PRIMARY KEY,

  user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  listing_id TEXT NOT NULL
    REFERENCES public.listings(id)
    ON DELETE CASCADE,

  status verification_status NOT NULL DEFAULT 'pending',

  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,

  score NUMERIC,

  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 14: AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,

  admin_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,

  changes JSONB,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- SECTION 15: ROW LEVEL SECURITY (RLS) ENABLE
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECTION 16: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- USERS

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);


DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);


DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE public.users.id = auth.uid()
      AND public.users.role = 'ADMIN'
  )
);


-- SHOPS

DROP POLICY IF EXISTS "Anyone can view active shops" ON public.shops;

CREATE POLICY "Anyone can view active shops"
ON public.shops
FOR SELECT
USING (is_active = true OR auth.uid() = owner_id);


DROP POLICY IF EXISTS "Shop owners can update own shop" ON public.shops;

CREATE POLICY "Shop owners can update own shop"
ON public.shops
FOR UPDATE
USING (auth.uid() = owner_id);


DROP POLICY IF EXISTS "Shop owner can delete own shop" ON public.shops;

CREATE POLICY "Shop owner can delete own shop"
ON public.shops
FOR DELETE
USING (auth.uid() = owner_id);


-- LISTINGS

DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;

CREATE POLICY "Anyone can view active listings"
ON public.listings
FOR SELECT
USING (
  status = 'active'
  OR auth.uid() = seller_id
);


DROP POLICY IF EXISTS "Sellers can create listings" ON public.listings;

CREATE POLICY "Sellers can create listings"
ON public.listings
FOR INSERT
WITH CHECK (
  auth.uid() = seller_id
);


DROP POLICY IF EXISTS "Sellers can update own listings" ON public.listings;

CREATE POLICY "Sellers can update own listings"
ON public.listings
FOR UPDATE
USING (
  auth.uid() = seller_id
);


DROP POLICY IF EXISTS "Sellers can delete own listings" ON public.listings;

CREATE POLICY "Sellers can delete own listings"
ON public.listings
FOR DELETE
USING (
  auth.uid() = seller_id
);


-- ORDERS

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() = buyer_id
  OR auth.uid() = seller_id
);


DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;

CREATE POLICY "Buyers can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  auth.uid() = buyer_id
);


-- CONVERSATIONS

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = participant_1_id
  OR auth.uid() = participant_2_id
);


DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  auth.uid() = participant_1_id
  OR auth.uid() = participant_2_id
);


-- MESSAGES

DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY "Users can view own messages"
ON public.messages
FOR SELECT
USING (
  auth.uid() = sender_id
  OR conversation_id IN (
    SELECT id
    FROM public.conversations
    WHERE participant_1_id = auth.uid()
       OR participant_2_id = auth.uid()
  )
);


DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
);


-- REVIEWS

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);


DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

CREATE POLICY "Users can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
);


-- CERTIFICATES

DROP POLICY IF EXISTS "Anyone can view certificates" ON public.certificates;

CREATE POLICY "Anyone can view certificates"
ON public.certificates
FOR SELECT
USING (true);


-- TESTING RECORDS

DROP POLICY IF EXISTS "Anyone can view test results" ON public.testing_records;

CREATE POLICY "Anyone can view test results"
ON public.testing_records
FOR SELECT
USING (true);


-- VERIFICATION REQUESTS

DROP POLICY IF EXISTS "Users can view own verification requests"
ON public.verification_requests;

CREATE POLICY "Users can view own verification requests"
ON public.verification_requests
FOR SELECT
USING (
  auth.uid() = user_id
);


DROP POLICY IF EXISTS "Users can create verification requests"
ON public.verification_requests;

CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);


-- AUDIT LOGS

DROP POLICY IF EXISTS "Only admins can view audit logs"
ON public.audit_logs;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE public.users.id = auth.uid()
      AND public.users.role = 'ADMIN'
  )
);


-- ============================================================================
-- SECTION 17: UPDATED_AT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


-- ============================================================================
-- SECTION 18: UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_users_updated_at
ON public.users;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_listings_updated_at
ON public.listings;

CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_shops_updated_at
ON public.shops;

CREATE TRIGGER update_shops_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_orders_updated_at
ON public.orders;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_conversations_updated_at
ON public.conversations;

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_verification_requests_updated_at
ON public.verification_requests;

CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- SECTION 19: AUTH -> PUBLIC.USERS TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    account_purpose,
    email_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone',
    'USER',
    NEW.raw_user_meta_data->>'account_purpose',
    NEW.email_confirmed_at IS NOT NULL
  )

  ON CONFLICT (id)
  DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;


CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- SECTION 20: REFRESH POSTGREST SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';


-- ============================================================================
-- SECTION 21: VERIFICATION
-- ============================================================================

SELECT
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;