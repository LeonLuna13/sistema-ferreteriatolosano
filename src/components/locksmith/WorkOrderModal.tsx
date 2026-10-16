import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { WorkOrder, WorkOrderStatus, WorkOrderType } from '../../types';
import { useApp } from '../../context/AppContext';
import { Wrench, MapPin, User } from 'lucide-react';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: WorkOrder | null;
}

const ORDER_TYPES: WorkOrderType[] = [
  'Apertura a Domicilio',
  'Cambio de Combinación',
  'Reparación de Tambor / Cerradura',
  'Codificación Llave Automotor',
  'Copia Especial / Seguridad',
  'Instalación de Cerrojo',
  'Mantenimiento General',
];

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  orderToEdit,
}) => {
  const { addWorkOrder, updateWorkOrder } = useApp();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [isHomeService, setIsHomeService] = useState(false);
  const [orderType, setOrderType] = useState<WorkOrderType>('Apertura a Domicilio');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus>('PENDIENTE');
  const [estimatedCost, setEstimatedCost] = useState<number | ''>('');
  const [deposit, setDeposit] = useState<number | ''>('');
  const [promisedDate, setPromisedDate] = useState('');
  const [notes, setNotes] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (orderToEdit) {
      setClientName(orderToEdit.clientName);
      setClientPhone(orderToEdit.clientPhone);
      setClientAddress(orderToEdit.clientAddress || '');
      setIsHomeService(orderToEdit.isHomeService);
      setOrderType(orderToEdit.orderType);
      setDescription(orderToEdit.description);
      setStatus(orderToEdit.status);
      setEstimatedCost(orderToEdit.estimatedCost);
      setDeposit(orderToEdit.deposit);
      setPromisedDate(orderToEdit.promisedDate ? orderToEdit.promisedDate.substring(0, 16) : '');
      setNotes(orderToEdit.notes || '');
    } else {
      // Defaults for new order
      setClientName('');
      setClientPhone('');
      setClientAddress('');
      setIsHomeService(false);
      setOrderType('Apertura a Domicilio');
      setDescription('');
      setStatus('PENDIENTE');
      setEstimatedCost('');
      setDeposit('');
      setPromisedDate('');
      setNotes('');
    }
  }, [orderToEdit, isOpen]);

  // Balance calculation
  const numericCost = Number(estimatedCost) || 0;
  const numericDeposit = Number(deposit) || 0;
  const balance = Math.max(0, numericCost - numericDeposit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim() || !description.trim()) {
      alert('Por favor completa el nombre, teléfono y la descripción del trabajo.');
      return;
    }

    if (numericCost < 0 || numericDeposit < 0) {
      alert('Los montos no pueden ser negativos.');
      return;
    }

    if (orderToEdit) {
      updateWorkOrder(orderToEdit.id, {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientAddress: isHomeService ? clientAddress.trim() : '',
        isHomeService,
        orderType,
        description: description.trim(),
        status,
        estimatedCost: numericCost,
        deposit: numericDeposit,
        promisedDate: promisedDate ? new Date(promisedDate).toISOString() : undefined,
        notes: notes.trim(),
      });
    } else {
      addWorkOrder({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientAddress: isHomeService ? clientAddress.trim() : '',
        isHomeService,
        orderType,
        description: description.trim(),
        status,
        estimatedCost: numericCost,
        deposit: numericDeposit,
        promisedDate: promisedDate ? new Date(promisedDate).toISOString() : undefined,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderToEdit ? `Editar O.T. ${orderToEdit.orderNumber}` : 'Nueva Orden de Trabajo de Cerrajería'}
      subtitle="Registra servicios en taller o salidas a domicilio con seña y saldo"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Type & Home Service Checkbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Servicio
            </label>
            <div className="relative">
              <select
                value={orderType}
                onChange={(e) => {
                  const val = e.target.value as WorkOrderType;
                  setOrderType(val);
                  if (val === 'Apertura a Domicilio' || val === 'Instalación de Cerrojo') {
                    setIsHomeService(true);
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              >
                {ORDER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado de la Orden
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
            >
              <option value="PENDIENTE">● Pendiente (A coordinar / En espera)</option>
              <option value="EN_PROCESO">⚙ En Proceso (En banco de trabajo)</option>
              <option value="TERMINADO">✓ Terminado (Listo para retirar / entregar)</option>
              <option value="ENTREGADO">✔ Entregado / Cobrado</option>
            </select>
          </div>
        </div>

        {/* Client details */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-700" />
            Datos del Cliente
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Marcelo Benítez"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Teléfono / WhatsApp *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: 221-555-1234"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Home Service Checkbox & Address */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 mb-2">
              <input
                type="checkbox"
                checked={isHomeService}
                onChange={(e) => setIsHomeService(e.target.checked)}
                className="rounded border-slate-300 text-blue-900 focus:ring-blue-800 h-4 w-4"
              />
              ¿Requiere trabajo a domicilio / cerrajería móvil?
            </label>

            {isHomeService && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dirección exacta *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required={isHomeService}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Ej: Calle 528 e/ 10 y 11 N° 780, Tolosa"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Descripción del Trabajo / Falla *
          </label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Puerta doble paleta trabada. Destrabar y cambiar combinación a 4 llaves nuevas."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
          />
        </div>

        {/* Pricing & Deposit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Costo Estimado ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seña Dejada ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2 text-sm font-semibold text-emerald-700 focus:border-blue-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Saldo Pendiente
            </label>
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900 flex items-center justify-between">
              <span>$ {balance.toLocaleString('es-AR')}</span>
              {balance === 0 && numericCost > 0 && (
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                  PAGO COMPLETO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date & Internal Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fecha y Hora Prometida
            </label>
            <input
              type="datetime-local"
              value={promisedDate}
              onChange={(e) => setPromisedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas Internas / Taller
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Dejó llave en banco 3"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-900 hover:bg-blue-800 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition-all flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            {orderToEdit ? 'Guardar Cambios' : 'Crear Orden de Trabajo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
