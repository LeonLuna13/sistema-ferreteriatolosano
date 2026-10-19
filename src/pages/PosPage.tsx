import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { PaymentMethod, Sale } from '../types';
import { CustomItemModal } from '../components/pos/CustomItemModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Wrench,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
} from 'lucide-react';

export const PosPage: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    completeSale,
  } = useApp();

  // Search & category filter in the POS catalog
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  // Payment configuration
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  // Modals
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Available categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Catalog items filtered
  const filteredCatalog = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat =
        selectedCategory === 'TODAS' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Totals
  const numericDiscount = Number(discount) || 0;
  const grandTotal = Math.max(0, cartSubtotal - numericDiscount);
  const numericCash = Number(cashReceived) || 0;
  const cashChange =
    paymentMethod === 'EFECTIVO' && numericCash > grandTotal
      ? numericCash - grandTotal
      : 0;

  const handleConfirmSale = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'EFECTIVO' && numericCash < grandTotal && numericCash > 0) {
      alert('El monto en efectivo ingresado es insuficiente.');
      return;
    }

    const sale = await completeSale({
      paymentMethod,
      discount: numericDiscount,
      cashReceived: paymentMethod === 'EFECTIVO' && numericCash > 0 ? numericCash : undefined,
      customerName: customerName.trim() || undefined,
      notes: saleNotes.trim() || undefined,
    });

    if (sale) {
      setCompletedSale(sale);
      // Reset form fields
      setCashReceived('');
      setDiscount('');
      setCustomerName('');
      setSaleNotes('');
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-5 animate-fade-in">
      {/* LEFT COLUMN: Product Catalog & Fast Search */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Catalog Search & Actions */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe para buscar por producto o SKU..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Locksmith Labor Button */}
            <button
              onClick={() => setIsCustomItemModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm transition-all whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ Mano de Obra / Copia</span>
            </button>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('TODAS')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'TODAS'
                  ? 'bg-blue-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-900 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3">
            {filteredCatalog.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product, 1)}
                  className={`group relative rounded-xl border p-3.5 flex flex-col justify-between transition-all select-none ${
                    isOutOfStock
                      ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:border-blue-900 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>{product.sku}</span>
                      <span
                        className={`font-semibold px-1.5 py-0.2 rounded ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Agotado'
                          : isLowStock
                          ? `${product.stock} u. (Bajo)`
                          : `${product.stock} u.`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {product.category}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-blue-950">
                      ${product.salePrice.toLocaleString('es-AR')}
                    </span>
                    {!isOutOfStock && (
                      <span className="text-[10px] font-bold text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-2 py-0.5 rounded">
                        + Agregar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCatalog.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No se encontraron artículos con el filtro actual.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart, Totals & Checkout */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900">Carrito de Venta</h3>
            <span className="rounded-full bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs font-semibold text-slate-500">El carrito está vacío</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Haz clic en los productos del catálogo o agrega mano de obra de cerrajería
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.isCustom && (
                      <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2">
                        MANO DE OBRA
                      </span>
                    )}
                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    ${item.price.toLocaleString('es-AR')} c/u
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right shrink-0 w-20">
                  <p className="text-xs font-black text-slate-900">
                    ${item.subtotal.toLocaleString('es-AR')}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[10px] text-rose-500 hover:text-rose-700"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout & Payment Area */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                  paymentMethod === 'EFECTIVO'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4 mb-1 text-emerald-600" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MERCADOPAGO')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                  paymentMethod === 'MERCADOPAGO'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4 mb-1 text-sky-600" />
                <span>Mercado Pago</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TARJETA')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all ${
                  paymentMethod === 'TARJETA'
                    ? 'border-blue-800 bg-blue-50 text-blue-900 ring-1 ring-blue-800'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1 text-blue-800" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Cash input & Change calculator */}
          {paymentMethod === 'EFECTIVO' && (
            <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Efectivo Recibido ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashReceived}
                  onChange={(e) =>
                    setCashReceived(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Ej: 50000"
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                  Vuelto a Entregar
                </label>
                <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-800">
                  ${cashChange.toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          )}

          {/* Customer name & Discount */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Cliente (Opcional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Consumidor Final"
                className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Descuento ($)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0"
                className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none text-emerald-700 font-semibold"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal:</span>
              <span>${cartSubtotal.toLocaleString('es-AR')}</span>
            </div>
            {numericDiscount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Descuento:</span>
                <span>-${numericDiscount.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-slate-900 uppercase">Total a Cobrar:</span>
              <span className="text-2xl font-black text-blue-950">
                ${grandTotal.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmSale}
            disabled={cart.length === 0}
            className="w-full rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-blue-900 py-3 text-xs font-bold text-white shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span>Confirmar y Cobrar Venta</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <CustomItemModal
        isOpen={isCustomItemModalOpen}
        onClose={() => setIsCustomItemModalOpen(false)}
      />

      <ReceiptModal
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
      />
    </div>
  );
};
