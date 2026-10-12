-- ==============================================================================
-- QUIRONA STORE — ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Incluye: Tablas relacionales, soporte JSONB para variantes, políticas RLS,
-- bucket de Storage para fotos/comprobantes y datos semilla (Seed) iniciales.
-- ==============================================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Función de actualización de timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- 2. TABLA: CATEGORIES (Colecciones / Categorías de Catálogo)
-- ==============================================================================
create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text default '',
  has_measurements boolean default true,
  icon text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger update_categories_updated_at
  before update on categories
  for each row execute function update_updated_at_column();

-- ==============================================================================
-- 3. TABLA: PRODUCTS (Prendas, Accesorios e Inventario)
-- ==============================================================================
create table if not exists products (
  id text primary key,
  name text not null,
  slug text not null,
  description text default '',
  category text not null references categories(id) on update cascade on delete restrict,
  base_price_usd numeric(10, 2) not null check (base_price_usd > 0),
  original_price_usd numeric(10, 2) check (original_price_usd is null or original_price_usd > 0),
  images text[] not null check (array_length(images, 1) > 0),
  is_new boolean default true,
  is_best_seller boolean default false,
  featured boolean default false,
  material text default '100% Algodón',
  care_instructions text default 'Lavar con agua fría.',
  variants jsonb not null default '[]'::jsonb,
  measurements jsonb default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_featured on products(featured);
create index if not exists idx_products_is_new on products(is_new);
create index if not exists idx_products_is_best_seller on products(is_best_seller);

create trigger update_products_updated_at
  before update on products
  for each row execute function update_updated_at_column();

-- ==============================================================================
-- 4. TABLA: ORDERS (Pedidos, Pagos y Despachos)
-- ==============================================================================
create table if not exists orders (
  id text primary key,
  order_code text not null unique,
  customer jsonb not null,
  items jsonb not null default '[]'::jsonb,
  subtotal_usd numeric(10, 2) not null,
  subtotal_ves numeric(12, 2) not null,
  exchange_rate_used numeric(10, 4) not null,
  delivery_method text not null check (delivery_method in ('retiro', 'delivery', 'nacional')),
  shipping_fee_notes text default '',
  payment_method text not null check (payment_method in ('pago_movil', 'transferencia', 'zelle', 'efectivo')),
  status text not null default 'PENDIENTE_PAGO' check (status in ('PENDIENTE_PAGO', 'PAGO_REPORTADO', 'PAGO_VERIFICADO', 'ENVIADO', 'CANCELADO')),
  payment_receipt jsonb default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_code on orders(order_code);
create index if not exists idx_orders_created_at on orders(created_at desc);

create trigger update_orders_updated_at
  before update on orders
  for each row execute function update_updated_at_column();

-- ==============================================================================
-- 5. TABLA: SITE_CONFIG (Configuración Global, Tasa y Cuentas Bancarias)
-- ==============================================================================
create table if not exists site_config (
  id text primary key default 'primary',
  config jsonb not null,
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 6. TABLA: EXCHANGE_RATE (Tasa BCV y Manual)
-- ==============================================================================
create table if not exists exchange_rates (
  id serial primary key,
  rate numeric(10, 4) not null check (rate > 0),
  source text default 'BCV',
  is_manual boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ACCESO
-- ==============================================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table site_config enable row level security;
alter table exchange_rates enable row level security;

-- Categorías: Todos pueden leer; solo autenticados o service_role pueden modificar
create policy "Categories public read" on categories for select using (true);
create policy "Categories admin insert" on categories for insert with check (auth.role() = 'authenticated');
create policy "Categories admin update" on categories for update using (auth.role() = 'authenticated');
create policy "Categories admin delete" on categories for delete using (auth.role() = 'authenticated');

-- Productos: Todos pueden leer; solo admin modifica
create policy "Products public read" on products for select using (true);
create policy "Products admin insert" on products for insert with check (auth.role() = 'authenticated');
create policy "Products admin update" on products for update using (auth.role() = 'authenticated');
create policy "Products admin delete" on products for delete using (auth.role() = 'authenticated');

-- Pedidos: Clientes pueden crear pedidos de forma pública (Checkout) y consultar su propio pedido por código
create policy "Orders public insert" on orders for insert with check (true);
create policy "Orders admin select" on orders for select using (auth.role() = 'authenticated');
create policy "Orders admin update" on orders for update using (auth.role() = 'authenticated');
create policy "Orders admin delete" on orders for delete using (auth.role() = 'authenticated');

-- Configuración del Sitio: Todos pueden leer textos/bancos; solo admin modifica
create policy "SiteConfig public read" on site_config for select using (true);
create policy "SiteConfig admin update" on site_config for update using (auth.role() = 'authenticated');
create policy "SiteConfig admin insert" on site_config for insert with check (auth.role() = 'authenticated');

-- Tasas de Cambio: Todos leen; solo admin modifica
create policy "ExchangeRates public read" on exchange_rates for select using (true);
create policy "ExchangeRates admin insert" on exchange_rates for insert with check (auth.role() = 'authenticated');

-- ==============================================================================
-- 8. STORAGE BUCKET: quirona-media (Fotos de Productos y Comprobantes)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('quirona-media', 'quirona-media', true)
on conflict (id) do update set public = true;

-- Lectura pública para imágenes del catálogo y comprobantes
create policy "Public Access Media"
  on storage.objects for select
  using ( bucket_id = 'quirona-media' );

-- Subida permitida (pública para clientes reportando comprobantes, y administradores)
create policy "Public Upload Media"
  on storage.objects for insert
  with check ( bucket_id = 'quirona-media' );

-- ==============================================================================
-- 9. DATOS SEMILLA (SEED DATA)
-- ==============================================================================
insert into categories (id, name, slug, description, has_measurements) values
('ropa', 'Ropa', 'ropa', 'Sudaderas, franelas oversize y prendas con corte cómodo y retro.', true),
('accesorios', 'Accesorios', 'accesorios', 'Gorras, pines, stickers y complementos vintage.', false),
('bolsos', 'Bolsos & Totes', 'bolsos', 'Tote bags de lona y bolsos con diseños exclusivos Quirona.', false),
('calzado', 'Calzado', 'calzado', 'Sneakers y calzado urbano con estética pop.', true)
on conflict (id) do nothing;

insert into site_config (id, config) values
('primary', '{
  "storeName": "Quirona Store",
  "whatsappNumber": "584121234567",
  "bankDetails": {
    "pagoMovil": {
      "bank": "Banco Banesco (0134)",
      "phone": "0412-1234567",
      "idDocument": "V-28.123.456",
      "beneficiary": "Quirona Store C.A."
    },
    "transferencia": {
      "bank": "Banesco Banco Universal",
      "accountNumber": "0134-0000-00-0000000000",
      "accountType": "Corriente",
      "idDocument": "J-50123456-7",
      "beneficiary": "Quirona Store C.A."
    },
    "zelle": {
      "email": "pagos@quironastore.com",
      "holder": "Quirona LLC"
    },
    "efectivoNotes": "Pago en divisas o bolívares en efectivo al momento del retiro o entrega."
  },
  "hero": {
    "badge": "Colección Retro Streetwear 2026",
    "title": "Vibra retro, estilo atemporal y prendas con",
    "highlightWord": "personalidad.",
    "subtitle": "Descubre ropa oversize, sudaderas y accesorios confeccionados con cortes exclusivos, tabla de medidas en centímetros y proceso de compra asistido en bolívares o divisas.",
    "ctaButtonText": "Explorar Colección",
    "secondaryButtonText": "Ver Catálogo Completo",
    "floatingBadgeTop": "Diseño Original",
    "floatingBadgeBottom": "Medidas Reales en CM"
  },
  "benefits": {
    "shippingTitle": "Envíos a Todo el País",
    "shippingDesc": "MRW, Zoom, Tealca o retiro gratis",
    "paymentTitle": "Pago Seguro & Verificado",
    "paymentDesc": "Pago Móvil, Transferencias y Zelle",
    "supportTitle": "Atención Inmediata",
    "supportDesc": "Vía WhatsApp todos los días"
  },
  "sizeBanner": {
    "tag": "Hecho para destacar",
    "title": "¿No estás seguro de tu talla? Escríbenos con tus medidas.",
    "description": "En Quirona medimos cada prenda a mano para darte la medida exacta en centímetros. Puedes consultarnos antes de ordenar y te aseguramos el fit que buscas.",
    "buttonText": "Consultar por WhatsApp"
  },
  "footerBio": "Boutique de ropa y accesorios con vibra vintage-pop. Prendas diseñadas con personalidad, comodidad y estilo atemporal."
}'::jsonb)
on conflict (id) do nothing;

insert into exchange_rates (rate, source, is_manual)
values (36.50, 'BCV', false);

-- ==============================================================================
-- 10. TABLA: ADMIN_AUTH (Credenciales Administrativas y 2FA TOTP)
-- ==============================================================================
create table if not exists admin_auth (
  id text primary key default 'primary',
  admin_email text not null,
  master_recovery_email text default 'quirona@parz7val.online',
  password_hash text not null,
  salt text not null,
  mfa_enabled boolean default false,
  totp_secret text default '',
  enrolled_at timestamptz default null,
  recovery_otp jsonb default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table admin_auth enable row level security;

