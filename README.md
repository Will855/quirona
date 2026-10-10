# 🛍️ Quirona Store

![Banner Quirona](https://via.placeholder.com/1200x400/DAD6BB/661716?text=Quirona+Store+-+Boutique+Retro)

Quirona Store es un e-commerce boutique con una estética retro-vintage pop y streetwear. Destaca por su experiencia visual interactiva (incluyendo elementos 3D) y un sistema de checkout asistido con moneda dual (USD/VES en tiempo real).

---

## 3. Patrones Arquitectónicos y de Diseño

### 3.1 Patrones Arquitectónicos
El proyecto sigue una arquitectura **Serverless y Monolito Modular** utilizando Next.js 15 (App Router). 
- **SSR / SSG**: Aprovecha Server Components para mejorar el SEO y rendimiento.
- **API Routes**: Utiliza Route Handlers nativos como capa de backend.

### 3.2 Patrones de Diseño
Se implementaron patrones clave para mantener el código limpio y escalable:
- **State Store (Zustand)**: Patrón de almacén centralizado para el carrito.
- **Custom Hooks**: Abstracción de lógica compleja de Three.js y conversiones de moneda.
- **Componentes Compuestos**: Reutilización de elementos de la interfaz de usuario.

---

## 4. Flujo de Datos y Componentes Principales
El flujo principal (Data Flow) se organiza en torno a la experiencia de compra:
1. **Catálogo y Productos**: Next.js lee la información desde el servidor (JSON local o Supabase) y la hidrata en el cliente.
2. **Interactividad 3D**: React Three Fiber toma el control del Hero Section interactuando independientemente del DOM principal para mantener 60 FPS.
3. **Gestión de Carrito**: El Zustand Store guarda las preferencias y sincroniza con `localStorage`.

---

## 5. Consideraciones de Seguridad y Buenas Prácticas
Para asegurar transacciones e información:
- **Sanitización de Datos**: Todos los parámetros de URL y formularios (ej. búsqueda y checkout) son validados.
- **Protección de API**: Rutas protegidas contra abusos de peticiones masivas.
- **Validación Manual Inteligente**: Al no usar pasarela externa, se evitan ataques de tarjetas robadas; la verificación se hace 1 a 1 vía captura en WhatsApp protegida criptográficamente en el panel.

---

## 6. Despliegue e Infraestructura CI/CD
El sistema está desplegado en Vercel con un flujo automatizado (CI/CD) conectado a GitHub:
- **GitHub Actions / Vercel Builds**: Despliegue automático al fusionar en `main`.
- **Caché Distribuido**: Optimización extrema de imágenes y caché ISR de Next.js.
- **Variables de Entorno seguras**: Integradas en la consola de despliegue para evitar filtraciones.

---

## 🚀 Instalación y Desarrollo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Will855/quirona.git
   ```
2. Instala dependencias con `pnpm install` y corre `pnpm dev`.
