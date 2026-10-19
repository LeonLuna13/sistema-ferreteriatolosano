import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Product, ProductCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { Package } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORIES: ProductCategory[] = [
  'Cerraduras y Cerrojos',
  'Llaves en Blanco y Copias',
  'Herramientas Manuales',
  'Herramientas Eléctricas',
  'Tornillería y Fijaciones',
  'Electricidad',
  'Pinturería y Adhesivos',
  'Plomería y Gas',
  'Seguridad y Candados',
  'Varios y Accesorios',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct } = useApp();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Cerraduras y Cerrojos');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setCostPrice(productToEdit.costPrice);
      setSalePrice(productToEdit.salePrice);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
      setDescription(productToEdit.description || '');
    } else {
      setSku('');
      setName('');
      setCategory('Cerraduras y Cerrojos');
      setCostPrice('');
      setSalePrice('');
      setStock(10);
      setMinStock(5);
      setDescription('');
    }
  }, [productToEdit, isOpen]);

  // Live profit margin calculation
  const numericCost = Number(costPrice) || 0;
  const numericSale = Number(salePrice) || 0;
  const profit = numericSale - numericCost;
  const marginPercentage =
    numericCost > 0 ? Math.round((profit / numericCost) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sku.trim() || !name.trim()) {
      alert('Por favor ingresa el código/SKU y el nombre del producto.');
      return;
    }

    if (numericCost < 0 || numericSale < 0) {
      alert('Los precios deben ser valores positivos.');
      return;
    }

    const finalStock = Number(stock) || 0;
    const finalMinStock = Number(minStock) || 0;

    if (productToEdit) {
      await updateProduct(productToEdit.id, {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        costPrice: numericCost,
        salePrice: numericSale,
        stock: finalStock,
        minStock: finalMinStock,
        description: description.trim(),
      });
    } else {
      await addProduct({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        costPrice: numericCost,
        salePrice: numericSale,
        stock: finalStock,
        minStock: finalMinStock,
        description: description.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? `Editar Producto: ${productToEdit.name}` : 'Nuevo Producto al Inventario'}
      subtitle="Configura datos comerciales, categorías y niveles de stock crítico"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SKU and Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Código / SKU *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej: CER-KAL-4000"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono uppercase focus:border-blue-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre o Descripción Comercial *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cerradura Kallay 4000 Seguridad Pasador Redondo"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Categoría del Producto *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-800 focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing & Profit Margin Preview */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
            Estructura de Precios ($ ARS)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Precio de Costo ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={costPrice}
                  onChange={(e) =>
                    setCostPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2 text-sm font-semibold focus:border-blue-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Precio de Venta Mostrador ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={salePrice}
                  onChange={(e) =>
                    setSalePrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Margen Estimado
              </label>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Ganancia:</span>
                  <span className={profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    ${profit.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                  <span>Rentabilidad:</span>
                  <span className="font-semibold text-slate-700">+{marginPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock & Minimum Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock Actual (Unidades en depósito/estante) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus:border-blue-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock Mínimo (Punto de Reorden) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="5"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-amber-700 focus:border-blue-800 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cuando el stock sea menor o igual a este valor, se disparará la alerta visual.
            </p>
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detalles adicionales / Ubicación en estante (Opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Estante C3 - Pasillo Cerrajería"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
          />
        </div>

        {/* Actions */}
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
            <Package className="w-4 h-4 text-amber-400" />
            {productToEdit ? 'Guardar Cambios' : 'Agregar al Inventario'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
