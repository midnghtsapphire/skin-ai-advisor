-- Create product status enum
CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'out_of_stock', 'discontinued');

-- Create order status enum  
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');

-- Create return status enum
CREATE TYPE public.return_status AS ENUM ('requested', 'approved', 'rejected', 'received', 'refunded');

-- Products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    category TEXT,
    brand TEXT,
    image_url TEXT,
    my_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    markup_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN my_cost > 0 THEN ((selling_price - my_cost) / my_cost * 100) ELSE 0 END
    ) STORED,
    status product_status NOT NULL DEFAULT 'active',
    is_affiliate BOOLEAN DEFAULT false,
    affiliate_link TEXT,
    affiliate_commission_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE public.inventory (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    reorder_quantity INTEGER NOT NULL DEFAULT 50,
    warehouse_location TEXT,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id)
);

-- Orders table
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number TEXT,
    carrier TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Returns table
CREATE TABLE public.returns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id),
    user_id UUID NOT NULL,
    status return_status NOT NULL DEFAULT 'requested',
    reason TEXT NOT NULL,
    refund_amount DECIMAL(10,2),
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Return items table
CREATE TABLE public.return_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    return_id UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    reason TEXT
);

-- Affiliate programs table (pre-populated with high-end affiliates)
CREATE TABLE public.affiliate_programs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    category TEXT,
    commission_rate TEXT,
    cookie_duration TEXT,
    signup_url TEXT,
    description TEXT,
    tier TEXT DEFAULT 'premium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate links tracking
CREATE TABLE public.affiliate_clicks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id),
    affiliate_program_id UUID REFERENCES public.affiliate_programs(id),
    user_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Inventory policies (public read for stock status)
CREATE POLICY "Inventory viewable by everyone" ON public.inventory FOR SELECT USING (true);

-- Orders policies (users see own orders)
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Users can create order items for their orders" ON public.order_items FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Returns policies
CREATE POLICY "Users can view their own returns" ON public.returns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create returns" ON public.returns FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Return items policies
CREATE POLICY "Users can view their own return items" ON public.return_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.returns WHERE returns.id = return_items.return_id AND returns.user_id = auth.uid()));

CREATE POLICY "Users can create return items" ON public.return_items FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.returns WHERE returns.id = return_items.return_id AND returns.user_id = auth.uid()));

-- Affiliate programs public read
CREATE POLICY "Affiliate programs are public" ON public.affiliate_programs FOR SELECT USING (true);

-- Affiliate clicks (anyone can create, for tracking)
CREATE POLICY "Anyone can create affiliate clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON public.returns 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert high-end affiliate programs
INSERT INTO public.affiliate_programs (name, website, category, commission_rate, cookie_duration, signup_url, description, tier) VALUES
('Sephora Affiliate Program', 'sephora.com', 'Luxury Beauty', '5-10%', '24 hours', 'https://www.rakuten.com/advertising', 'Premium beauty retailer with luxury skincare brands', 'premium'),
('Dermstore Affiliate', 'dermstore.com', 'Professional Skincare', '5-15%', '30 days', 'https://www.dermstore.com/affiliates', 'Professional-grade skincare products', 'premium'),
('Bluemercury', 'bluemercury.com', 'Luxury Beauty', '4-8%', '14 days', 'https://www.cj.com', 'Luxury beauty and spa products', 'premium'),
('Net-A-Porter Beauty', 'net-a-porter.com', 'Luxury Fashion & Beauty', '6%', '14 days', 'https://www.net-a-porter.com/affiliates', 'High-end designer beauty', 'premium'),
('Cult Beauty', 'cultbeauty.com', 'Curated Beauty', '8%', '30 days', 'https://www.awin.com', 'Curated selection of cult beauty products', 'premium'),
('SpaceNK', 'spacenk.com', 'Luxury Beauty', '4-7%', '30 days', 'https://www.awin.com', 'Niche and luxury beauty apothecary', 'premium'),
('Violet Grey', 'violetgrey.com', 'Celebrity Beauty', '10%', '30 days', 'https://www.shareasale.com', 'Hollywood-approved beauty products', 'premium'),
('Goop Beauty', 'goop.com', 'Clean Luxury', '7%', '30 days', 'https://www.shareasale.com', 'Clean luxury wellness and beauty', 'premium'),
('The Detox Market', 'thedetoxmarket.com', 'Clean Beauty', '10-15%', '30 days', 'https://www.refersion.com', 'Curated clean beauty marketplace', 'premium'),
('Credo Beauty', 'credobeauty.com', 'Clean Beauty', '8%', '30 days', 'https://www.shareasale.com', 'Clean beauty standards retailer', 'premium'),
('Skinstore', 'skinstore.com', 'Professional Skincare', '8%', '30 days', 'https://www.skinstore.com/affiliates', 'Professional skincare retailer', 'standard'),
('Paula''s Choice', 'paulaschoice.com', 'Science-Based Skincare', '12%', '45 days', 'https://www.paulaschoice.com/affiliate', 'Science-backed skincare', 'standard'),
('The Ordinary (DECIEM)', 'theordinary.com', 'Affordable Science', '5%', '30 days', 'https://www.awin.com', 'Affordable clinical skincare', 'standard'),
('Tatcha', 'tatcha.com', 'Japanese Luxury', '8%', '30 days', 'https://www.rakuten.com/advertising', 'Japanese luxury skincare rituals', 'premium'),
('La Mer', 'lamer.com', 'Ultra Luxury', '5%', '14 days', 'https://www.rakuten.com/advertising', 'Ultra-premium luxury skincare', 'premium'),
('SK-II', 'sk-ii.com', 'Japanese Luxury', '5%', '14 days', 'https://www.cj.com', 'Premium Japanese skincare', 'premium'),
('Sunday Riley', 'sundayriley.com', 'Clinical Luxury', '10%', '30 days', 'https://www.shareasale.com', 'Clinical luxury skincare', 'premium'),
('Drunk Elephant', 'drunkelephant.com', 'Clean Clinical', '7%', '30 days', 'https://www.shareasale.com', 'Biocompatible clean skincare', 'premium'),
('iHerb', 'iherb.com', 'Natural Health', '5-10%', '7 days', 'https://www.iherb.com/affiliates', 'Natural and organic products marketplace', 'standard'),
('Amazon Associates', 'amazon.com', 'General', '1-10%', '24 hours', 'https://affiliate-program.amazon.com', 'World''s largest marketplace', 'standard');