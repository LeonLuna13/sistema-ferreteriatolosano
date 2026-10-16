import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, StockBadge, PaymentMethodBadge } from '../components/common/Badge';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import type { Sale } from '../types';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Wrench,
  ArrowRight,
  TrendingUp,
  Package,
  Receipt,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, sales, workOrders, products, updateWorkOrderStatus } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

  // Today's date filter
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date.startsWith(today));

  // Today's payment breakdown
  const paymentBreakdown = todaySales.reduce(
    (acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
      return acc;
    },
    {} as Record<string, number>
  );

  // Urgent active work orders (Pendiente / En Proceso)
  const activeOrders = workOrders
    .filter((w) => w.status === 'PENDIENTE' || w.status === 'EN_PROCESO')
    .slice(0, 5);

  // Low stock products
  const criticalProducts = products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white shadow-lg border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              Caja Diaria Activa
            </span>
            <span className="text-xs text-slate-300">Resumen operativo general</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">
            Ferretería &amp; Cerrajería Tolosano
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Control de inventario de mostrador, cobros rápidos, y órdenes de taller y cerrajería a domicilio.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/pos')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all shadow-amber-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Abrir Mostrador POS</span>
          </button>
          <button
            onClick={() => navigate('/inventario')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 border border-slate-600 transition-all"
          >
            <Package className="w-4 h-4 text-slate-400" />
            <span>Inventario</span>
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vendido Hoy"
          value={`$ ${stats.todaySalesTotal.toLocaleString('es-AR')}`}
          subtext={`${stats.todaySalesCount} operaciones registradas hoy`}
          icon={DollarSign}
          variant="emerald"
          onClick={() => navigate('/ventas')}
        />

        <StatCard
          title="Ventas del Día"
          value={stats.todaySalesCount}
          subtext="Tickets y notas de mostrador"
          icon={Receipt}
          variant="primary"
          onClick={() => navigate('/ventas')}
        />

        <StatCard
          title="Alertas de Stock"
          value={stats.lowStockCount + stats.zeroStockCount}
          subtext={`${stats.zeroStockCount} sin stock • ${stats.lowStockCount} por reponer`}
          icon={AlertTriangle}
          variant={stats.lowStockCount > 0 ? 'amber' : 'primary'}
          onClick={() => navigate('/inventario?filter=low')}
        />

        <StatCard
          title="Cerrajería Activa"
          value={stats.pendingWorkOrdersCount + stats.inProgressWorkOrdersCount}
          subtext={`${stats.pendingWorkOrdersCount} pendientes • ${stats.inProgressWorkOrdersCount} en banco`}
          icon={Wrench}
          variant="blue"
          onClick={() => navigate('/cerrajeria')}
        />
      </div>

      {/* Payment methods breakdown bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-900" />
            Ingresos de Hoy por Medio de Pago
          </p>
          <span className="text-xs font-semibold text-slate-600">
            Total recaudado: <strong className="text-slate-900">${stats.todaySalesTotal.toLocaleString('es-AR')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-[11px] font-semibold text-emerald-800">Efectivo en Caja</p>
            <p className="text-lg font-black text-emerald-900 mt-1">
              ${(paymentBreakdown['EFECTIVO'] || 0).toLocaleString('es-AR')}
            </p>
          </div>

          <div className="rounded-lg bg-sky-50 border border-sky-200 p-3">
            <p className="text-[11px] font-semibold text-sky-800">Mercado Pago / QR</p>
            <p className="text-lg font-black text-sky-900 mt-1">
              ${(paymentBreakdown['MERCADOPAGO'] || 0).toLocaleString('es-AR')}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-[11px] font-semibold text-blue-800">Tarjeta Débito/Crédito</p>
            <p className="text-lg font-black text-blue-900 mt-1">
              ${(paymentBreakdown['TARJETA'] || 0).toLocaleString('es-AR')}
            </p>
          </div>

          <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3">
            <p className="text-[11px] font-semibold text-indigo-800">Transferencias</p>
            <p className="text-lg font-black text-indigo-900 mt-1">
              ${(paymentBreakdown['TRANSFERENCIA'] || 0).toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Two columns: Active Locksmith Orders & Critical Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Locksmith Work Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-900">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Trabajos de Cerrajería en Curso</h3>
                  <p className="text-[11px] text-slate-500">Aperturas, combinaciones y llaves automotor</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/cerrajeria')}
                className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {activeOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No hay trabajos de cerrajería pendientes actualmente.
                </div>
              ) : (
                activeOrders.map((order) => (
                  <div key={order.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} />
                        {order.isHomeService && (
                          <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Domicilio
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800">{order.clientName}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{order.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-slate-900">
                        ${order.estimatedCost.toLocaleString('es-AR')}
                      </p>
                      <p className="text-[10px] text-amber-700 font-medium">
                        Resta: ${order.balance.toLocaleString('es-AR')}
                      </p>
                      <button
                        onClick={() =>
                          updateWorkOrderStatus(
                            order.id,
                            order.status === 'PENDIENTE' ? 'EN_PROCESO' : 'TERMINADO'
                          )
                        }
                        className="mt-1.5 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition-colors"
                      >
                        Avanzar estado &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Critical Low Stock Alert Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Artículos Críticos para Reposición</h3>
                  <p className="text-[11px] text-slate-500">Stock actual inferior o igual al mínimo</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/inventario')}
                className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
              >
                Ver inventario <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {criticalProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  ¡Excelente! Todos los artículos cuentan con stock superior al mínimo.
                </div>
              ) : (
                criticalProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {p.sku}
                        </span>
                        <StockBadge stock={p.stock} minStock={p.minStock} />
                      </div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.category}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">${p.salePrice.toLocaleString('es-AR')}</p>
                      <button
                        onClick={() => navigate('/inventario')}
                        className="text-[11px] text-blue-900 font-semibold hover:underline mt-0.5"
                      >
                        Reponer &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Últimas Ventas Realizadas</h3>
            <p className="text-[11px] text-slate-500">Transacciones cobradas en el mostrador</p>
          </div>
          <button
            onClick={() => navigate('/ventas')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
          >
            Ver historial completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Comprobante</th>
                <th className="py-2.5 px-3">Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Ítems</th>
                <th className="py-2.5 px-3">Medio de Pago</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{sale.receiptNumber}</td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(sale.date).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{sale.customerName || 'Mostrador'}</td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="font-semibold text-slate-900">{sale.items.length}</span>{' '}
                    {sale.items.length === 1 ? 'artículo' : 'artículos'}
                  </td>
                  <td className="py-3 px-3">
                    <PaymentMethodBadge method={sale.paymentMethod} />
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                    ${sale.total.toLocaleString('es-AR')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedReceipt(sale)}
                      className="rounded bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors"
                    >
                      Ver Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        sale={selectedReceipt}
      />
    </div>
  );
};
