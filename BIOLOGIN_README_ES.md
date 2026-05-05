# Autenticación Biométrica para Panel Admin

## Descripción
Implementación de desbloqueo con huella digital y Face ID para el panel de administración, compatible con dispositivos Android e iOS utilizando el estándar WebAuthn.

## Características Principales
- ✅ **Huella Digital**: Compatible con sensores de huella en Android
- ✅ **Face ID**: Compatible con dispositivos iOS (iPhone/iPad)
- ✅ **Touch ID**: Compatible con MacBooks
- ✅ **Seguridad WebAuthn**: Estándar de autenticación web de FIDO2
- ✅ **Solo para Admin**: Restringido a usuarios con rol "admin"
- ✅ **Anti-Replay**: Protección contra ataques de repetición

## Arquitectura

### Frontend (React/TypeScript)
- Componente: `src/components/auth/BiometricLogin.tsx`
- Página de login: `src/routes/admin.login.tsx`
- Gestión de credenciales: `src/routes/admin/biometric/index.tsx`

### Backend (Supabase Edge Functions)
- Registro biométrico: `src/functions/biometric-register/index.ts`
- Autenticación: `src/functions/biometric-auth/index.ts`
- Verificación: `src/functions/biometric-verify/index.ts`

### Base de Datos (PostgreSQL)
- Tabla: `credenciales_biometricas`
- Tabla: `desafios_autenticacion`
- Migración: `supabase/migrations/20260504000000_biometric_auth_tables.sql`

## Flujo de Autenticación

### 1. Registro de Credencial Biométrica
1. Usuario admin ingresa su correo
2. Clic en "Registrar Biométrica"
3. Navegador solicita Face ID / Touch ID / Huella
4. Se genera par de claves criptográficas
5. Clave pública se almacena en la base de datos
6. Clave privada se guarda en el dispositivo (Secure Enclave)

### 2. Inicio de Sesión Biométrico
1. Usuario ingresa correo
2. Clic en "Desbloquear con Biometría"
3. Backend genera desafío criptográfico
4. Navegador solicita autenticación biométrica
5. Dispositivo firma el desafío con clave privada
6. Backend verifica la firma con clave pública
7. Se inicia sesión si la verificación es exitosa

## Seguridad

### WebAuthn
- **Criptografía asimétrica**: Par de claves por dispositivo
- **Clave privada**: Nunca sale del dispositivo (Secure Enclave)
- **Clave pública**: Se almacena en el servidor
- **Desafíos**: Únicos por cada intento de autenticación
- **RPID**: Verificación del dominio (previene phishing)

### Almacenamiento Seguro
```sql
-- Las claves privadas NUNCA se almacenan en la base de datos
-- Solo se guarda:
- ID de la credencial
- Clave pública
- Contador de firmas
- Metadatos del dispositivo
```

## Requisitos del Navegador

| Navegador | Versión Mínima | Soporte |
|-----------|---------------|---------|
| Safari | 14+ | ✅ Face ID / Touch ID |
| Chrome | 67+ | ✅ Huella Digital |
| Firefox | 60+ | ✅ WebAuthn |
| Edge | 79+ | ✅ Completo |

## Dispositivos Compatibles

### iOS (iPhone/iPad)
- Face ID (iPhone X y superior)
- Touch ID (iPhone 5s-8, iPad Air/Pro)
- Requiere iOS 14+ / iPadOS 14+

### Android
- Sensor de huella digital
- Reconocimiento facial seguro
- Requiere Android 7.0+

### Desktop
- Touch ID (MacBook Pro/Air con T1/T2 chip)
- Windows Hello (compatible)

## Instalación

### 1. Ejecutar Migración
```bash
# Aplicar esquema de base de datos
supabase db reset
supabase db push
```

### 2. Desplegar Edge Functions
```bash
# Desplegar funciones de autenticación
supabase functions deploy biometric-register
supabase functions deploy biometric-auth
supabase functions deploy biometric-verify
```

### 3. Variables de Entorno
```bash
# .env.local
SUPABASE_URL=tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-tu-key
RP_ID=localhost  # Cambiar a tu dominio en producción
```

## Uso en Producción

### Requisitos HTTPS
⚠️ **IMPORTANTE**: WebAuthn requiere conexión HTTPS en producción

```bash
# Dominio personalizado
RP_ID=novatec-admin.com

# Configuración en producción
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Configuración Dominios Permitidos
```javascript
// Supabase Dashboard
Authentication > Settings
Allowed Redirect URLs:
- https://tu-dominio.com/admin
- https://tu-dominio.com/admin/login
```

## API Reference

### Edge Functions

#### `POST /biometric-register`
Registra una nueva credencial biométrica
```json
// Request
{
  "email": "admin@novatec.com",
  "userName": "admin"
}

// Response
{
  "publicKeyCredentialCreationOptions": {...},
  "userId": "uuid"
}
```

#### `POST /biometric-auth`
Inicia proceso de autenticación
```json
// Request
{
  "email": "admin@novatec.com"
}

// Response
{
  "publicKeyCredentialRequestOptions": {...}
}
```

#### `POST /biometric-verify`
Verifica la autenticación biométrica
```json
// Request
{
  "email": "admin@novatec.com",
  "credential": {...}
}

// Response
{
  "success": true,
  "tempToken": "abc123...",
  "message": "Autenticación exitosa"
}
```

## Componentes React

### BiometricLogin
```tsx
import { BiometricLogin } from '@/components/auth/BiometricLogin'

<BiometricLogin 
  email={email} 
  onSuccess={() => navigate('/admin')} 
/>
```

### Props
| Prop | Tipo | Descripción |
|------|------|-------------|
| `email` | string | Correo del usuario (requerido) |
| `onSuccess` | function | Callback al autenticar exitosamente |

## Troubleshooting

### Problemas Comunes

1. **"Tu navegador no soporta autenticación biométrica"**
   - Actualizar navegador a versión reciente
   - Usar Safari/Chrome/Firefox/Edge

2. **"Error de seguridad en conexión HTTPS"**
   - WebAuthn requiere HTTPS en producción
   - Usar localhost para desarrollo

3. **"Sensor biométrico no disponible"**
   - Configurar Face ID / Touch ID en iOS
   - Registrar huella en Android

4. **"Autenticación cancelada"**
   - Usuario canceló el prompt
   - Timeout del sensor (5 minutos)

## Testing

### Pruebas Manuales
1. Registrar credencial biométrica
2. Intentar login con credencial válida
3. Intentar login con credencial inválida
4. Eliminar credencial y verificar

### Pruebas Unitarias
```typescript
// Tests pendientes de implementar
describe('Biometric Authentication', () => {
  test('should register biometric credential', async () => {})
  test('should authenticate with Face ID', async () => {})
  test('should reject invalid credentials', async () => {})
})
```

## Cumplimiento

- ✅ **GDPR**: Datos biométricos locales (no en servidor)
- ✅ **CCPA**: Sin almacenamiento de datos sensibles
- ✅ **WCAG 2.1**: Accesibilidad en componentes
- ✅ **FIDO2**: Estándar de autenticación abierta

## Licencia
MIT - Novatec Admin Panel 2026

## Soporte
Para reportar bugs o mejoras, contactar al equipo de desarrollo Novatec.
