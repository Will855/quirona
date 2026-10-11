# Quirona Store - Arquitectura e Ingenieria

Plataforma de catalogo y checkout interactivo construida sobre Next.js 15 y React 19, integrando un motor grafico WebGL en tiempo real (Three.js), gestion de estado atomico en memoria (Zustand) y canalizacion asincrona de ordenes mediante Serverless Route Handlers.

---

## 1. Arquitectura del Sistema

La aplicacion implementa el paradigma App Router de Next.js 15, estableciendo una separacion estricta entre React Server Components (RSC) y Client Components para minimizar el First Contentful Paint (FCP) y eliminar sobrecarga de JavaScript en el hilo principal:

- Server-First Boundaries: Las vistas de catalogo y las capas de metadata se resuelven en el servidor, despachando HTML estatico con cero bloqueo de ejecucion en el cliente.
- Client Boundaries Aislados: La interactividad (motor 3D, drawer del carrito, selector de variantes) queda encapsulada en componentes delimitados mediante `'use client'`, evitando re-renderizados en cascada en el arbol DOM principal.
- Route Handlers Modulares: Endpoints RESTful nativos (`/api/orders`, `/api/products`, `/api/exchange-rate`) para procesamiento transaccional en entorno Serverless.

```text
[Browser Client]
   |-- DOM Tree (React 19 RSC)
   |-- WebGL Viewport (Three.js Canvas / requestAnimationFrame Loop)
   +-- Store Reactivo (Zustand + LocalStorage Sync)
          |
          v (JSON payload / HTTP POST)
[Next.js Route Handlers] ---> [Dispatcher de Ordenes] (Async Fire-and-Forget)
          |
          v
[Motor de Persistencia & Normalizacion de Precios]
```

---

## 2. Motor Grafico 3D y Fisica de Interaccion

La interfaz integra una capa WebGL interactiva basada en Three.js puro, optimizada para sostener 60 FPS estables en un rango heterogeneo de GPUs (dispositivos moviles y de escritorio).

### Modelo Fisico y Amortiguacion Angular
- Inercia y Arrastre: Algoritmo de rotacion basado en velocidad angular acumulada (`dragVelocityX`, `dragVelocityY`) con factor de amortiguacion exponencial (`velocity *= 0.92`). Al cesar la interaccion de puntero, el modelo desacelera de manera continua hasta alcanzar reposo sin cortes discretos.
- Amortiguacion Suave (Slerp): La reorientacion hacia la pose de reposo utiliza interpolacion esferica lineal para evitar artefactos de Gimbal Lock.
- Presupuesto de Cuadros (Frame Budget): Ejecucion ligada a `requestAnimationFrame` con cancelacion explicita en el desmontaje (`cancelAnimationFrame`), garantizando cero consumo de CPU cuando el componente no esta visible.

### Gestion de Memoria WebGL
Para evitar fugas de memoria VRAM en navegadores moviles:
- Eliminacion Recursiva de Recursos: Rutina de desmontaje que ejecuta `.dispose()` secuencialmente sobre geometrias, materiales y texturas.
- Control de Densidad de Pixeles: Limite estricto de `pixelRatio` a un maximo de 2.0 (`Math.min(window.devicePixelRatio, 2)`), impidiendo sobrecarga de fragment shaders en pantallas de ultra alta resolucion.

---

## 3. Gestion de Estado y Transaccionalidad Multimoneda

El flujo de compra depende de un almacen global implementado con Zustand, desacoplado del ciclo de vida de los componentes de UI.

### Normalizacion y Manejo de Moneda Dual
- Precision Decimal: Los calculos de conversion cambiaria entre USD y moneda local operan normalizando montos a enteros en centavos antes de formatear, eliminando errores de redondeo por coma flotante IEEE 754.
- Reactividad Atomica: Suscripciones atomicas (`useCartStore((state) => state.items)`) para asegurar que solo los componentes que renderizan el contador de items o el subtotal respondan a mutaciones de estado, manteniendo inmunes las listas de productos.
- Sincronizacion de Almacenamiento: Persistencia reactiva en `LocalStorage` con migracion controlada de esquemas para preservar el estado de la sesion del usuario frente a recargas de pagina.

---

## 4. Concurrencia y Despacho de Eventos

El cierre de compra canaliza la orden hacia un flujo asincrono no bloqueante:
- Sanitizacion en Capa de Servidor: Validacion de carga util (payload) en los Route Handlers para garantizar la consistencia de los datos del pedido antes de generar el despacho.
- Tolerancia a Fallos de Red: Si la conexion del cliente presenta latencia, la orden retiene un estado transitorio en el store local con politica de reintento idempotente antes de alertar al usuario.
- Despacho Ligero: Redireccion estructurada del resumen de compra con codificacion URI segura para apertura instantanea en canales de mensajeria asistida.

---

## 5. Optimizacion y Metricas de Rendimiento

- Code Splitting Dinamico: Carga diferida (`dynamic(() => import(...), { ssr: false })`) del motor Three.js, reduciendo el tamano del bundle inicial de JavaScript en mas de 140 KB.
- Compresion de Texturas y Activos: Activos visuales servidos en formatos modernos (WebP/AVIF) con cache inmutable a nivel de borde (Edge CDN).
- Cumulative Layout Shift (CLS = 0): Contenedores del canvas y de las tarjetas de catalogo dimensionados con aspect-ratio explicito en CSS para prevenir saltos visuales durante la carga asincrona.
