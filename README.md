# Posada Abuela Emilia

Sitio de la posada (Next.js 16) con panel de administración. Base de datos y fotos en **Supabase**, hosting en **Vercel**.

- **Sitio público** (`/`): una sola página estática, muy rápida. Se regenera sola cada vez que se guarda algo en el panel.
- **Panel** (`/admin`): departamentos (datos y fotos), fotos del sitio (portada, espacios compartidos, Nosotros) y consultas de reserva.
- **Formulario de reserva**: abre WhatsApp con el mensaje armado **y** guarda la consulta en la base (se ve en el panel).

## Puesta en marcha (una sola vez)

### 1. Fotos
Las fotos del sitio anterior ya vienen incluidas y optimizadas en `public/img/` (fachada, espacios, departamentos A, B, C, D, E y F, Susana y Daniel, termas, Molino Forclaz, Paseo del Mate) junto con los logos.

**Opcional:** el sitio actual (2026) tiene además 8 fotos nuevas del departamento A y 5 del B. Para sumarlas, antes de apagar el WordPress: clic derecho en `descargar-imagenes.ps1` → **Ejecutar con PowerShell**, hacer commit + push, y después correr `supabase/seed-fotos-2026.sql` en Supabase. También se pueden subir a mano desde el panel.

### 2. Supabase
1. Crear un proyecto en https://supabase.com (región São Paulo).
2. **SQL Editor → New query**: pegar y correr `supabase/schema.sql`.
3. Otra query: correr `supabase/seed.sql` (carga los 6 departamentos con sus fotos y las tarjetas de San José).
   - **Si ya tenías la base creada antes de la sección San José editable**: correr solo `supabase/migracion-san-jose.sql`.
4. **Authentication → Users → Add user**: email + contraseña de los dueños (marcar *Auto Confirm User*).
5. Correr `supabase/admin.sql` cambiando el email por el del paso anterior.
6. **Project Settings → API**: copiar *Project URL* y *anon public key*.

### 3. GitHub + Vercel
```
git init
git add -A
git commit -m "Sitio Posada Abuela Emilia"
git branch -M main
git remote add origin https://github.com/USUARIO/posada-abuela-emilia.git
git push -u origin main
```
En Vercel: **Add New → Project → Import** el repo, y en **Environment Variables**:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://posadaabuelaemilia.com.ar` |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp de la posada. Si no se carga, usa el del cartel: `5491168225708` (011 6822-5708) |

**Deploy.** Si cambiás una variable después, hay que hacer **Redeploy** (las `NEXT_PUBLIC_` se graban al compilar).

### 4. Dominio
Vercel → proyecto → **Settings → Domains** → agregar `posadaabuelaemilia.com.ar` y `www.posadaabuelaemilia.com.ar`, y seguir las instrucciones de DNS.

## Uso del panel
Entrar a `/admin` con el usuario creado.
- **Departamentos**: tocar uno → subir fotos (se pueden elegir varias juntas, se achican solas a WebP), ordenarlas con ← →, ★ para elegir la portada, ✕ para borrar. Debajo: nombre, capacidad, descripción, características y si está visible.
- **Fotos del sitio**: foto de portada, espacios compartidos (la descripción de cada foto se muestra como título) y la foto de Nosotros.
- **San José**: título de la sección y sus tarjetas (foto, texto y link opcional). Se agregan, ordenan con ↑ ↓, ocultan o eliminan.
- **Consultas**: las reservas que llegan por el formulario, con botón para responder por WhatsApp y marcar como atendida.

Todo cambio se publica en el sitio al instante.

## Personalizar
- **Colores**: tomados del logo (verde `#00443A` y naranja `#BC580C`), en las variables al principio de `app/globals.css`.
- **Logos**: `public/img/logo-horizontal.webp` (fondos claros), `logo-blanco.webp` (fondos oscuros) e `isotipo.webp`; el favicon es `app/icon.png`.
- **Textos fijos** (bienvenida): `app/(sitio)/page.tsx`. La sección San José se edita desde el panel.
- **Dirección, horarios, estadía mínima, Facebook**: `lib/site.ts`.

## Desarrollo
```
npm install
npm run dev
```
Sin las variables de Supabase el sitio funciona en **modo demo** con los datos de `lib/datos-iniciales.ts` (el panel queda deshabilitado).
