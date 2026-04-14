-- travel_schema.sql
-- Execute este arquivo no SQL Editor do seu projeto Supabase para criar as tabelas de Viagens

-- Dropar as antigas caso você tenha rodado, para aplicar as novas regras de start/end date
DROP TABLE IF EXISTS public.travel_trips;
DROP TABLE IF EXISTS public.travel_users;

CREATE TABLE IF NOT EXISTS public.travel_users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.travel_trips (
    id SERIAL PRIMARY KEY,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    leader_id INTEGER REFERENCES public.travel_users(id),
    assistant_id INTEGER REFERENCES public.travel_users(id),
    status TEXT NOT NULL DEFAULT 'Confirmado',
    original_leader_id INTEGER REFERENCES public.travel_users(id),
    original_assistant_id INTEGER REFERENCES public.travel_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) e criar políticas básicas para testes
ALTER TABLE public.travel_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura travel_users" ON public.travel_users;
CREATE POLICY "Permitir leitura travel_users" ON public.travel_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir update travel_users" ON public.travel_users;
CREATE POLICY "Permitir update travel_users" ON public.travel_users FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir leitura travel_trips" ON public.travel_trips;
CREATE POLICY "Permitir leitura travel_trips" ON public.travel_trips FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir all travel_trips" ON public.travel_trips;
CREATE POLICY "Permitir all travel_trips" ON public.travel_trips FOR ALL USING (true);

-- Insert starting users based on mock data
INSERT INTO public.travel_users (name, role) VALUES
('Franklin', 'Líder'),
('Raone', 'Líder'),
('Marcelo', 'Líder'),
('Leonardo', 'Líder'),
('Arilson', 'Líder'),
('Ueslei', 'Auxiliar'),
('Guilherme', 'Auxiliar'),
('Cauê', 'Auxiliar'),
('Arthur', 'Auxiliar'),
('Fernando', 'Auxiliar');
