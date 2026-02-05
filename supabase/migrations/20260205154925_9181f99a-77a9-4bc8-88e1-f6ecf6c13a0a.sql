-- Create saved_products table to store user's favorited product analyses
CREATE TABLE public.saved_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_name TEXT,
    ingredients TEXT NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved products"
ON public.saved_products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved products"
ON public.saved_products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved products"
ON public.saved_products
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster user lookups
CREATE INDEX idx_saved_products_user_id ON public.saved_products(user_id);