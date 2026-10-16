import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Product, ProductCategory } from '../types';
import { StockBadge } from '../components/common/Badge';
import { ProductModal } from '../components/inventory/ProductModal';
import {
  Search,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  Package,
  ArrowUpDown,
  ShoppingCart,
} from 'lucide-react';

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

export const InventoryPage: React.FC = () => {
  const { products, deleteProduct, adjustStock, addToCart } = useApp();
  const location = useLocation();

  // Search, category and stock filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [onlyLowStock, setOnlyLowStock] = useState(() => {
    return new URLSearchParams(location.search).get('filter') === 'low';
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search term matches SKU or name
        const matchSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchCategory =
          selectedCategory === 'TODAS' || p.category === selectedCategory;

        // Stock filter
        const matchStock = !onlyLowStock || p.stock <= p.minStock;

        return matchSearch && matchCategory && matchStock;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') comp = a.name.localeCompare(b.name);
        else if (sortBy === 'stock') comp = a.stock - b.stock;
        else if (sortBy === 'price') comp = a.salePrice - b.salePrice;
        return sortAsc ? comp : -comp;
      });
  }, [products, searchTerm, selectedCategory, onlyLowStock, sortBy, sortAsc]);

  // Overall inventory metrics
  const totalItemsCount = products.length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const inventoryCostValue = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
  const inventorySaleValue = products.reduce((acc, p) => acc + p.salePrice * p.stock, 0);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${name}" del inventario?`)) {
      deleteProduct(id);
    }
  };

  const toggleSort = (field: 'name' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top action header and stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-900" />
            Catálogo y Control de Stock
          </h2>
          <p className="text-xs text-slate-500">
            Administra precios de costo, precios de venta y niveles mínimos de reposición
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 hover:bg-blue-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-950/20 transition-all"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Mini metric summary chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Artículos</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{totalItemsCount}</p>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`cursor-pointer rounded-xl border p-3.5 shadow-sm transition-all ${
            onlyLowStock
              ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/40'
              : 'border-slate-200 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-amber-800 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Stock Crítico
            </p>
            {onlyLowStock && (
              <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded">
                Filtrado
              </span>
            )}
          </div>
          <p className="text-xl font-black text-amber-600 mt-0.5">{lowStockCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Valuación al Costo</p>
          <p className="text-xl font-black text-slate-800 mt-0.5">
            ${inventoryCostValue.toLocaleString('es-AR')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Valuación en Venta</p>
          <p className="text-xl font-black text-emerald-700 mt-0.5">
            ${inventorySaleValue.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Quick search input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código SKU o categoría..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:bg-white focus:border-blue-800 focus:outline-none"
            />
          </div>

          {/* Category dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-800 focus:outline-none"
            >
              <option value="TODAS">Todas las categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Low stock toggle switch */}
          <div className="md:col-span-3 flex items-center justify-end">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Solo stock bajo ({lowStockCount})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Código / SKU</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Producto</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Costo</th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Precio Venta</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('stock')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Stock Actual</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No se encontraron productos</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Intenta modificando los términos de búsqueda o los filtros aplicados.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {p.sku}
                      </td>

                      {/* Name & description */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                        <p className="font-semibold">{p.name}</p>
                        {p.description && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        ${p.costPrice.toLocaleString('es-AR')}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                        ${p.salePrice.toLocaleString('es-AR')}
                      </td>

                      {/* Stock Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <StockBadge stock={p.stock} minStock={p.minStock} />
                      </td>

                      {/* Quick Stock adjustment +/- */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button
                            title="Descontar 1 unidad"
                            onClick={() => adjustStock(p.id, -1)}
                            disabled={p.stock <= 0}
                            className="rounded p-1 text-slate-600 hover:bg-white hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold font-mono px-1.5 text-xs text-slate-800">
                            {p.stock}
                          </span>
                          <button
                            title="Sumar 1 unidad"
                            onClick={() => adjustStock(p.id, 1)}
                            className="rounded p-1 text-slate-600 hover:bg-white hover:text-emerald-600"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick add to cart */}
                          <button
                            title="Agregar al carrito de mostrador"
                            onClick={() => addToCart(p, 1)}
                            disabled={p.stock <= 0}
                            className="rounded-lg p-1.5 text-blue-900 hover:bg-blue-50 disabled:opacity-30 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            title="Editar detalles del producto"
                            onClick={() => handleOpenEdit(p)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            title="Eliminar producto"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />
    </div>
  );
};
