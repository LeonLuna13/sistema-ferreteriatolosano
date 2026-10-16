export type ProductCategory =
  | 'Cerraduras y Cerrojos'
  | 'Llaves en Blanco y Copias'
  | 'Herramientas Manuales'
  | 'Herramientas Eléctricas'
  | 'Tornillería y Fijaciones'
  | 'Electricidad'
  | 'Pinturería y Adhesivos'
  | 'Plomería y Gas'
  | 'Seguridad y Candados'
  | 'Varios y Accesorios';

export interface Product {
  id: string;
  sku: string; // Código o código de barras
  name: string;
  category: ProductCategory;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // unique cart item id
  productId?: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  isCustom?: boolean; // True si es ítem libre / mano de obra de cerrajería
  subtotal: number;
  availableStock?: number;
}

export type PaymentMethod = 'EFECTIVO' | 'MERCADOPAGO' | 'TARJETA' | 'TRANSFERENCIA';

export interface Sale {
  id: string;
  receiptNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  customerName?: string;
  notes?: string;
}

export type WorkOrderStatus = 'PENDIENTE' | 'EN_PROCESO' | 'TERMINADO' | 'ENTREGADO';

export type WorkOrderType =
  | 'Apertura a Domicilio'
  | 'Cambio de Combinación'
  | 'Reparación de Tambor / Cerradura'
  | 'Codificación Llave Automotor'
  | 'Copia Especial / Seguridad'
  | 'Instalación de Cerrojo'
  | 'Mantenimiento General';

export interface WorkOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  isHomeService: boolean;
  orderType: WorkOrderType;
  description: string;
  status: WorkOrderStatus;
  estimatedCost: number;
  deposit: number; // Seña
  balance: number; // Costo estimado - seña
  createdAt: string;
  promisedDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface DashboardStats {
  todaySalesTotal: number;
  todaySalesCount: number;
  lowStockCount: number;
  zeroStockCount: number;
  pendingWorkOrdersCount: number;
  inProgressWorkOrdersCount: number;
}
