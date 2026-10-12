export type CategoryId = string;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  hasMeasurements: boolean;
  icon?: string;
}

export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Única' | string;

export interface ProductVariant {
  id: string;
  size: ClothingSize;
  colorName: string;
  colorHex: string;
  stock: number;
  sku: string;
}

export interface SizeMeasurement {
  size: ClothingSize;
  chest?: string;    // Pecho / Busto en cm
  waist?: string;    // Cintura en cm
  hip?: string;      // Cadera en cm
  length: string;   // Largo de prenda o plantilla en cm
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: CategoryId;
  basePriceUSD: number;
  originalPriceUSD?: number; // Para mostrar descuento si aplica
  images: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  featured?: boolean;
  material?: string;
  careInstructions?: string;
  variants: ProductVariant[];
  measurements?: SizeMeasurement[];
}

export interface CartItem {
  id: string; // unique key combining productId + variantId
  productId: string;
  productName: string;
  productImage: string;
  variantId: string;
  size: ClothingSize;
  colorName: string;
  colorHex: string;
  unitPriceUSD: number;
  quantity: number;
  availableStock: number;
}

export type DeliveryMethod = 'retiro' | 'delivery' | 'nacional';

export type PaymentMethodType = 'pago_movil' | 'transferencia' | 'zelle' | 'efectivo';

export interface OrderCustomer {
  fullName: string;
  whatsapp: string;
  idDocument: string; // Cédula o DNI
  email?: string;
  city: string;
  address?: string;
  deliveryMethod: DeliveryMethod;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderCode: string; // ej. #QN-8492
  customer: OrderCustomer;
  items: CartItem[];
  subtotalUSD: number;
  subtotalVES: number;
  exchangeRateUsed: number;
  deliveryMethod: DeliveryMethod;
  shippingFeeNotes: string;
  paymentMethod: PaymentMethodType;
  status: 'PENDIENTE_PAGO' | 'PAGO_REPORTADO' | 'PAGO_VERIFICADO' | 'ENVIADO' | 'CANCELADO';
  paymentReceipt?: {
    referenceNumber?: string;
    receiptImageUrl?: string;
    reportedAt: string;
  };
  createdAt: string;
}

export interface BankPaymentDetails {
  pagoMovil: {
    bank: string;
    phone: string;
    idDocument: string;
    beneficiary: string;
  };
  transferencia: {
    bank: string;
    accountNumber: string;
    accountType: string;
    idDocument: string;
    beneficiary: string;
  };
  zelle: {
    email: string;
    holder: string;
  };
  efectivoNotes?: string;
}

export type BankDetails = BankPaymentDetails;

export interface SiteConfig {
  storeName: string;
  whatsappNumber: string;
  bankDetails: BankPaymentDetails;
  hero: {
    badge: string;
    title: string;
    highlightWord: string;
    subtitle: string;
    ctaButtonText: string;
    secondaryButtonText: string;
    floatingBadgeTop: string;
    floatingBadgeBottom: string;
  };
  benefits: {
    shippingTitle: string;
    shippingDesc: string;
    paymentTitle: string;
    paymentDesc: string;
    supportTitle: string;
    supportDesc: string;
  };
  sizeBanner: {
    tag: string;
    title: string;
    description: string;
    buttonText: string;
  };
  footerBio: string;
}
