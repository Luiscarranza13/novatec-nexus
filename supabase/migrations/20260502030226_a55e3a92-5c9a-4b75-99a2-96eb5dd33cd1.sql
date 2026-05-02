
-- =========================================
-- ROLES
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer para evitar recursión
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins ven todos los roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gestionan roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- PERFILES
-- =========================================
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email_publico TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  github TEXT DEFAULT '',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles públicos visibles" ON public.perfiles
  FOR SELECT USING (true);

CREATE POLICY "Admins gestionan perfiles" ON public.perfiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, email_publico)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- PROYECTOS
-- =========================================
CREATE TABLE public.proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  imagen_url TEXT DEFAULT '',
  link TEXT DEFAULT '',
  categoria TEXT NOT NULL DEFAULT 'Web',
  destacado BOOLEAN NOT NULL DEFAULT false,
  orden INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proyectos públicos" ON public.proyectos
  FOR SELECT USING (true);

CREATE POLICY "Admins gestionan proyectos" ON public.proyectos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- SERVICIOS
-- =========================================
CREATE TABLE public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  icono TEXT NOT NULL DEFAULT 'Sparkles',
  orden INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servicios públicos" ON public.servicios
  FOR SELECT USING (true);

CREATE POLICY "Admins gestionan servicios" ON public.servicios
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- MENSAJES
-- =========================================
CREATE TABLE public.mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede enviar (insert público)
CREATE POLICY "Cualquiera envía mensaje" ON public.mensajes
  FOR INSERT WITH CHECK (true);

-- Solo admins ven/gestionan
CREATE POLICY "Admins ven mensajes" ON public.mensajes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins actualizan mensajes" ON public.mensajes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins eliminan mensajes" ON public.mensajes
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- STORAGE BUCKET
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portafolio', 'portafolio', true);

CREATE POLICY "Imágenes portafolio públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portafolio');

CREATE POLICY "Admins suben al portafolio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portafolio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins actualizan portafolio"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portafolio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins eliminan portafolio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portafolio' AND public.has_role(auth.uid(), 'admin'));
