import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Sale } from '../types';
import { PaymentMethodBadge } from '../components/common/Badge';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import {
  Receipt,
  Search,
  Download,
  Eye,
} from 'lucide-react';

export const SalesHistoryPage: React.FC = () => {
  const { sales } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('TODOS');
  const [dateFilter, setDateFilter] = useState<'HOY' | '7DIAS' | '30DIAS' | 'TODO'>('HOY');
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

  // Filtered sales
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return sales.filter((s) => {
      // Date filter
      const saleDateStr = s.date.split('T')[0];
      if (dateFilter === 'HOY' && saleDateStr !== todayStr) return false;

      if (dateFilter === '7DIAS') {
        const diffDays =
          (now.getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      }

      if (dateFilter === '30DIAS') {
        const diffDays =
          (now.getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      }

      // Payment method
      if (selectedMethod !== 'TODOS' && s.paymentMethod !== selectedMethod) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchReceipt = s.receiptNumber.toLowerCase().includes(term);
        const matchCustomer = (s.customerName || '').toLowerCase().includes(term);
        const matchItem = s.items.some((i) => i.name.toLowerCase().includes(term));
        if (!matchReceipt && !matchCustomer && !matchItem) return false;
      }

      return true;
    });
  }, [sales, dateFilter, selectedMethod, searchTerm]);

  // Summaries
  const totalAmount = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalCount = filteredSales.length;
  const averageTicket = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Comprobante', 'Fecha', 'Cliente', 'Medio de Pago', 'Total', 'Cant Articulos'];
    const rows = filteredSales.map((s) => [
      s.receiptNumber,
      new Date(s.date).toLocaleString('es-AR'),
      `"${s.customerName || 'Consumidor Final'}"`,
      s.paymentMethod,
      s.total,
      s.items.length,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ventas_tolosano_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-900" />
            Historial de Ventas y Comprobantes
          </h2>
          <p className="text-xs text-slate-500">
            Arqueo de operaciones de mostrador, tickets emitidos y medios de cobro
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Exportar a Excel / CSV</span>
        </button>
      </div>

      {/* Summary Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Recaudado (Filtro)</p>
          <p className="text-2xl font-black text-blue-950 mt-1">
            ${totalAmount.toLocaleString('es-AR')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Cantidad de Operaciones</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalCount} ventas</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Ticket Promedio</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ${averageTicket.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por comprobante, cliente o producto..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:bg-white focus:border-blue-900 focus:outline-none"
            />
          </div>

          {/* Date range filter pills */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'HOY', label: 'Hoy' },
              { id: '7DIAS', label: '7 Días' },
              { id: '30DIAS', label: '30 Días' },
              { id: 'TODO', label: 'Histórico' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as any)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  dateFilter === tab.id
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payment Method dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
            >
              <option value="TODOS">Todos los medios de pago</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="MERCADOPAGO">Mercado Pago / Transf.</option>
              <option value="TARJETA">Tarjeta Débito/Crédito</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Comprobante</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Detalle de Ítems</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Total Facturado</th>
                <th className="py-3 px-4 text-center">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">No se encontraron ventas para este período</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Intenta cambiando las fechas seleccionadas o el medio de pago.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {sale.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(sale.date).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {sale.customerName || 'Consumidor Final'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <div className="space-y-0.5">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="text-[11px] truncate">
                            <span className="font-bold text-slate-900">{item.quantity}x</span>{' '}
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <PaymentMethodBadge method={sale.paymentMethod} />
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500">
                      ${sale.subtotal.toLocaleString('es-AR')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-blue-950 text-sm">
                      ${sale.total.toLocaleString('es-AR')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceipt(sale)}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
