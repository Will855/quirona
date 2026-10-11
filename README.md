# Quirona Store
*E-commerce boutique con experiencia inmersiva tridimensional y flujo transaccional multimoneda.*

---

## 1. Visión General
Quirona Store es una plataforma de comercio electrónico orientada a la comercialización de indumentaria urbana bajo una identidad visual retro-vintage. El sistema combina una experiencia de usuario interactiva mediante gráficos 3D en tiempo real con una arquitectura diseñada para operar con moneda dual (USD y moneda local VES).

El desarrollo abarcó la arquitectura integral de la solución, desde el modelado de la interfaz y la integración gráfica con Three.js, hasta la gestión de estado reactivo y la infraestructura de despliegue continuo.

---

## 2. El Problema de Negocio
El comercio digital de marcas boutique suele enfrentar dos fricciones principales:
- Falta de diferenciación de marca: Las plantillas estándar de comercio electrónico ofrecen experiencias planas que no transmiten la identidad estética de marcas de diseño independiente.
- Fricción transaccional multimoneda: En economías con dinámicas cambiarias fluctuantes, los catálogos estáticos no reflejan de forma transparente la conversión de precios ni facilitan un cierre de venta ágil.

El desafío consistió en diseñar una aplicación con tiempos de carga inferiores a un segundo, que integrara renderizado tridimensional interactivo sin degradar el rendimiento en dispositivos móviles y ofreciera un flujo de compra asistido.

---

## 3. Arquitectura y Stack Tecnológico
La solución implementa una arquitectura moderna sobre Next.js 15 bajo el paradigma App Router, priorizando el renderizado híbrido para optimizar la velocidad de entrega y la indexación en motores de búsqueda.

- Frontend y Renderizado: Next.js 15, React 19, TypeScript y Tailwind CSS. La separación entre Server Components y Client Components permite despachar el catálogo con cero sobrecarga de JavaScript antes de hidratar los módulos interactivos.
- Gráficos 3D: Three.js para la manipulación y renderizado de geometrías interactivas en la sección principal, desacopladas del ciclo de vida del DOM tradicional para sostener 60 FPS estables.
- Gestión de Estado: Zustand para el control centralizado del carrito de compras con persistencia en almacenamiento local (LocalStorage).
- Infraestructura y Despliegue: Vercel con integración continua (CI/CD) conectada a GitHub, distribución perimetral y optimización automática de activos estáticos.

### Flujo de Datos
```
[Catálogo Server Components] ---> [Hidratación React 19] ---> [Zustand Store (Carrito)] ---> [Checkout Asistido]
                                           |
                                  [Canvas 3D Three.js]
```

---

## 4. Funcionalidades Principales
- Renderizado 3D Interactivo: Elementos tridimensionales con iluminación dinámica y respuesta fluida a eventos de puntero y gestos táctiles.
- Carrito de Compras Reactivo: Almacén global desacoplado que gestiona adición, remoción, cantidades y cálculo automático de totales en memoria.
- Cotización Dinámica Multimoneda: Conversión de precios en tiempo real para transparentar el costo final de los productos.
- Flujo de Checkout Asistido: Canalización estructurada del resumen de compra hacia mensajería directa para minimizar la tasa de abandono de carritos.
- Diseño Defensivo y Tipado Estricto: Validación exhaustiva de propiedades de producto y tipado estricto para prevenir excepciones en tiempo de ejecución.

---

## 5. Decisiones Técnicas y Desafíos Superados
- Rendimiento en Gráficos WebGL: La ejecución de motores 3D en dispositivos móviles puede generar cuellos de botella en el hilo principal. Se optimizó el bucle de renderizado limitando la tasa de refresco condicionalmente y reduciendo la complejidad poligonal de las geometrías según el dispositivo del usuario.
- Adopción de Zustand frente a Redux: Para un e-commerce ágil, Redux introducía código repetitivo innecesario y mayor peso al paquete final. Zustand permitió un manejo de estado atómico, minimalista y con menor consumo de memoria.
