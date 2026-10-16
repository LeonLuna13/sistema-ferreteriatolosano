import type { Product, WorkOrder, Sale } from '../types';
import { INITIAL_PRODUCTS, INITIAL_WORK_ORDERS, INITIAL_SALES } from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'tolosano_products_v1',
  WORK_ORDERS: 'tolosano_work_orders_v1',
  SALES: 'tolosano_sales_v1',
};

// Safe helper to read from localStorage
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

// Safe helper to write to localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  // Products
  getProducts(): Product[] {
    return getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  saveProducts(products: Product[]): void {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  },

  // Work Orders
  getWorkOrders(): WorkOrder[] {
    return getFromStorage<WorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS);
  },

  saveWorkOrders(orders: WorkOrder[]): void {
    saveToStorage(STORAGE_KEYS.WORK_ORDERS, orders);
  },

  // Sales
  getSales(): Sale[] {
    return getFromStorage<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  },

  saveSales(sales: Sale[]): void {
    saveToStorage(STORAGE_KEYS.SALES, sales);
  },

  // Reset to initial demo data
  resetAll(): { products: Product[]; workOrders: WorkOrder[]; sales: Sale[] } {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(INITIAL_WORK_ORDERS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    return {
      products: INITIAL_PRODUCTS,
      workOrders: INITIAL_WORK_ORDERS,
      sales: INITIAL_SALES,
    };
  },
};
