import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PosPage } from './pages/PosPage';
import { InventoryPage } from './pages/InventoryPage';
import { LocksmithPage } from './pages/LocksmithPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pos" element={<PosPage />} />
            <Route path="inventario" element={<InventoryPage />} />
            <Route path="cerrajeria" element={<LocksmithPage />} />
            <Route path="ventas" element={<SalesHistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
