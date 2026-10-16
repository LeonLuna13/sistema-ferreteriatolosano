import React from 'react';
import { Modal } from '../common/Modal';
import type { Sale } from '../../types';
import { Printer, KeyRound } from 'lucide-react';
import { PaymentMethodBadge } from '../common/Badge';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comprobante de Venta"
      subtitle="Ticket de mostrador emitido"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Printable Ticket Area */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-800 font-sans text-xs space-y-3">
          {/* Header */}
          <div className="text-center pb-3 border-b border-slate-200">
            <div className="flex justify-center mb-1 text-blue-900">
              <KeyRound className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
              TOLOSANO
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">Ferretería &amp; Cerrajería</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Tolosa - La Plata • Pcia. de Buenos Aires</p>
          </div>

          {/* Meta details */}
          <div className="flex justify-between items-center text-[11px] py-1 border-b border-slate-200">
            <div>
              <p className="font-bold text-slate-700">{sale.receiptNumber}</p>
              <p className="text-slate-500">{formattedDate}</p>
            </div>
            <div className="text-right">
              <PaymentMethodBadge method={sale.paymentMethod} />
              <p className="text-[10px] text-slate-500 mt-1">{sale.customerName || 'Consumidor Final'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 py-2 border-b border-slate-200">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500">
              <span>Cant. / Detalle</span>
              <span>Subtotal</span>
            </div>

            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    <span className="font-bold text-blue-900">{item.quantity}x</span> {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    ${item.price.toLocaleString('es-AR')} c/u {item.isCustom ? '(Mano de obra)' : ''}
                  </p>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ${item.subtotal.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>${sale.subtotal.toLocaleString('es-AR')}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Descuento aplicado:</span>
                <span>-${sale.discount.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-300">
              <span>TOTAL ABONADO:</span>
              <span className="text-blue-950">${sale.total.toLocaleString('es-AR')}</span>
            </div>

            {sale.paymentMethod === 'EFECTIVO' && sale.cashReceived !== undefined && (
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Efectivo entregado:</span>
                  <span>${sale.cashReceived.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Vuelto entregado:</span>
                  <span>${(sale.cashChange || 0).toLocaleString('es-AR')}</span>
                </div>
              </div>
            )}

            {sale.notes && (
              <p className="text-[10px] text-slate-500 italic pt-2">
                Nota: {sale.notes}
              </p>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center pt-3 border-t border-slate-200 text-[10px] text-slate-400">
            <p>¡Gracias por su compra!</p>
            <p>Conserve este ticket como comprobante de garantía.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-blue-900 hover:bg-blue-800 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Ticket</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
