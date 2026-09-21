---
name: clean-ui-styling
description: >-
  Strict UI styling guideline to prevent decorative star emojis (✨, ⭐, 🌟, ★) and sparkle icons across components, keeping the interface sober, polished, and professional.
---

# Clean UI Styling Guideline (No Star Emojis / Sparkles)

This skill enforces strict UI cleanliness for Quirona Store and eliminates the repetitive insertion of decorative star emojis and sparkle icons.

## Prohibited Elements in UI Components
- **NO Star Emojis**: Never use `✨`, `⭐`, `🌟`, `★`, `☆`, `✦`, `✧` in titles, subtitles, badges, action buttons, topbars, footers, or WhatsApp prefilled messages.
- **NO Generic Sparkles Icons**: Avoid importing and placing Lucide `<Sparkles />` (or similar 4-point star icons) indiscriminately across UI blocks.
- **Rationale**: Overuse of star icons creates visual noise, reduces readability, and clashes with a refined boutique streetwear aesthetic.

## Approved UI Conventions
- **Badges**: Use clean typographical pills with retro borders (e.g. `Nuevo`, `Top Ventas`, `Edición Limitada`).
- **Action Buttons**: Use contextually meaningful icons:
  - `<ShoppingBag />` for purchasing / adding to cart.
  - `<ArrowRight />` for navigation links.
  - `<Eye />` for previewing product details.
  - `<Truck />` for delivery and shipment information.
- **Status Indicators**: Use `<CheckCircle2 />`, `<AlertTriangle />`, `<Clock />`, or `<Truck />`.
- **Trust Elements**: Use `<Ruler />`, `<ShieldCheck />`, `<Truck />`, or `<Heart />`.
