-- ============================================================================
-- ShoeStyle E-Commerce — مخطط قاعدة بيانات Supabase الكامل (SQL Schema)
-- قم بنسخ هذا الكود وتشغيله في قسم (SQL Editor) داخل لوحة تحكم Supabase الخاصة بك
-- ============================================================================

-- 1. جدول المنتجات والمخزون (Products & Inventory)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Talons',
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  discount_percent INTEGER DEFAULT 20,
  stock INTEGER NOT NULL DEFAULT 10,
  image TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '["Rose", "Noir", "Beige"]'::jsonb,
  sizes JSONB DEFAULT '[36, 37, 38, 39, 40]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول طلبات الزبائن (Customer Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  address TEXT NOT NULL,
  items_summary TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول إعدادات ومحتوى واجهة المتجر (Storefront CMS)
CREATE TABLE IF NOT EXISTS public.cms_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'ShoeStyle',
  logo_url TEXT,
  announcement_text TEXT,
  announcement_enabled BOOLEAN DEFAULT TRUE,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_bg_url TEXT,
  hero_btn_text TEXT,
  hero_btn_link TEXT DEFAULT 'Talons',
  features JSONB DEFAULT '[]'::jsonb,
  free_shipping_threshold NUMERIC DEFAULT 8000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول صفحات الهبوط والعروض الترويجية (Landing Pages)
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  original_price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  quick_form_enabled BOOLEAN DEFAULT TRUE,
  created_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول أسعار التوصيل حسب الولايات (Shipping Rates)
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  code TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  home_fee NUMERIC NOT NULL DEFAULT 500,
  desk_fee NUMERIC NOT NULL DEFAULT 350,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل صلاحيات القراءة والكتابة المباشرة للربط بين المتجر ولوحة التحكم (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access CMS" ON public.cms_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Landing Pages" ON public.landing_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Shipping Rates" ON public.shipping_rates FOR ALL USING (true) WITH CHECK (true);
