-- schema.sql
-- Execute este arquivo no SQL Editor do seu projeto Supabase

-- Tabela de Produtos (Catálogo Dinâmico)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de envios (cabeçalho completo)
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_name TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    driver_name TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de itens do envio
CREATE TABLE IF NOT EXISTS public.shipment_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- Habilitar RLS (Row Level Security) e criar políticas básicas para testes anônimos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir inserção pública produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir exclusão pública produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir update publico produtos" ON public.products;

CREATE POLICY "Permitir leitura pública produtos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública produtos" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública produtos" ON public.products FOR DELETE USING (true);
CREATE POLICY "Permitir update publico produtos" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir leitura pública" ON public.shipments;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.shipments;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON public.shipments;
DROP POLICY IF EXISTS "Permitir update publico" ON public.shipments;

CREATE POLICY "Permitir leitura pública" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON public.shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON public.shipments FOR DELETE USING (true);
CREATE POLICY "Permitir update publico" ON public.shipments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir leitura pública itens" ON public.shipment_items;
DROP POLICY IF EXISTS "Permitir inserção pública itens" ON public.shipment_items;
DROP POLICY IF EXISTS "Permitir exclusão pública itens" ON public.shipment_items;

CREATE POLICY "Permitir leitura pública itens" ON public.shipment_items FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública itens" ON public.shipment_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública itens" ON public.shipment_items FOR DELETE USING (true);
