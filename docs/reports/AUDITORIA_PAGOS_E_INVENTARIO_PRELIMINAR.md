# Informe Preliminar de Auditoría — Protocolo de Pagos y Gestión de Inventario
**Motor:** `agy-pilot converge` (Dual-Modelo: Gemini 3.8 Flash High + Claude Sonnet 4.6)  
**Proyecto:** Quirona Store  
**Fecha:** 11 de Octubre de 2026  
**Alcance Descubierto:** 40 archivos interconectados (23 cuadrantes, 20 cuadrantes completados antes de pausa programada)  

---

## 🏛️ Resumen Ejecutivo
Se ejecutó un barrido adversarial con delimitación de alcance inteligente tirando del hilo desde las semillas críticas de **Pagos** (`orders`, `orders/[id]`, `exchange-rate`, `CheckoutModal`) e **Inventario** (`products`, `products/[id]`, `AdminProductModal`, `AdminProductsTable`).

El escáner profundo generó candidatos y el auditor fiscal de solo-lectura (**Claude Sonnet 4.6**) validó **44 hallazgos** descartando falsos positivos.

---

## 📋 Catálogo de Hallazgos Verificados

### 1. 💳 Dominio: Protocolo de Pagos y Checkout

| ID | Archivo | Severidad | Descripción del Hallazgo |
| :--- | :--- | :--- | :--- |
| **SEC-11** | `AdminHeader.tsx` | Media | En `renderRateBadge`, evaluación estricta de estados de tasa con fallback a `MANUAL`. |
| **SEC-12** | `AdminHeader.tsx` | Baja | En `handleEditRateManual`, el catch ejecutaba cambio de estado sin persistencia confirmada. |
| **SEC-15** | `AdminOrdersTable.tsx` | Media | En el filtrado `filteredOrders`, comprobación de campos nulos en `customer.fullName` y `orderCode`. |
| **SEC-16** | `AdminOrdersTable.tsx` | Baja | Sanitización de número de WhatsApp para enlace `wa.me` eliminando guiones y espacios. |
| **SEC-32** | `CheckoutModal.tsx` | **Alta** | En `handleCreateOrder`, ante fallo de red se asignaba la orden localmente como exitosa, dando falsa confirmación al comprador. |
| **SEC-33** | `CheckoutModal.tsx` | Media | Falta de reseteo completo de estados de comprobante y pasos al cerrar y reabrir el modal. |
| **SEC-34** | `CheckoutModal.tsx` | Baja | En `handleCopy`, limpiar timeouts activos para evitar inconsistencias en feedback visual. |
| **SEC-35** | `CheckoutStepPayment.tsx` | Media | El botón "Volver a datos" debe estar deshabilitado mientras se envía una orden (`submittingOrder`). |
| **SEC-36** | `CheckoutStepPayment.tsx` | Baja | Atributo `type="button"` en selector de métodos para evitar submit accidental de formulario. |
| **SEC-37** | `CheckoutStepPayment.tsx` | **Alta** | Prevención de doble submit en el botón "Confirmar y Reportar Pago". |
| **SEC-38** | `CheckoutStepSuccess.tsx` | Baja | Formato de cantidades en la plantilla de mensaje pre-armado para WhatsApp. |
| **SEC-39** | `CheckoutStepSuccess.tsx` | Baja | Mapeo seguro de etiquetas de entrega (`retiro`, `delivery`, `nacional`). |
| **SEC-40** | `CheckoutStepSuccess.tsx` | Media | Sanitización de `activeWaNumber` con regex numérico antes de interpolar en enlace web. |
| **SEC-44** | `TopBar.tsx` | Baja | Sanitización y encodeURIComponent de parámetros en el enlace directo de WhatsApp. |

---

### 2. 📦 Dominio: Administración de Inventario y Catálogo

| ID | Archivo | Severidad | Descripción del Hallazgo |
| :--- | :--- | :--- | :--- |
| **SEC-01** | `api/products/route.ts` | **Alta** | En método `POST`, validar que el body sea un objeto estructurado válido y no nulo. |
| **SEC-02** | `api/products/route.ts` | Media | Generación de slug/id de producto con slugify seguro para prevenir colisiones o IDs vacíos. |
| **SEC-03** | `api/products/route.ts` | Media | Validación de `originalPriceUSD`: debe ser numérico positivo o undefined si es nulo. |
| **SEC-04** | `api/products/route.ts` | **Alta** | Validación de arrays: asegurar que `images` y `variants` tengan al menos 1 elemento y datos válidos. |
| **SEC-05** | `api/products/route.ts` | Media | Manejo del array `measurements` validando que las medidas coincidan con las tallas declaradas. |
| **SEC-09** | `catalogo/page.tsx` | Media | Manejo de estados de carga y error en la sincronización de productos del servidor. |
| **SEC-10** | `page.tsx` | Media | Manejo seguro si la respuesta de productos está vacía o si el endpoint retorna error 500. |
| **SEC-17** | `AdminProductModal.tsx` | Media | Selección automática de categoría por defecto al abrir modal si `category` está vacío. |
| **SEC-18** | `AdminProductModal.tsx` | Baja | Limpieza y reset de estados locales del formulario tras registrar un producto con éxito. |
| **SEC-19** | `AdminProductModal.tsx` | **Alta** | Deshabilitar botón de guardar durante carga/subida de imagen para evitar productos duplicados. |
| **SEC-20** | `AdminProductModal.tsx` | **Alta** | Validación en inputs de stock para evitar valores negativos (`stock < 0`). |
| **SEC-21** | `AdminProductModal.tsx` | Media | Validación condicional de tabla de medidas solo cuando la categoría tiene `hasMeasurements: true`. |
| **SEC-22** | `AdminProductModal.tsx` | Baja | Manejo e inclusión de campos opcionales `material` y `careInstructions`. |
| **SEC-23** | `AdminProductsTable.tsx` | Media | Fallback seguro de imagen cuando un producto no tenga imágenes (`product.images[0]`). |
| **SEC-24** | `AdminProductsTable.tsx` | Media | Verificación de seguridad en `product.variants.reduce(...)` si un producto no tiene variantes. |
| **SEC-25** | `CartDrawer.tsx` | Media | Fallback seguro para `item.productImage` en caso de que la imagen sea nula o ruta rota. |
| **SEC-26** | `CartDrawer.tsx` | Baja | Cierre del drawer del carrito al hacer clic en "Ver Catálogo". |
| **SEC-27** | `ProductModal.tsx` | **Alta** | Restablecer y validar el contador `quantity` contra el `stock` real de la variante activa. |
| **SEC-28** | `ProductModal.tsx` | **Alta** | Deshabilitar botón "Agregar al Carrito" si el stock de la variante seleccionada es 0. |
| **SEC-29** | `ProductModal.tsx` | Media | Fallback seguro para la imagen del producto al añadirlo al store del carrito. |
| **SEC-30** | `ProductModal.tsx` | Baja | Renderizado condicional de miniaturas solo si `product.images.length > 1`. |
| **SEC-31** | `ProductModal.tsx` | Media | Al cambiar de color en el selector, sincronizar automáticamente con una talla en stock. |

---

### 3. ⚙️ Dominio: Configuración de Tienda y Cuentas Bancarias

| ID | Archivo | Severidad | Descripción del Hallazgo |
| :--- | :--- | :--- | :--- |
| **SEC-06** | `api/site-config/route.ts` | Media | Captura segura de excepciones en parsing JSON del body en método `PUT`. |
| **SEC-07** | `api/site-config/route.ts` | Media | Validación estricta de estructura antes de actualizar la configuración de tienda. |
| **SEC-08** | `api/site-config/route.ts` | Media | Deep merge en `bankDetails` para evitar sobreescribir campos bancarios no enviados con undefined. |
| **SEC-41** | `Navbar.tsx` | Baja | Comparación exacta de ruta activa en enlaces de navegación. |
| **SEC-42** | `Navbar.tsx` | Baja | Reinicio de scroll al pulsar el logotipo de la marca. |
| **SEC-43** | `Navbar.tsx` | Baja | Formato y visualización del badge de prendas en carrito. |

---

## 📌 Próxima Sesión y Continuación
El estado de la memoria acumulativa y las firmas de los 44 bugs quedan resguardados. En la próxima sesión podemos:
1. Reanudar el barrido en los cuadrantes restantes (**Q21, Q22 y Q23**).
2. O proceder directamente con la **fase de cirugía y parches automáticos** sobre los hallazgos de alta prioridad (**SEC-01, SEC-04, SEC-19, SEC-20, SEC-27, SEC-28, SEC-32, SEC-37**).
