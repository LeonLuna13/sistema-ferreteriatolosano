import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { WorkOrder } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { WorkOrderModal } from '../components/locksmith/WorkOrderModal';
import {
  Wrench,
  Plus,
  Search,
  Phone,
  MapPin,
  MessageSquare,
  Edit2,
  Trash2,
  Home,
  ShieldCheck,
} from 'lucide-react';

export const LocksmithPage: React.FC = () => {
  const { workOrders, updateWorkOrderStatus, deleteWorkOrder } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      TODAS: workOrders.length,
      PENDIENTE: workOrders.filter((o) => o.status === 'PENDIENTE').length,
      EN_PROCESO: workOrders.filter((o) => o.status === 'EN_PROCESO').length,
      TERMINADO: workOrders.filter((o) => o.status === 'TERMINADO').length,
      ENTREGADO: workOrders.filter((o) => o.status === 'ENTREGADO').length,
    };
  }, [workOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return workOrders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.clientAddress && o.clientAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'TODAS' || o.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [workOrders, searchTerm, statusFilter]);

  const handleOpenCreate = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: WorkOrder) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, orderNumber: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la orden ${orderNumber}?`)) {
      deleteWorkOrder(id);
    }
  };

  // WhatsApp quick notifier
  const handleOpenWhatsApp = (order: WorkOrder) => {
    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    let text = `Hola ${order.clientName}, te escribimos de Cerrajería Tolosano con respecto a tu orden ${order.orderNumber}.`;
    if (order.status === 'TERMINADO') {
      text = `Hola ${order.clientName}, te avisamos de Cerrajería Tolosano que tu trabajo (${order.orderNumber}: ${order.description}) ya se encuentra TERMINADO y listo para retirar. Saldo a abonar: $${order.balance.toLocaleString('es-AR')}. ¡Muchas gracias!`;
    }
    const url = `https://wa.me/549${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Call to Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            Órdenes de Trabajo y Taller de Cerrajería
          </h2>
          <p className="text-xs text-slate-500">
            Seguimiento de aperturas urgentes a domicilio, reparaciones de tambores, combinaciones y copias especiales
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Cerrajería</span>
        </button>
      </div>

      {/* Filter and Tab Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'TODAS', label: 'Todas' },
              { key: 'PENDIENTE', label: 'Pendientes' },
              { key: 'EN_PROCESO', label: 'En Proceso' },
              { key: 'TERMINADO', label: 'Terminadas' },
              { key: 'ENTREGADO', label: 'Entregadas/Cobradas' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                    statusFilter === tab.key ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {statusCounts[tab.key as keyof typeof statusCounts] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, O.T., teléfono..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs focus:bg-white focus:border-blue-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Work Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400 text-xs">
            <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500" />
            <p className="font-bold text-sm text-slate-600">No se encontraron órdenes de cerrajería</p>
            <p className="text-slate-400 mt-1">Crea una nueva orden o cambia los filtros de búsqueda.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            return (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{order.clientName}</h3>
                    {order.isHomeService ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5">
                        <Home className="w-3 h-3 text-amber-600" /> Domicilio
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5">
                        En Taller
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-4 space-y-3 flex-1 text-xs text-slate-600">
                  {/* Service Type */}
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>{order.orderType}</span>
                  </div>

                  {/* Work Description */}
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-slate-700 leading-relaxed">
                    <p className="text-[11px] font-medium">{order.description}</p>
                    {order.notes && (
                      <p className="text-[10px] text-slate-400 mt-1 italic border-t border-slate-200/60 pt-1">
                        Nota: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Contact & Address */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {order.clientPhone}
                      </span>
                      <button
                        onClick={() => handleOpenWhatsApp(order)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        WhatsApp
                      </button>
                    </div>

                    {order.clientAddress && (
                      <div className="flex items-start gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="truncate">{order.clientAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2.5 space-y-1">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Costo Estimado:</span>
                      <span className="font-bold text-slate-800">
                        ${order.estimatedCost.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Seña abonada:</span>
                      <span className="font-bold text-emerald-700">
                        ${order.deposit.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200 text-xs font-black">
                      <span className="text-slate-700">Saldo a Cobrar:</span>
                      <span className={order.balance > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                        {order.balance > 0
                          ? `$${order.balance.toLocaleString('es-AR')}`
                          : 'PAGO COMPLETO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Advancement & Actions Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  {/* Status Progression Button */}
                  <div className="flex-1">
                    {order.status === 'PENDIENTE' && (
                      <button
                        onClick={() => updateWorkOrderStatus(order.id, 'EN_PROCESO')}
                        className="w-full rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-1.5 text-xs transition-colors shadow-sm"
                      >
                        Iniciar Trabajo &rarr;
                      </button>
                    )}
                    {order.status === 'EN_PROCESO' && (
                      <button
                        onClick={() => updateWorkOrderStatus(order.id, 'TERMINADO')}
                        className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 text-xs transition-colors shadow-sm"
                      >
                        Marcar Terminado ✓
                      </button>
                    )}
                    {order.status === 'TERMINADO' && (
                      <button
                        onClick={() => updateWorkOrderStatus(order.id, 'ENTREGADO')}
                        className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-1.5 text-xs transition-colors shadow-sm"
                      >
                        Cobrar y Entregar ✔
                      </button>
                    )}
                    {order.status === 'ENTREGADO' && (
                      <span className="inline-block text-[11px] font-bold text-emerald-700 py-1">
                        ✔ Trabajo finalizado y cobrado
                      </span>
                    )}
                  </div>

                  {/* Edit and Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      title="Editar orden"
                      onClick={() => handleOpenEdit(order)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Eliminar orden"
                      onClick={() => handleDelete(order.id, order.orderNumber)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <WorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderToEdit={editingOrder}
      />
    </div>
  );
};
