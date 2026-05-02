# Supabase Setup Script 🚀

Este script configura un entorno completo de Supabase para el proyecto Novatec Nexus, incluyendo creación de usuarios, asignación de roles, verificación de tablas y carga de datos de prueba.

## 📋 Requisitos

- Node.js 18+ (modulos ES6)
- Proyecto Supabase configurado
- `@supabase/supabase-js` instalado (ya incluido en package.json)

## 🚦 Quick Start

### 1. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita el archivo con tus credenciales de Supabase:

```bash
# .env.local
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Para obtener la **Service Role Key**:
1. Entra en tu proyecto Supabase
2. Ve a **Settings** → **API**
3. Copia el valor de **Service Role Key**

### 2. Ejecutar el script

```bash
# Modo desarrollo (recomendado)
node supabase-setup.js

# O con variables inline (no recomendado para producción)
SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="ey..." node supabase-setup.js
```

## 🔍 ¿Qué hace el script?

### Paso 1: Crear Usuario Admin
- Crea un usuario con email `admin@novatec-nexus.com`
- Genera una contraseña segura
- Confirma el email automáticamente
- **Guarda los datos en `usuario-creado.json`**

### Paso 2: Asignar Rol Admin
- Inserta registro en `user_roles`
- Asigna el rol `admin` al usuario
- Usa la tabla de unión para roles múltiples

### Paso 3: Verificar Tablas
Verifica la existencia de las siguientes tablas:
- `perfiles` - Perfiles de usuarios
- `mensajes` - Mensajes de contacto
- `proyectos` - Portafolio de proyectos
- `servicios` - Servicios ofrecidos
- `user_roles` - Roles de usuarios

### Paso 4: Insertar Datos de Prueba
Carga datos de ejemplo solo si faltan:
- 2 perfiles de prueba
- 3 proyectos destacados
- 2 servicios principales

**No duplica** datos existentes (verifica por ID).

### Paso 5: Mostrar Ejemplos cURL
Genera comandos listos para usar:
- Login con email/password
- Consulta autenticada con Bearer token

## 🔐 Seguridad

### Service Role Key
⚠️ **NUNCA commit esta key**
- Tiene acceso completo a la base de datos
- Puede leer/escribir/eliminar cualquier dato
- Omite todas las RLS (Row Level Security) policies
- Úsala solo para scripts de administración

### Alternativas Seguras

Para producción, usa variables del sistema:

```bash
# Supabase CLI (recomendado)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="..."

# Railway / Vercel / Render
# Configura en el panel de variables de entorno
```

## 📁 Archivos Generados

### usuario-creado.json
```json
{
  "id": "uuid-del-usuario",
  "email": "admin@novatec-nexus.com",
  "nombre": "Admin Novatec",
  "created_at": "2026-05-01T...",
  "rol_asignado": "admin",
  "archivo_creado": "2026-05-01T..."
}
```

Guarda los datos del usuario creado para referencia futura.

## 🎯 Uso en la Aplicación

### Login con Email/Password

```javascript
import { supabase } from '@/integrations/supabase/client'

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@novatec-nexus.com',
  password: 'Admin123!Secure',
})

if (data.user) {
  console.log('Usuario autenticado:', data.user.id)
}
```

### Verificar Rol Admin

```javascript
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .eq('role', 'admin')

const isAdmin = roles.data?.length > 0
```

### Consulta con RLS

```sql
-- Ejemplo: Solo admins pueden ver todos los usuarios
create policy "Admins can view all profiles"
  on public.perfiles
  for select
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );
```

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que `.env.local` exista
- Confirma que las variables estén correctamente nombradas
- Reinicia el servidor después de crear el archivo

### Error: "User already registered"
- El usuario ya existe, el script lo detecta y recupera
- Verifica `usuario-creado.json` para el ID
- Puedes eliminarlo desde Supabase Dashboard → Auth

### Error: "new row violates row-level security policy"
- Asegúrate de usar la **Service Role Key**
- No uses la anon key para este script
- Verifica que la variable sea `SUPABASE_SERVICE_ROLE_KEY`

### Tablas no encontradas
- Asegúrate de que el esquema `public` exista
- Verifica migraciones pendientes en Supabase
- Ejecuta `npm run db:push` si usas Drizzle/Prisma

## 🔄 Reset Completo

Para limpiar todo y empezar de cero:

```bash
# 1. Eliminar usuario desde Supabase
# Dashboard → Auth → Users → Delete admin@novatec-nexus.com

# 2. Truncar tablas (SQL)
supabase db reset

# 3. Volver a ejecutar script
node supabase-setup.js
```

## 📚 Recursos

- [Documentación Supabase JS](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Admin](https://supabase.com/docs/reference/javascript/auth-admincreateuser)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎨 Personalización

### Cambiar credenciales del admin

Edita `supabase-setup.js`:

```javascript
const ADMIN_USER = {
  email: 'nuevo@email.com',
  password: 'NuevaPassword!Segura',
  nombre: 'Nuevo Admin',
}
```

### Agregar más datos de prueba

Añade objetos a los arrays:
- `perfilesPrueba`
- `proyectosPrueba`
- `serviciosPrueba`

### Modificar tablas

Actualiza el array `tablasEsperadas` según tu schema.

## 📄 Licencia

MIT - Novatec Nexus 2026