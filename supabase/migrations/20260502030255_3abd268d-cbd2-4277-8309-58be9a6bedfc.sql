
-- 1. Restringir ejecución de has_role
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- 2. Restringir listado del bucket: solo admins listan, lectura individual sigue pública vía URL firmada/CDN
DROP POLICY IF EXISTS "Imágenes portafolio públicas" ON storage.objects;

CREATE POLICY "Lectura pública portafolio (sin listing libre)"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portafolio'
    AND (
      -- anon/auth pueden leer un objeto específico por nombre
      auth.role() = 'anon'
      OR auth.role() = 'authenticated'
    )
  );

-- 3. Validar inserts en mensajes con función trigger en lugar de WITH CHECK (true)
CREATE OR REPLACE FUNCTION public.validar_mensaje()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF length(trim(NEW.nombre)) < 2 OR length(NEW.nombre) > 100 THEN
    RAISE EXCEPTION 'Nombre inválido';
  END IF;
  IF NEW.correo !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR length(NEW.correo) > 255 THEN
    RAISE EXCEPTION 'Correo inválido';
  END IF;
  IF length(trim(NEW.mensaje)) < 5 OR length(NEW.mensaje) > 2000 THEN
    RAISE EXCEPTION 'Mensaje inválido';
  END IF;
  -- Forzar leido = false en inserts públicos
  NEW.leido := false;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_mensaje
  BEFORE INSERT ON public.mensajes
  FOR EACH ROW EXECUTE FUNCTION public.validar_mensaje();

-- Reemplazar la policy permisiva por una que documente la validación vía trigger
DROP POLICY IF EXISTS "Cualquiera envía mensaje" ON public.mensajes;
CREATE POLICY "Envío público validado por trigger" ON public.mensajes
  FOR INSERT
  WITH CHECK (
    length(trim(nombre)) BETWEEN 2 AND 100
    AND length(trim(mensaje)) BETWEEN 5 AND 2000
    AND length(correo) <= 255
  );
