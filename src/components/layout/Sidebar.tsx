import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wrench,
  Receipt,
  RotateCcw,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { stats, cart, resetAllData } = useApp();

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer todos los datos a los valores de prueba iniciales de Tolosano?')) {
      resetAllData();
    }
  };

  const navLinks = [
    {
      to: '/',
      name: 'Panel Principal',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/pos',
      name: 'Punto de Venta (POS)',
      icon: ShoppingCart,
      badge: cart.length > 0 ? `${cart.length} en carrito` : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      to: '/inventario',
      name: 'Inventario y Stock',
      icon: Package,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} alerta` : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      to: '/cerrajeria',
      name: 'Órdenes de Cerrajería',
      icon: Wrench,
      badge: stats.pendingWorkOrdersCount > 0 ? `${stats.pendingWorkOrdersCount} pend.` : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      to: '/ventas',
      name: 'Historial de Ventas',
      icon: Receipt,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-800/80 px-6 py-5 bg-slate-950/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-slate-900 text-amber-400 shadow-md border border-blue-500/30">
            <KeyRound className="h-6 w-6 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-wider text-white">TOLOSANO</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 tracking-wide">Ferretería &amp; Cerrajería</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Gestión Operativa
          </p>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${link.badgeColor}`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-6">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Alertas del Sistema
            </p>
            {stats.lowStockCount > 0 && (
              <NavLink
                to="/inventario"
                onClick={onCloseMobile}
                className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                <div className="flex-1">
                  <p className="font-semibold">{stats.lowStockCount} artículos con stock bajo</p>
                  <p className="text-[10px] text-amber-400/80">Requieren pedido a proveedor</p>
                </div>
              </NavLink>
            )}
          </div>
        </nav>

        {/* Footer / Environment info */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/30">
          <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Etapa 1: Frontend Mock
              </span>
              <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mb-2.5">
              Datos sincronizados localmente en tu navegador.
            </p>
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors border border-slate-600/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer datos demo
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
