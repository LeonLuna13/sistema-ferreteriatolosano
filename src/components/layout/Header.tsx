import React from 'react';
import { Menu, PlusCircle, ShoppingBag, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onToggleMobile: () => void;
  onOpenNewOrderModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile, onOpenNewOrderModal }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Page titles map
  const titles: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Panel de Control', subtitle: 'Resumen diario y métricas clave de la ferretería' },
    '/pos': { title: 'Punto de Venta / Caja', subtitle: 'Mostrador ágil para cobros, stock y mano de obra' },
    '/inventario': { title: 'Inventario y Stock', subtitle: 'Control de artículos de ferretería y cerrajería' },
    '/cerrajeria': { title: 'Órdenes de Cerrajería', subtitle: 'Seguimiento de trabajos de taller y a domicilio' },
    '/ventas': { title: 'Historial de Ventas', subtitle: 'Comprobantes emitidos y arqueo de caja' },
  };

  const currentInfo = titles[location.pathname] || {
    title: 'Tolosano',
    subtitle: 'Gestión Comercial',
  };

  // Formatted date in Spanish
  const todayFormatted = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Capitalize first letter
  const displayDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile toggle button */}
        <button
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{currentInfo.title}</h1>
          <p className="text-xs text-slate-500 font-normal">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Right Side: Date & Quick Actions */}
      <div className="flex items-center gap-4">
        {/* Today's date */}
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-2 text-xs font-medium text-slate-600 border border-slate-200/60">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{displayDate}</span>
        </div>

        {/* Quick New Sale button (if not already on /pos) */}
        {location.pathname !== '/pos' && (
          <button
            onClick={() => navigate('/pos')}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-blue-900 hover:bg-blue-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all shadow-blue-950/20"
          >
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            <span>Cobro / POS</span>
          </button>
        )}

        {/* Quick New Locksmith Order button (if modal trigger passed) */}
        {onOpenNewOrderModal && (
          <button
            onClick={onOpenNewOrderModal}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-sm transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nueva O.T. Cerrajería</span>
          </button>
        )}
      </div>
    </header>
  );
};
