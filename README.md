# 🛍️ Quirona Store

![Banner Quirona](https://via.placeholder.com/1200x400/DAD6BB/661716?text=Quirona+Store+-+Boutique+Retro)

Quirona Store es un e-commerce boutique con una estética retro-vintage pop y streetwear. Destaca por su experiencia visual interactiva (incluyendo elementos 3D) y un sistema de checkout asistido con moneda dual (USD/VES en tiempo real).

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura moderna basada en la nube y Serverless, diseñada para máxima velocidad y SEO:

- **Core & Enrutamiento:** Construido sobre **Next.js 15 (App Router)** utilizando Server Components y Server Actions para reducir la carga de JavaScript en el cliente.
- **Capa de Datos:** Sistema de almacenamiento híbrido. Uso de **Route Handlers (API REST nativa)** para la gestión de productos y stock temporal, preparado para escalar a **Supabase (PostgreSQL)**.
- **Gestor de Estado Global:** Carrito de compras y preferencias de usuario gestionados a través de **Zustand** con middleware de persistencia en `localStorage`.
- **Capa de Presentación 3D:** Motor WebGL integrado mediante **Three.js** (`@react-three/fiber`) dentro del ciclo de vida de React, aislado en el Hero Section para no comprometer el rendimiento.
- **Sistema de Moneda:** Conversor dinámico de tasas (USD/VES) que afecta globalmente al catálogo y calcula totales de checkout al instante.

---

## 💻 Mi rol como Fullstack Developer

Fui responsable de desarrollar el flujo de extremo a extremo, abarcando desde la UI hasta la lógica de negocio:

- **Desarrollo Frontend & 3D:** 
  - Diseñé y maqueté la interfaz completa usando **Tailwind CSS**, enfocándome en la identidad visual "retro-pop" solicitada por la marca.
  - Implementé el modelo 3D interactivo (*puffy star*) en el Hero utilizando **Three.js** y React Three Fiber.
- **Lógica de E-commerce:** 
  - Programé el catálogo con soporte de variantes complejas (Talla + Color) y control estricto de inventario por variante.
  - Desarrollé el flujo del carrito y la persistencia de datos del usuario con **Zustand**.
- **Backend y Panel de Control:** 
  - Creé un sistema de checkout híbrido que procesa órdenes y redirige automáticamente a WhatsApp con el formato de reporte de pago.
  - Diseñé un panel de administración para gestionar stock, productos y la tasa de cambio diaria.

---

## ⚙️ Mi rol como DevOps & Infraestructura

Garantice la escalabilidad, despliegue continuo y estabilidad de la aplicación en producción:

- **CI/CD & Despliegues:** 
  - Configuración del pipeline de despliegue automatizado hacia **Vercel** conectado directamente a la rama `main` de GitHub.
- **Optimización de Caché y Rendimiento:** 
  - Aprovechamiento del sistema de caché estático y dinámico de Next.js para renderizar los productos instantáneamente sin saturar la base de datos.
- **Manejo de Entornos y Seguridad:** 
  - Configuración de variables de entorno (.env) para separar entornos de desarrollo y producción.
  - Sanitización de rutas y estructuración limpia del control de versiones (Git) evitando la exposición de claves maestras o tokens sensibles.

---

## ✨ Características Principales

- **Experiencia 3D Interactiva**: Hero section inmersivo construido con Three.js.
- **Catálogo de Moda**: Soporte avanzado para variantes de productos (talla, color) y control de stock independiente.
- **Checkout Asistido e Inteligente**: Flujo de pago manual guiado y conectado a WhatsApp.
- **Moneda Dual Automática**: Precios base en USD con conversión automática a moneda local en base a la tasa del día.

---

## 🚀 Instalación y Desarrollo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Will855/quirona.git
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
