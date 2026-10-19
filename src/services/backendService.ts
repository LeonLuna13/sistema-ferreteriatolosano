import { http } from './api';
import type { Product, Sale, WorkOrder, WorkOrderStatus, DashboardStats } from '../types';

export const ProductsService = {
  async getAll(params?: { search?: string; category?: string; lowStock?: boolean }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category && params.category !== 'TODAS') searchParams.append('category', params.category);
    if (params?.lowStock) searchParams.append('lowStock', 'true');

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return http.get<Product[]>(`/products${query}`);
  },

  async getById(id: string): Promise<Product> {
    return http.get<Product>(`/products/${id}`);
  },

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return http.post<Product>('/products', data);
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return http.put<Product>(`/products/${id}`, data);
  },

  async adjustStock(id: string, delta: number): Promise<Product> {
    return http.patch<Product>(`/products/${id}/stock`, { delta });
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return http.delete<{ success: boolean; message: string }>(`/products/${id}`);
  },
};

export const SalesService = {
  async getAll(params?: { paymentMethod?: string; search?: string }): Promise<Sale[]> {
    const searchParams = new URLSearchParams();
    if (params?.paymentMethod && params.paymentMethod !== 'TODOS') {
      searchParams.append('paymentMethod', params.paymentMethod);
    }
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return http.get<Sale[]>(`/sales${query}`);
  },

  async getById(id: string): Promise<Sale> {
    return http.get<Sale>(`/sales/${id}`);
  },

  async create(saleData: {
    items: any[];
    paymentMethod: string;
    discount?: number;
    cashReceived?: number;
    customerName?: string;
    notes?: string;
  }): Promise<Sale> {
    return http.post<Sale>('/sales', saleData);
  },
};

export const WorkOrdersService = {
  async getAll(params?: { status?: string; search?: string }): Promise<WorkOrder[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'TODAS') {
      searchParams.append('status', params.status);
    }
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return http.get<WorkOrder[]>(`/work-orders${query}`);
  },

  async getById(id: string): Promise<WorkOrder> {
    return http.get<WorkOrder>(`/work-orders/${id}`);
  },

  async create(data: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt' | 'balance'>): Promise<WorkOrder> {
    return http.post<WorkOrder>('/work-orders', data);
  },

  async update(id: string, data: Partial<WorkOrder>): Promise<WorkOrder> {
    return http.put<WorkOrder>(`/work-orders/${id}`, data);
  },

  async updateStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder> {
    return http.patch<WorkOrder>(`/work-orders/${id}/status`, { status });
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return http.delete<{ success: boolean; message: string }>(`/work-orders/${id}`);
  },
};

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    return http.get<DashboardStats>('/dashboard/stats');
  },
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await http.get<{ status: string }>('/health');
    return res.status === 'ok';
  } catch {
    return false;
  }
};
