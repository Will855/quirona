# Quirona Store — Workspace Rules

## 1. UI Guidelines & Clean Aesthetic
- **PROHIBIDO EL USO DE EMOJIS O ICONOS DE ESTRELLAS**:
  - No usar emoticonos de estrellas (`✨`, `⭐`, `🌟`, `★`, `☆`, `✦`, `✧`) en textos, botones, badges, cabeceras, pie de página ni mensajes automáticos de WhatsApp.
  - No incluir iconos genéricos de destellos o estrellas como `<Sparkles />` de `lucide-react`.
  - Mantener la interfaz limpia, sobria, moderna y profesional con tipografía cuidada y bordes retro.
- **Iconografía permitida y recomendada**:
  - Compra / Carrito: `<ShoppingBag />`, `<ArrowRight />`
  - Envíos / Entrega: `<Truck />`
  - Verificación / Estados: `<CheckCircle2 />`, `<Clock />`, `<AlertTriangle />`
  - Medidas / Garantía: `<Ruler />`, `<ShieldCheck />`

## 2. Paleta Oficial Retro
- Primario / Amarillo estrella: `#FFDD48`
- Vino tinto / Borgoña oscuro: `#661716`
- Fondo neutro arena cálido: `#DAD6BB`
- Crema mantequilla para cards y modales: `#FFECB9`

## 3. Comportamientos Críticos
- La cantidad en el modal de producto siempre debe inicializarse en `1` por defecto.
- Los pedidos deben enviarse al backend (`/api/orders`) y reflejarse en el panel `/admin`.
- La tasa de cambio debe sincronizarse en tiempo real desde la API (`/api/exchange-rate`).
- La estrella 3D con Three.js se deja para el final por petición expresa del usuario.
