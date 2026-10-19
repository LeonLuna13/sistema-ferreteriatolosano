import { Router } from 'express';
import productRoutes from './productRoutes';
import saleRoutes from './saleRoutes';
import workOrderRoutes from './workOrderRoutes';
import dashboardRoutes from './dashboardRoutes';

const apiRouter = Router();

apiRouter.use('/products', productRoutes);
apiRouter.use('/sales', saleRoutes);
apiRouter.use('/work-orders', workOrderRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Healthcheck endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Tolosano Backend API',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
