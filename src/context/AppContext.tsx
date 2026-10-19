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
import {
  ProductsService,
  SalesService,
  WorkOrdersService,
  checkBackendHealth,
} from '../services/backendService';

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
  // Connection state
  isBackendConnected: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;

  // POS & Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addCustomItemToCart: (name: string, price: number, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  completeSale: (options: CreateSaleOptions) => Promise<Sale | null>;

  // Work Orders (Cerrajería)
  workOrders: WorkOrder[];
  addWorkOrder: (orderData: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt' | 'balance'>) => Promise<WorkOrder | null>;
  updateWorkOrder: (id: string, orderData: Partial<WorkOrder>) => Promise<void>;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => Promise<void>;
  deleteWorkOrder: (id: string) => Promise<void>;

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
  const [products, setProducts] = useState<Product[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Toast Notification System
  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cargar datos al montar el componente (Intenta API real, si falla usa fallback local)
  const loadData = async () => {
    setIsLoading(true);
    try {
      const isOnline = await checkBackendHealth();

      if (isOnline) {
        setIsBackendConnected(true);
        const [apiProducts, apiOrders, apiSales] = await Promise.all([
          ProductsService.getAll(),
          WorkOrdersService.getAll(),
          SalesService.getAll(),
        ]);

        setProducts(apiProducts);
        setWorkOrders(apiOrders);
        setSales(apiSales);
        console.log('📡 Datos sincronizados con el Backend (PostgreSQL + Express)');
      } else {
        setIsBackendConnected(false);
        // Fallback transparente a datos locales
        setProducts(StorageService.getProducts());
        setWorkOrders(StorageService.getWorkOrders());
        setSales(StorageService.getSales());
        console.info('ℹ️ Backend no detectado aún. Operando en modo local/fallback.');
      }
    } catch (error) {
      console.warn('Error al conectar con la API, usando almacenamiento local:', error);
      setIsBackendConnected(false);
      setProducts(StorageService.getProducts());
      setWorkOrders(StorageService.getWorkOrders());
      setSales(StorageService.getSales());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sincronizar con localStorage como respaldo local
  useEffect(() => {
    if (products.length > 0) StorageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    if (workOrders.length > 0) StorageService.saveWorkOrders(workOrders);
  }, [workOrders]);

  useEffect(() => {
    if (sales.length > 0) StorageService.saveSales(sales);
  }, [sales]);

  // --- Product Actions ---
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
    try {
      if (isBackendConnected) {
        const created = await ProductsService.create(productData);
        setProducts((prev) => [created, ...prev]);
        showToast(`Producto "${created.name}" guardado en la base de datos.`, 'success');
        return created;
      } else {
        // Modo local
        const now = new Date().toISOString();
        const newProduct: Product = {
          ...productData,
          id: `prod-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        setProducts((prev) => [newProduct, ...prev]);
        showToast(`Producto "${newProduct.name}" agregado (local).`, 'success');
        return newProduct;
      }
    } catch (error: any) {
      showToast(error.message || 'Error al crear producto.', 'error');
      return null;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      if (isBackendConnected) {
        const updated = await ProductsService.update(id, productData);
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        showToast('Producto actualizado en la base de datos.', 'success');
      } else {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              return { ...p, ...productData, updatedAt: new Date().toISOString() };
            }
            return p;
          })
        );
        showToast('Producto actualizado.', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar producto.', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (isBackendConnected) {
        await ProductsService.delete(id);
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Producto "${product?.name || 'seleccionado'}" eliminado.`, 'info');
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar producto.', 'error');
    }
  };

  const adjustStock = async (id: string, delta: number) => {
    try {
      if (isBackendConnected) {
        const updated = await ProductsService.adjustStock(id, delta);
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      } else {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              const newStock = Math.max(0, p.stock + delta);
              return { ...p, stock: newStock, updatedAt: new Date().toISOString() };
            }
            return p;
          })
        );
      }
    } catch (error: any) {
      showToast(error.message || 'Error al ajustar stock.', 'error');
    }
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

  const completeSale = async (options: CreateSaleOptions): Promise<Sale | null> => {
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

    try {
      if (isBackendConnected) {
        // Enviar al Backend con transacción atómica en PostgreSQL
        const newSale = await SalesService.create({
          items: cart.map((c) => ({
            productId: c.productId,
            name: c.name,
            sku: c.sku,
            price: c.price,
            quantity: c.quantity,
            isCustom: c.isCustom || false,
            subtotal: c.subtotal,
          })),
          paymentMethod: options.paymentMethod,
          discount,
          cashReceived: options.cashReceived,
          customerName: options.customerName,
          notes: options.notes,
        });

        // 1. Refrescar inventario para reflejar el stock descontado en PostgreSQL
        const freshProducts = await ProductsService.getAll();
        setProducts(freshProducts);

        // 2. Agregar venta al historial
        setSales((prev) => [newSale, ...prev]);

        // 3. Limpiar carrito
        clearCart();

        showToast(
          `Venta ${newSale.receiptNumber} registrada con éxito ($ ${total.toLocaleString('es-AR')})`,
          'success'
        );
        return newSale;
      } else {
        // Modo local fallback
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

        setSales((prev) => [newSale, ...prev]);
        clearCart();

        showToast(
          `Venta ${receiptNumber} registrada con éxito ($ ${total.toLocaleString('es-AR')})`,
          'success'
        );
        return newSale;
      }
    } catch (error: any) {
      showToast(error.message || 'Error al procesar la venta.', 'error');
      return null;
    }
  };

  // --- Work Order Actions (Cerrajería) ---
  const addWorkOrder = async (
    orderData: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt' | 'balance'>
  ): Promise<WorkOrder | null> => {
    try {
      if (isBackendConnected) {
        const created = await WorkOrdersService.create(orderData);
        setWorkOrders((prev) => [created, ...prev]);
        showToast(`Orden ${created.orderNumber} creada en base de datos.`, 'success');
        return created;
      } else {
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
        showToast(`Orden de trabajo ${orderNumber} creada (local).`, 'success');
        return newOrder;
      }
    } catch (error: any) {
      showToast(error.message || 'Error al crear orden de trabajo.', 'error');
      return null;
    }
  };

  const updateWorkOrder = async (id: string, orderData: Partial<WorkOrder>) => {
    try {
      if (isBackendConnected) {
        const updated = await WorkOrdersService.update(id, orderData);
        setWorkOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        showToast('Orden actualizada en base de datos.', 'success');
      } else {
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
      }
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar orden.', 'error');
    }
  };

  const updateWorkOrderStatus = async (id: string, status: WorkOrderStatus) => {
    try {
      if (isBackendConnected) {
        const updated = await WorkOrdersService.updateStatus(id, status);
        setWorkOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        showToast(`Estado actualizado a: ${status}`, 'info');
      } else {
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
        showToast(`Estado actualizado a: ${status}`, 'info');
      }
    } catch (error: any) {
      showToast(error.message || 'Error al cambiar estado.', 'error');
    }
  };

  const deleteWorkOrder = async (id: string) => {
    try {
      const order = workOrders.find((o) => o.id === id);
      if (isBackendConnected) {
        await WorkOrdersService.delete(id);
      }
      setWorkOrders((prev) => prev.filter((o) => o.id !== id));
      showToast(`Orden ${order?.orderNumber || ''} eliminada.`, 'info');
    } catch (error: any) {
      showToast(error.message || 'Error al eliminar orden.', 'error');
    }
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
        isBackendConnected,
        isLoading,
        refreshData: loadData,
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
