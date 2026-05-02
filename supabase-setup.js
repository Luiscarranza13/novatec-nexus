/**
 * Supabase Setup Script
 * Este script configura un usuario admin, verifica tablas y carga datos de prueba
 * 
 * Requisitos:
 * - Node.js 18+
 * - Paquete: @supabase/supabase-js
 * - Variables de entorno:
 *   SUPABASE_URL: URL del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY: Service Role Key de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ========================================================
// Configuración
// ========================================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno requeridas.');
  console.error('   Por favor, configura:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nEjemplo:');
  console.error('   export SUPABASE_URL="https://tu-proyecto.supabase.co"');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."');
  process.exit(1);
}

// Usar service role key para tener permisos de administrador
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

// Datos del usuario admin a crear
const ADMIN_USER = {
  email: 'admin@novatec-nexus.com',
  password: 'Admin123!Secure',
  nombre: 'Admin Novatec',
};

const OUTPUT_FILE = path.resolve('./usuario-creado.json');

// ========================================================
// Funciones principales
// ========================================================

/**
 * Paso 1: Crear usuario con service role key
 */
async function crearUsuarioAdmin() {
  console.log('\n=== Paso 1: Creando usuario admin ===');
  console.log(`Email: ${ADMIN_USER.email}`);

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      email_confirm: true,
      user_metadata: {
        nombre: ADMIN_USER.nombre,
      },
    });

    if (error) throw error;

    console.log('✅ Usuario creado exitosamente');
    console.log(`   ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);

    // Guardar en archivo
    const usuarioData = {
      id: data.user.id,
      email: data.user.email,
      nombre: ADMIN_USER.nombre,
      created_at: data.user.created_at,
      rol_asignado: 'admin',
      archivo_creado: new Date().toISOString(),
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(usuarioData, null, 2));
    console.log(`\n📄 Usuario guardado en: ${OUTPUT_FILE}`);

    return data.user;
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    
    // Intentar recuperar usuario existente
    if (error.message?.includes('already exists') || error.message?.includes('User already registered')) {
      console.log('\n🔄 Usuario ya existe, intentando recuperar...');
      const { data: existingData } = await supabase.auth.admin.listUsers({
        filter: `email.eq.${ADMIN_USER.email}`,
      });
      
      if (existingData?.users?.[0]) {
        const user = existingData.users[0];
        console.log(`✅ Usuario existente encontrado: ${user.id}`);
        return user;
      }
    }
    
    throw error;
  }
}

/**
 * Paso 2: Asignar rol admin al usuario
 */
async function asignarRolAdmin(usuarioId) {
  console.log('\n=== Paso 2: Asignando rol admin ===');
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: usuarioId,
        role: 'admin',
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id,role' })
      .select();

    if (error) throw error;

    console.log('✅ Rol admin asignado exitosamente');
    console.log(`   user_id: ${usuarioId}`);
    console.log(`   role: admin`);
    
    return data;
  } catch (error) {
    console.error('❌ Error al asignar rol:', error.message);
    throw error;
  }
}

/**
 * Paso 3: Verificar tablas existentes
 */
async function verificarTablas() {
  console.log('\n=== Paso 3: Verificando tablas existentes ===');
  
  const tablasEsperadas = [
    'perfiles',
    'mensajes', 
    'proyectos',
    'servicios',
    'user_roles',
  ];
  
  const tablasEncontradas = [];
  
  for (const tabla of tablasEsperadas) {
    try {
      const { count, error } = await supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true });
      
      if (error && error.code !== '42P01') { // 42P01 = tabla no existe
        console.log(`⚠️  ${tabla}: error verificando (${error.message})`);
        continue;
      }
      
      const countStr = count !== null ? `(${count} registros)` : '(sin contar)';
      console.log(`✅ ${tabla} ${countStr}`);
      tablasEncontradas.push({ tabla, count: count || 0 });
    } catch (error) {
      console.log(`❌ ${tabla}: no encontrada`);
    }
  }
  
  if (tablasEncontradas.length === 0) {
    console.log('\n⚠️  No se encontraron tablas. Asegúrate de que el esquema esté creado.');
  }
  
  return tablasEncontradas;
}

/**
 * Paso 4: Insertar datos de prueba si faltan
 */
async function insertarDatosPrueba() {
  console.log('\n=== Paso 4: Insertando datos de prueba ===');
  
  // Datos de prueba para perfiles
  const perfilesPrueba = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Ana García',
      rol: 'user',
      bio: 'Desarrolladora frontend apasionada por React',
      email_publico: 'ana@ejemplo.com',
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'Carlos Ruiz',
      rol: 'user',
      bio: 'Diseñador UX/UI especializado en productos digitales',
      email_publico: 'carlos@ejemplo.com',
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    },
  ];
  
  // Datos de prueba para proyectos
  const proyectosPrueba = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      nombre: 'Panel de Control v2',
      descripcion: 'Rediseño completo del panel de administración con nuevas métricas',
      categoria: 'Software',
      imagen_url: null,
      link: 'https://dashboard.novatec-nexus.com',
      destacado: true,
      orden: 1,
      creado_en: new Date().toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      nombre: 'App Móvil',
      descripcion: 'Aplicación móvil nativa para iOS y Android',
      categoria: 'Mobile',
      imagen_url: null,
      link: null,
      destacado: false,
      orden: 2,
      creado_en: new Date().toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      nombre: 'Sitio Web Corporativo',
      descripcion: 'Web corporativa con blog integrado y CMS',
      categoria: 'Web',
      imagen_url: null,
      link: 'https://novatec-nexus.com',
      destacado: true,
      orden: 3,
      creado_en: new Date().toISOString(),
    },
  ];
  
  // Datos de prueba para servicios
  const serviciosPrueba = [
    {
      id: '44444444-4444-4444-4444-444444444444',
      titulo: 'Desarrollo Web',
      descripcion: 'Sitios web modernos y escalables con tecnologías actuales',
      icono: 'Globe',
      orden: 1,
      creado_en: new Date().toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      titulo: 'Consultoría UX',
      descripcion: 'Mejora de la experiencia de usuario y usabilidad',
      icono: 'LayoutDashboard',
      orden: 2,
      creado_en: new Date().toISOString(),
    },
  ];
  
  // Insertar perfiles
  console.log('\n📋 Perfiles:');
  for (const perfil of perfilesPrueba) {
    const { count } = await supabase
      .from('perfiles')
      .select('*', { count: 'exact', head: true })
      .eq('id', perfil.id);
    
    if (count === 0) {
      const { error } = await supabase.from('perfiles').insert(perfil);
      if (error) {
        console.log(`❌ ${perfil.nombre}: ${error.message}`);
      } else {
        console.log(`✅ ${perfil.nombre} - ${perfil.rol}`);
      }
    } else {
      console.log(`⏭️  ${perfil.nombre}: ya existe`);
    }
  }
  
  // Insertar proyectos
  console.log('\n📋 Proyectos:');
  for (const proyecto of proyectosPrueba) {
    const { count } = await supabase
      .from('proyectos')
      .select('*', { count: 'exact', head: true })
      .eq('id', proyecto.id);
    
    if (count === 0) {
      const { error } = await supabase.from('proyectos').insert(proyecto);
      if (error) {
        console.log(`❌ ${proyecto.nombre}: ${error.message}`);
      } else {
        console.log(`✅ ${proyecto.nombre}`);
      }
    } else {
      console.log(`⏭️  ${proyecto.nombre}: ya existe`);
    }
  }
  
  // Insertar servicios
  console.log('\n📋 Servicios:');
  for (const servicio of serviciosPrueba) {
    const { count } = await supabase
      .from('servicios')
      .select('*', { count: 'exact', head: true })
      .eq('id', servicio.id);
    
    if (count === 0) {
      const { error } = await supabase.from('servicios').insert(servicio);
      if (error) {
        console.log(`❌ ${servicio.titulo}: ${error.message}`);
      } else {
        console.log(`✅ ${servicio.titulo}`);
      }
    } else {
      console.log(`⏭️  ${servicio.titulo}: ya existe`);
    }
  }
  
  console.log('\n✅ Datos de prueba verificados/insertados');
}

/**
 * Paso 5: Mostrar ejemplo de login con curl
 */
function mostrarEjemploCurlLogin() {
  console.log('\n=== Paso 5: Ejemplo de login con curl ===');
  console.log('\n📄 Autenticación (Sign In):');
  console.log('```bash');
  console.log(`curl -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \\
  -H "apikey: <tu-anon-key-publishable>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "${ADMIN_USER.email}",
    "password": "${ADMIN_USER.password}"
  }'`);
  console.log('```');
  console.log('\n✅ Si es exitoso, recibirás un access_token para usar en:');
  console.log('   Authorization: Bearer <access_token>');
  console.log('\n📄 Ejemplo de consulta autenticada:');
  console.log('```bash');
  console.log(`curl "${SUPABASE_URL}/rest/v1/perfiles" \\
  -H "apikey: <tu-anon-key-publishable>" \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json"`);
  console.log('```');
}

// ========================================================
// Ejecución principal
// ========================================================
async function main() {
  console.log('🚀 Iniciando setup de Supabase...');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Archivo de salida: ${OUTPUT_FILE}`);
  
  try {
    // Paso 1: Crear usuario
    const usuario = await crearUsuarioAdmin();
    
    // Paso 2: Asignar rol admin
    await asignarRolAdmin(usuario.id);
    
    // Paso 3: Verificar tablas
    await verificarTablas();
    
    // Paso 4: Insertar datos de prueba
    await insertarDatosPrueba();
    
    // Paso 5: Mostrar ejemplo curl
    mostrarEjemploCurlLogin();
    
    console.log('\n✅ Setup completado exitosamente!');
    console.log(`\n📄 Configuración guardada en: ${OUTPUT_FILE}`);
    console.log('\n🚀 Puedes iniciar la aplicación con: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error durante el setup:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar
main();