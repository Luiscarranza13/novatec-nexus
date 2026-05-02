
CREATE OR REPLACE FUNCTION public.validar_mensaje()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
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
  NEW.leido := false;
  RETURN NEW;
END;
$$;
