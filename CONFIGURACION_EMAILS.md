# 📧 Configuración de Emails - Sistema de Registro

## ✅ Sistema Implementado

El sistema de registro ahora incluye:

1. **Notificaciones automáticas por email:**
   - Email de confirmación al registrarse
   - Email con credenciales al ser aprobado
   - Email de notificación al ser rechazado

2. **Creación automática de usuarios:**
   - Al aprobar un registro, se crea automáticamente el usuario en la base de datos SQL
   - Se genera una contraseña temporal aleatoria
   - El usuario recibe sus credenciales por email

## 🔧 Configuración de SMTP

### Opción 1: Gmail (Recomendado para desarrollo)

1. **Habilitar verificación en 2 pasos:**
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos → Activar

2. **Crear contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "Terminales Misiones"
   - Copia la contraseña generada (16 caracteres)

3. **Configurar variables de entorno:**
   ```bash
   # En server/.env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # La contraseña de aplicación
   APP_URL=http://localhost:8080
   ```

### Opción 2: Otros proveedores SMTP

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu_email@outlook.com
SMTP_PASS=tu_contraseña
```

**SendGrid (Producción):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu_api_key_de_sendgrid
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASS=tu_contraseña_mailgun
```

## 🚀 Cómo Activar

1. **Crea el archivo `.env`:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edita `.env` con tus credenciales:**
   ```bash
   notepad .env  # En Windows
   # o
   nano .env     # En Linux/Mac
   ```

3. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

4. **Verifica la conexión:**
   - Al iniciar el servidor, deberías ver:
     ```
     ✅ Email server is ready
     ```
   - Si ves un error, revisa tus credenciales

## 📝 Flujo de Emails

### 1. Usuario se registra
- **Email enviado a:** Usuario
- **Asunto:** "Solicitud de Registro Recibida"
- **Contenido:** Confirmación de que su solicitud está siendo revisada

### 2. Admin aprueba
- **Email enviado a:** Usuario
- **Asunto:** "✅ Solicitud Aprobada - Acceso al Panel"
- **Contenido:** 
  - Credenciales de acceso (email + contraseña temporal)
  - Link directo al panel de login
  - Recomendación de cambiar contraseña

### 3. Admin rechaza
- **Email enviado a:** Usuario
- **Asunto:** "Actualización sobre tu Solicitud"
- **Contenido:** 
  - Notificación de rechazo
  - Motivo (si se especificó)

## 🧪 Pruebas

1. **Registrarse:**
   - Ve a `/register`
   - Completa el formulario con tu email real
   - Revisa tu bandeja de entrada

2. **Aprobar:**
   - Login como admin
   - Ve a "Registros Pendientes"
   - Aprueba la solicitud
   - Revisa el email con las credenciales

3. **Login con credenciales:**
   - Usa el email y la contraseña temporal recibida
   - Deberías poder acceder al panel

## ⚠️ Notas Importantes

1. **Sin SMTP configurado:**
   - El sistema funciona igual
   - Los emails NO se envían
   - Verás en consola: `⚠️ Email not sent (SMTP not configured)`

2. **Producción:**
   - Usa un servicio profesional (SendGrid, Mailgun, AWS SES)
   - No uses Gmail para producción (límites de envío)

3. **Seguridad:**
   - NUNCA subas el archivo `.env` a Git
   - Ya está en `.gitignore`
   - Usa variables de entorno en tu servidor de producción

## 🔐 Seguridad de Contraseñas

- Las contraseñas temporales son aleatorias (16 caracteres hex)
- Se hashean con bcrypt antes de guardar
- El usuario debería cambiar su contraseña después del primer login
- (Opcional: Puedes agregar un flujo de "cambio obligatorio de contraseña")

## 📊 Base de Datos

Los usuarios aprobados se guardan en la tabla `users`:
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  terminal_id TEXT,
  city TEXT,
  position TEXT,
  company_name TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);
```

## 🆘 Troubleshooting

**Error: "Invalid login"**
- Verifica que SMTP_USER y SMTP_PASS sean correctos
- Para Gmail, asegúrate de usar contraseña de aplicación

**Emails no llegan:**
- Revisa spam/correo no deseado
- Verifica que el email del usuario sea válido
- Revisa los logs del servidor

**"Connection timeout":**
- Verifica tu firewall
- Algunos ISP bloquean el puerto 587
- Intenta con puerto 465 (secure: true)

## 📞 Soporte

Si tienes problemas, revisa:
1. Los logs del servidor (consola donde corre `npm run dev`)
2. El archivo `.env` (credenciales correctas)
3. La configuración de tu proveedor de email
