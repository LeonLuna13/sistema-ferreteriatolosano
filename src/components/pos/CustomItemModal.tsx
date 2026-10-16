import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Wrench, Sparkles } from 'lucide-react';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_SERVICES = [
  { name: 'Copia Llave Común (Yale / Silca)', price: 2000 },
  { name: 'Copia Llave Doble Paleta', price: 3500 },
  { name: 'Copia Llave Multipunto / Computada', price: 6500 },
  { name: 'Copia Llave Cruz', price: 4000 },
  { name: 'Mano de Obra / Ajuste en Mostrador', price: 4500 },
  { name: 'Cambio de Combinación en Taller', price: 18000 },
];

export const CustomItemModal: React.FC<CustomItemModalProps> = ({ isOpen, onClose }) => {
  const { addCustomItemToCart } = useApp();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(price) <= 0) {
      alert('Ingresa una descripción válida y un precio mayor a 0.');
      return;
    }

    addCustomItemToCart(name.trim(), Number(price), quantity);
    setName('');
    setPrice('');
    setQuantity(1);
    onClose();
  };

  const handleSelectPreset = (preset: { name: string; price: number }) => {
    setName(preset.name);
    setPrice(preset.price);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Mano de Obra o Ítem Libre"
      subtitle="Cobro rápido de copias de llaves, reparaciones o servicios de cerrajería"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset chips for fast selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Accesos Rápidos de Cerrajería
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SERVICES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{p.name}</span>
                <span className="font-bold text-slate-900">${p.price.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Descripción del Concepto / Servicio *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Copia de llave computada o service express"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Precio Unitario ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold focus:border-blue-800 focus:outline-none"
            />
          </div>
        </div>

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
            Agregar al Carrito
          </button>
        </div>
      </form>
    </Modal>
  );
};
