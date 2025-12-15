-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'usuario', 'consulta');

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    empresa VARCHAR(200),
    cargo VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_login TIMESTAMP WITH TIME ZONE
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'usuario',
    UNIQUE (user_id, role)
);

-- Create ingredientes table
CREATE TABLE public.ingredientes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- Composição Química (%)
    n DECIMAL(5,2) DEFAULT 0,
    p DECIMAL(5,2) DEFAULT 0,
    k DECIMAL(5,2) DEFAULT 0,
    s DECIMAL(5,2) DEFAULT 0,
    ca DECIMAL(5,2) DEFAULT 0,
    mg DECIMAL(5,2) DEFAULT 0,
    zn DECIMAL(5,2) DEFAULT 0,
    b DECIMAL(5,2) DEFAULT 0,
    mn DECIMAL(5,2) DEFAULT 0,
    cu DECIMAL(5,2) DEFAULT 0,
    fe DECIMAL(5,2) DEFAULT 0,
    mo DECIMAL(5,2) DEFAULT 0,
    
    -- Propriedades
    custo_por_ton DECIMAL(10,2) NOT NULL,
    densidade DECIMAL(6,2),
    solubilidade VARCHAR(50),
    disponivel BOOLEAN DEFAULT true,
    
    -- Categorias
    categoria VARCHAR(50),
    tags TEXT[],
    
    -- Controle
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id)
);

-- Create formulacoes table
CREATE TABLE public.formulacoes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    
    -- Composição Alvo (%)
    n_alvo DECIMAL(5,2),
    p_alvo DECIMAL(5,2),
    k_alvo DECIMAL(5,2),
    s_alvo DECIMAL(5,2),
    ca_alvo DECIMAL(5,2),
    
    -- Metadados
    cultura VARCHAR(100),
    fase_crescimento VARCHAR(50),
    solo_tipo VARCHAR(50),
    regiao VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'rascunho',
    publica BOOLEAN DEFAULT false,
    
    -- Resultados
    custo_total DECIMAL(10,2),
    peso_total DECIMAL(10,2) DEFAULT 1000,
    
    -- Controle
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create formulacao_itens table
CREATE TABLE public.formulacao_itens (
    id SERIAL PRIMARY KEY,
    formulacao_id INTEGER REFERENCES public.formulacoes(id) ON DELETE CASCADE,
    ingrediente_id INTEGER REFERENCES public.ingredientes(id),
    quantidade_kg DECIMAL(8,2) NOT NULL,
    porcentagem DECIMAL(5,2) NOT NULL,
    custo_unitario DECIMAL(10,2),
    custo_total DECIMAL(10,2),
    ordem_mistura INTEGER,
    UNIQUE(formulacao_id, ingrediente_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulacao_itens ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Ingredientes policies (readable by all authenticated, writable by authenticated)
CREATE POLICY "Authenticated users can view ingredientes" ON public.ingredientes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ingredientes" ON public.ingredientes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own ingredientes" ON public.ingredientes
    FOR UPDATE TO authenticated USING (auth.uid() = usuario_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own ingredientes" ON public.ingredientes
    FOR DELETE TO authenticated USING (auth.uid() = usuario_id OR public.has_role(auth.uid(), 'admin'));

-- Formulacoes policies
CREATE POLICY "Users can view own formulacoes" ON public.formulacoes
    FOR SELECT TO authenticated USING (auth.uid() = usuario_id OR publica = true);

CREATE POLICY "Users can insert own formulacoes" ON public.formulacoes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own formulacoes" ON public.formulacoes
    FOR UPDATE TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own formulacoes" ON public.formulacoes
    FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Formulacao itens policies
CREATE POLICY "Users can view formulacao itens" ON public.formulacao_itens
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.formulacoes f 
            WHERE f.id = formulacao_id 
            AND (f.usuario_id = auth.uid() OR f.publica = true)
        )
    );

CREATE POLICY "Users can insert formulacao itens" ON public.formulacao_itens
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.formulacoes f 
            WHERE f.id = formulacao_id 
            AND f.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Users can update formulacao itens" ON public.formulacao_itens
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.formulacoes f 
            WHERE f.id = formulacao_id 
            AND f.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete formulacao itens" ON public.formulacao_itens
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.formulacoes f 
            WHERE f.id = formulacao_id 
            AND f.usuario_id = auth.uid()
        )
    );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email)
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'usuario');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update atualizado_em timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ingredientes_updated_at
    BEFORE UPDATE ON public.ingredientes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formulacoes_updated_at
    BEFORE UPDATE ON public.formulacoes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();