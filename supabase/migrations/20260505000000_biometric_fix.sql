-- Eliminar tablas si existen (para recrear limpias)
drop table if exists desafios_autenticacion cascade;
drop table if exists credenciales_biometricas cascade;

-- Tabla de credenciales biométricas
create table credenciales_biometricas (
  id uuid default gen_random_uuid() primary key,
  id_usuario uuid references auth.users(id) on delete cascade not null,
  correo_usuario text not null,
  id_credencial text not null,
  clave_publica text not null,
  contador_firmas integer default 0,
  transportes text[],
  tipo_dispositivo text,
  respaldo boolean default false,
  activa boolean default true,
  ultimo_uso timestamp with time zone,
  creada_en timestamp with time zone default timezone('utc', now()) not null,
  constraint credencial_unica unique (id_credencial),
  constraint credencial_usuario_unica unique (id_usuario, id_credencial)
);

-- Tabla de desafíos
create table desafios_autenticacion (
  id uuid default gen_random_uuid() primary key,
  id_usuario uuid references auth.users(id) on delete cascade not null,
  desafio text not null,
  tipo text not null check (tipo in ('registro', 'autenticacion')),
  expira_en timestamp with time zone not null,
  creado_en timestamp with time zone default timezone('utc', now()) not null
);

-- Índices
create index idx_cred_usuario on credenciales_biometricas(id_usuario);
create index idx_cred_activa on credenciales_biometricas(activa);
create index idx_cred_id on credenciales_biometricas(id_credencial);
create index idx_desafio_usuario on desafios_autenticacion(id_usuario);
create index idx_desafio_expira on desafios_autenticacion(expira_en);

-- RLS
alter table credenciales_biometricas enable row level security;
alter table desafios_autenticacion enable row level security;

-- Políticas usando user_roles (esquema real del proyecto)
create policy "Ver propias credenciales"
  on credenciales_biometricas for select
  using (auth.uid() = id_usuario);

create policy "Admin gestiona credenciales"
  on credenciales_biometricas for all
  using (
    auth.uid() = id_usuario
    and public.has_role(auth.uid(), 'admin')
  );

create policy "Admin gestiona desafios"
  on desafios_autenticacion for all
  using (
    auth.uid() = id_usuario
    and public.has_role(auth.uid(), 'admin')
  );
