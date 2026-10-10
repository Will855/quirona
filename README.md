# 🛍️ Quirona Store

![Banner Quirona](https://via.placeholder.com/1200x400/DAD6BB/661716?text=Quirona+Store+-+Boutique+Retro)

Quirona Store es un e-commerce boutique con una estética retro-vintage pop y streetwear. Destaca por su experiencia visual interactiva (incluyendo elementos 3D) y un sistema de checkout asistido con moneda dual (USD/VES en tiempo real).

---

## ✨ Características Principales

- **Experiencia 3D Interactiva**: Hero section inmersivo construido con Three.js.
- **Catálogo de Moda**: Soporte avanzado para variantes de productos (talla, color) y control de stock independiente.
- **Checkout Asistido e Inteligente**: Flujo de pago manual guiado y conectado a WhatsApp, sin comisiones de pasarelas externas.
- **Moneda Dual Automática**: Precios base en USD con conversión automática a moneda local en base a la tasa del día.
- **Diseño Retro Pop**: Paleta cálida (Sage Sand, Star Yellow, Deep Burgundy) y tipografías vintage de alto contraste.

---

## 🛠️ Tecnologías y Arquitectura

El proyecto está construido con un stack moderno y escalable enfocado en rendimiento y experiencia de usuario:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Componentes**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Experiencia 3D**: [Three.js](https://threejs.org/)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand)
- **Iconografía & Animaciones**: [Lucide React](https://lucide.dev/), Canvas Confetti
- **Lenguaje**: TypeScript

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

3. Configura las variables de entorno:
   Crea un archivo `.env.local` basado en `.env.example` y añade tus credenciales.

4. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
   El proyecto estará disponible en `http://localhost:3000`.

---

## 🎨 Sistema de Diseño

- **Primary (Star Yellow)**: `#FFDD48`
- **Deep Contrast (Dark Burgundy)**: `#661716`
- **Background (Sage Sand)**: `#DAD6BB`
- **Surface (Soft Butter Cream)**: `#FFECB9`

---

*Desarrollado para ofrecer la mejor experiencia boutique de moda online.*
