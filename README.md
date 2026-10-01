# Duoc Pick Up PAO — maqueta

App para pedir en las tiendas de la universidad desde la sala de clases y retirar sin hacer fila.
Esta versión es una **maqueta funcional**: no tiene base de datos, todo se guarda en el navegador (localStorage).

## Qué incluye

- **Ingreso** con nombre y correo (sin contraseña, es demo).
- **Plaza**: mapa ilustrado con los 3 locales y tiempo de espera estimado.
  - ☕ Cofemarket — café y pan
  - 🌽 Achoclonados — almuerzos
  - 🍭 Paraíso — dulces y snacks
- **Menú por local** con categorías y carrito (puede mezclar locales: se genera un voucher por local).
- **Hora de retiro**: lo antes posible, en 15/30 min o a una hora específica.
- **Pago en el local** + **voucher** con QR y código `PAO-XXXX`, con seguimiento del estado.
- **Modo Local** (`/#/local`): vista del personal de la tienda para ver la cola de pedidos,
  marcarlos como "en preparación" / "listo" y **validar el código** al cobrar y entregar.

## Cómo hacer la demo

1. Abre la app y entra con cualquier nombre/correo.
2. Desde Perfil → "Abrir Modo Local" (se abre en otra pestaña del mismo navegador).
3. Haz un pedido en la pestaña del alumno: aparece en vivo en el Modo Local.
4. En el Modo Local escribe el código del voucher y presiona "Cobrar y entregar":
   el voucher del alumno se marca como RETIRADO.

> La sincronización en vivo funciona entre pestañas **del mismo navegador** (no entre dos celulares),
> porque aún no hay backend. Eso llega en la fase 2.
> En Perfil se puede activar/desactivar la simulación automática del avance del pedido.

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. Sube este repo a GitHub.
2. En vercel.com → "Add New Project" → importa el repo.
3. Vercel detecta Vite automáticamente (build: `npm run build`, output: `dist`). Deploy.

## Fase 2 (versión real) — propuesta

- Backend + base de datos (ej. Supabase): pedidos reales sincronizados entre celulares.
- Login con correo institucional (link mágico / Google Workspace de la universidad).
- Panel de cada local para editar menú, precios, stock y horario; marcar productos agotados.
- Notificación push cuando el pedido está listo.
- Escaneo del QR con la cámara en el Modo Local.
- Pago en línea opcional (Webpay / Mercado Pago) y control de "no-show" (pedidos no retirados).
- Reportes de ventas por local y horas peak.
- PWA instalable en el celular.
