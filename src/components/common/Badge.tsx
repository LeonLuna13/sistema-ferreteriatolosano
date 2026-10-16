import React from 'react';
import type { WorkOrderStatus, PaymentMethod } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-300',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border border-rose-300 font-semibold',
    info: 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold',
    neutral: 'bg-slate-800 text-slate-200 border border-slate-700',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
  switch (status) {
    case 'PENDIENTE':
      return <Badge variant="warning">● Pendiente</Badge>;
    case 'EN_PROCESO':
      return <Badge variant="info">⚙ En Proceso</Badge>;
    case 'TERMINADO':
      return <Badge variant="success">✓ Terminado</Badge>;
    case 'ENTREGADO':
      return <Badge variant="neutral">✔ Entregado / Cobrado</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

export const StockBadge: React.FC<{ stock: number; minStock: number }> = ({ stock, minStock }) => {
  if (stock === 0) {
    return (
      <Badge variant="danger" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        Sin Stock (0 u)
      </Badge>
    );
  }
  if (stock <= minStock) {
    return (
      <Badge variant="warning" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Stock Bajo ({stock} u / min {minStock})
      </Badge>
    );
  }
  return (
    <Badge variant="success" size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      {stock} u en stock
    </Badge>
  );
};

export const PaymentMethodBadge: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const map: Record<PaymentMethod, { label: string; variant: 'success' | 'info' | 'warning' | 'default' }> = {
    EFECTIVO: { label: 'Efectivo', variant: 'success' },
    MERCADOPAGO: { label: 'Mercado Pago / Transf.', variant: 'info' },
    TARJETA: { label: 'Tarjeta Débito/Crédito', variant: 'default' },
    TRANSFERENCIA: { label: 'Transferencia Bancaria', variant: 'info' },
  };

  const info = map[method] || { label: method, variant: 'default' };
  return <Badge variant={info.variant} size="sm">{info.label}</Badge>;
};
