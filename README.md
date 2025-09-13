# MULTISERVICIOS

Plataforma web para gestión de productos, clientes y financiamiento, con panel administrativo seguro y landing moderna. Desarrollada con Next.js, Prisma y Tailwind CSS, lista para producción en Vercel y base de datos Neon Postgres.

---

## Descripción General

MULTISERVICIOS es una solución integral para empresas que buscan presentar sus servicios y gestionar productos, clientes y ventas desde un panel privado. Incluye autenticación básica, animaciones modernas, catálogo visual y scripts de seed para datos iniciales.

---

## Funcionalidades

- **Landing Page**: Hero animado, métricas, CTAs, secciones de productos, beneficios, préstamos, testimonios y contacto.
- **Catálogo de Productos**: Tarjetas uniformes, imágenes reales, categorías asociadas.
- **Panel de Administración**: CRUD de productos, categorías, clientes, métodos de financiamiento y ventas. Exportación CSV/JSON, subida de imágenes, tabs organizados.
- **Autenticación**: Login con cookie de sesión, protección de rutas admin, logout seguro.
- **Subida de Archivos**: Imágenes por producto, almacenamiento local (migrable a S3).
- **Contacto**: Formulario simulado, botón WhatsApp, horarios y medios de contacto.
- **Seeding**: Scripts para poblar productos, clientes y financiamiento.

---

## Tecnologías Utilizadas

### Core
- **Next.js 15** (App Router, API Routes, Middleware)
- **TypeScript**
- **Node.js**
- **Vercel** (deploy serverless)
- **pnpm** (gestor de paquetes)

### Base de Datos / ORM
- **PostgreSQL** (Neon)
- **Prisma ORM** (`@prisma/client`, `prisma` CLI)
- **Migraciones Prisma**
- **Scripts de seed** (`tsx`)

### UI / Estilos
- **Tailwind CSS 4.x**
- **Radix UI Primitives**
- **lucide-react** (íconos)
- **Animaciones personalizadas**
- **class-variance-authority**, **tailwind-merge**
- **PostCSS**, **Autoprefixer**

### Formularios y Validación
- **React Hook Form**
- **Zod**
- **@hookform/resolvers**

### Utilidades y Otros
- **date-fns**
- **clsx**
- **embla-carousel-react**
- **recharts**
- **cmdk**
- **input-otp**
- **react-resizable-panels**
- **vaul**
- **sonner**
- **geist**

### Autenticación y Seguridad
- **Cookie HTTPOnly**
- **Middleware Next.js**
- **Endpoints login/logout**

### Subida de Archivos
- **FormData**
- **Almacenamiento local en `/public/uploads`**

---

## Estructura del Proyecto

```
app/
  admin/
  api/
  productos/
  login/
components/
  ui/
  ...
hooks/
lib/
prisma/
  migrations/
  seed*.ts
public/
  uploads/
styles/
```

---

## Instalación y Deploy

1. **Clona el repositorio**
2. **Configura la base de datos**
   - Crea una base en Neon/Postgres
   - Copia la URL en `.env`:
     ```
     DATABASE_URL=postgresql://usuario:password@host:puerto/db?sslmode=require
     ```
3. **Instala dependencias**
   ```sh
   pnpm install
   ```
4. **Genera Prisma Client y aplica migraciones**
   ```sh
   pnpm prisma generate
   pnpm prisma migrate deploy
   ```
5. **Siembra datos iniciales (opcional)**
   ```sh
   pnpm prisma:seed
   pnpm prisma:seed:products
   pnpm prisma:seed:clients
   pnpm prisma:seed:financing-sales
   ```
6. **Inicia en desarrollo**
   ```sh
   pnpm dev
   ```
7. **Build y deploy en Vercel**
   - El build ejecuta automáticamente `prisma generate` y `prisma migrate deploy`.
   - Configura `DATABASE_URL` en Vercel (Project Settings > Environment Variables).

---

## Seguridad y Consideraciones

- El panel admin está protegido por middleware y cookie de sesión.
- No se usa JWT ni hashing de contraseñas (recomendado para producción).
- Subida de archivos es local; para producción usar S3/Cloudinary.
- Seeds no se ejecutan automáticamente en deploy.

---

## Mejoras Futuras

- Hashing de contraseñas y roles.
- Paginación y filtros avanzados.
- Migrar imágenes a almacenamiento externo.
- Tests unitarios/integración.
- Internacionalización.
- Mejorar seguridad (CSRF, SameSite, rate limiting).

---

## Licencia

MIT

---

## Autor

Desarrollado por mgaDesarrollo y colaboradores.
