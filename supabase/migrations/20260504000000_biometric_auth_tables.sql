-- Tablas de Autenticación Biométrica para el Panel Admin de Novatec
-- Compatible con estándar WebAuthn para huella digital y Face ID

-- Tabla para almacenar credenciales biométricas de usuarios
create table if not exists credenciales_biometricas (
  id uuid default uuid_generate_v4() primary key,
  id_usuario uuid references perfiles(id) on delete cascade not null,
  correo_usuario text not null,
  id_credencial text not null,
  clave_publica text not null,
  contador_firmas integer default 0,
  transportes text[], -- usb, nfc, ble, interno
  tipo_dispositivo text, -- plataforma (Face ID/Touch ID) o multiplataforma
  respaldo boolean default false,
  activa boolean default true,
  ultimo_uso timestamp with time zone,
  creada_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizada_en timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint credencial_unica unique (id_credencial),
  constraint credencial_usuario_unica unique (id_usuario, id_credencial)
);

-- Tabla para almacenar desafíos de autenticación (previene ataques de repetición)
create table if not exists desafios_autenticacion (
  id uuid default uuid_generate_v4() primary key,
  id_usuario uuid references perfiles(id) on delete cascade not null,
  desafio text not null,
  tipo text not null check (tipo in ('registro', 'autenticacion')),
  expira_en timestamp with time zone not null,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para mejor rendimiento
create index idx_credenciales_id_usuario on credenciales_biometricas(id_usuario);
create index idx_credenciales_correo on credenciales_biometricas(correo_usuario);
create index idx_credenciales_activa on credenciales_biometricas(activa);
create index idx_desafios_id_usuario on desafios_autenticacion(id_usuario);
create index idx_desafios_expira_en on desafios_autenticacion(expira_en);
create index idx_desafios_desafio on desafios_autenticacion(desafio);

-- Función para limpiar desafíos expirados
create or replace function limpiar_desafios_expirados()
returns trigger as $$
begin
  delete from desafios_autenticacion where expira_en < timezone('utc'::text, now());
  return null;
end;
$$ language plpgsql;

-- Disparador para ejecutar limpieza periódicamente
create or replace trigger disparador_limpieza_desafios
  after insert or update on desafios_autenticacion
  execute function limpiar_desafios_expirados();

-- Seguridad Nivel Fila (RLS)
alter table credenciales_biometricas enable row level security;
alter table desafios_autenticacion enable row level security;

-- Políticas para credenciales_biometricas
create policy "Usuarios pueden ver sus credenciales biométricas"
  on credenciales_biometricas for select
  using (auth.uid() = id_usuario);

create policy "Admin puede gestionar credenciales biométricas"
  on credenciales_biometricas for all
  using (auth.uid() = id_usuario and exists (
    select 1 from perfiles where id = auth.uid() and role = 'admin'
  ));

-- Políticas para desafios_autenticacion
create policy "Admin puede gestionar desafíos"
  on desafios_autenticacion for all
  using (auth.uid() = id_usuario and exists (
    select 1 from perfiles where id = auth.uid() and role = 'admin'
  ));

-- Comentarios
comment on table credenciales_biometricas is 'Almacena credenciales WebAuthn para autenticación biométrica (Face ID, Touch ID, huella digital)';
comment on table desafios_autenticacion is 'Almacena desafíos temporales para el flujo de autenticación WebAuthn y prevenir ataques de repetición';