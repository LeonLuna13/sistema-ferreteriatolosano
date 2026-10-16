import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  Product,
  CartItem,
  Sale,
  WorkOrder,
  WorkOrderStatus,
  PaymentMethod,
  DashboardStats,
} from '../types';
import { StorageService } from '../services/storageService';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

interface CreateSaleOptions {
  discount?: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  customerName?: string;
  notes?: string;
}

interface AppContextType {
  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;

  // POS & Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addCustomItemToCart: (name: string, price: number, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  completeSale: (options: CreateSaleOptions) => Sale | null;

  // Work Orders (Cerrajería)
  workOrders: WorkOrder[];
  addWorkOrder: (orderData: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt' | 'balance'>) => WorkOrder;
  updateWorkOrder: (id: string, orderData: Partial<WorkOrder>) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  deleteWorkOrder: (id: string) => void;

  // Sales History
  sales: Sale[];

  // Global / Dashboard Stats
  stats: DashboardStats;
  resetAllData: () => void;

  // Toast
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => StorageService.getWorkOrders());
  const [sales, setSales] = useState<Sale[]>(() => StorageService.getSales());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persist to localStorage whenever state updates
  useEffect(() => {
    StorageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    StorageService.saveWorkOrders(workOrders);
  }, [workOrders]);

  useEffect(() => {
    StorageService.saveSales(sales);
  }, [sales]);

  // Toast Notification System
  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Product Actions ---
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Producto "${newProduct.name}" agregado con éxito.`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...productData,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    showToast('Producto actualizado correctamente.', 'success');
  };

  const deleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Producto "${product?.name || 'seleccionado'}" eliminado.`, 'info');
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // --- POS / Cart Actions ---
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`¡Sin stock disponible para "${product.name}"!`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`No puedes superar el stock disponible (${product.stock} u.)`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, subtotal: newQty * item.price }
            : item
        );
      } else {
        const itemQty = Math.min(quantity, product.stock);
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            productId: product.id,
            name: product.name,
            sku: product.sku,
            price: product.salePrice,
            quantity: itemQty,
            subtotal: itemQty * product.salePrice,
            availableStock: product.stock,
          },
        ];
      }
    });
    showToast(`"${product.name}" agregado al carrito.`, 'info');
  };

  const addCustomItemToCart = (name: string, price: number, quantity = 1) => {
    if (!name.trim() || price < 0 || quantity <= 0) {
      showToast('Por favor verifica los datos del ítem personalizado.', 'warning');
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        id: `cart-custom-${Date.now()}`,
        name: name.trim(),
        price,
        quantity,
        isCustom: true,
        subtotal: price * quantity,
      },
    ]);
    showToast(`Mano de obra "${name}" agregada.`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          if (item.availableStock !== undefined && quantity > item.availableStock) {
            showToast(`Stock máximo alcanzado (${item.availableStock} u.)`, 'warning');
            return item;
          }
          return {
            ...item,
            quantity,
            subtotal: quantity * item.price,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const completeSale = (options: CreateSaleOptions): Sale | null => {
    if (cart.length === 0) {
      showToast('El carrito está vacío. Agrega productos para vender.', 'warning');
      return null;
    }

    const discount = options.discount || 0;
    const total = Math.max(0, cartSubtotal - discount);

    if (options.paymentMethod === 'EFECTIVO' && options.cashReceived !== undefined) {
      if (options.cashReceived < total) {
        showToast('El monto entregado en efectivo es menor al total a cobrar.', 'warning');
        return null;
      }
    }

    const cashChange =
      options.paymentMethod === 'EFECTIVO' && options.cashReceived !== undefined
        ? Math.max(0, options.cashReceived - total)
        : 0;

    const todayStr = new Date().toISOString();
    const countNumber = sales.length + 1;
    const receiptNumber = `VTA-${new Date().getFullYear()}-${countNumber.toString().padStart(4, '0')}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber,
      date: todayStr,
      items: [...cart],
      subtotal: cartSubtotal,
      discount,
      total,
      paymentMethod: options.paymentMethod,
      cashReceived: options.cashReceived,
      cashChange,
      customerName: options.customerName?.trim() || 'Cliente mostrador',
      notes: options.notes?.trim() || '',
    };

    // 1. Discount stock from catalog for non-custom items
    setProducts((prev) =>
      prev.map((prod) => {
        const itemSold = cart.find((c) => c.productId === prod.id);
        if (itemSold) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - itemSold.quantity),
            updatedAt: todayStr,
          };
        }
        return prod;
      })
    );

    // 2. Add sale to history
    setSales((prev) => [newSale, ...prev]);

    // 3. Clear active cart
    clearCart();

    showToast(`Venta ${receiptNumber} registrada con éxito ($ ${total.toLocaleString('es-AR')})`, 'success');
    return newSale;
  };

  // --- Work Order Actions (Cerrajería) ---
  const addWorkOrder = (
    orderData: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt' | 'balance'>
  ): WorkOrder => {
    const nextNumber = workOrders.length + 1;
    const orderNumber = `OT-${nextNumber.toString().padStart(4, '0')}`;
    const now = new Date().toISOString();
    const balance = Math.max(0, orderData.estimatedCost - orderData.deposit);

    const newOrder: WorkOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      balance,
      createdAt: now,
    };

    setWorkOrders((prev) => [newOrder, ...prev]);
    showToast(`Orden de trabajo ${orderNumber} creada con éxito.`, 'success');
    return newOrder;
  };

  const updateWorkOrder = (id: string, orderData: Partial<WorkOrder>) => {
    setWorkOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          const estimatedCost = orderData.estimatedCost ?? order.estimatedCost;
          const deposit = orderData.deposit ?? order.deposit;
          const balance = Math.max(0, estimatedCost - deposit);

          return {
            ...order,
            ...orderData,
            estimatedCost,
            deposit,
            balance,
          };
        }
        return order;
      })
    );
    showToast('Orden de trabajo actualizada.', 'success');
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderStatus) => {
    setWorkOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          const completedAt =
            status === 'TERMINADO' || status === 'ENTREGADO'
              ? new Date().toISOString()
              : order.completedAt;
          return { ...order, status, completedAt };
        }
        return order;
      })
    );
    showToast(`Estado de la orden actualizado a: ${status}`, 'info');
  };

  const deleteWorkOrder = (id: string) => {
    const order = workOrders.find((o) => o.id === id);
    setWorkOrders((prev) => prev.filter((o) => o.id !== id));
    showToast(`Orden ${order?.orderNumber || ''} eliminada.`, 'info');
  };

  // --- Global Stats calculation ---
  const stats: DashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.date.startsWith(today));

    const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.total, 0);
    const todaySalesCount = todaySales.length;

    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const zeroStockCount = products.filter((p) => p.stock === 0).length;

    const pendingWorkOrdersCount = workOrders.filter((w) => w.status === 'PENDIENTE').length;
    const inProgressWorkOrdersCount = workOrders.filter((w) => w.status === 'EN_PROCESO').length;

    return {
      todaySalesTotal,
      todaySalesCount,
      lowStockCount,
      zeroStockCount,
      pendingWorkOrdersCount,
      inProgressWorkOrdersCount,
    };
  }, [products, sales, workOrders]);

  const resetAllData = () => {
    const fresh = StorageService.resetAll();
    setProducts(fresh.products);
    setWorkOrders(fresh.workOrders);
    setSales(fresh.sales);
    setCart([]);
    showToast('Datos reiniciados a los valores de prueba originales.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        cart,
        addToCart,
        addCustomItemToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        completeSale,
        workOrders,
        addWorkOrder,
        updateWorkOrder,
        updateWorkOrderStatus,
        deleteWorkOrder,
        sales,
        stats,
        resetAllData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
