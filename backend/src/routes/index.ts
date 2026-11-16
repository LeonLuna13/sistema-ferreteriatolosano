import { Router } from 'express';
import productRoutes from './productRoutes';
import saleRoutes from './saleRoutes';
import workOrderRoutes from './workOrderRoutes';
import dashboardRoutes from './dashboardRoutes';
import { prisma } from '../lib/prisma';

const apiRouter = Router();

apiRouter.use('/products', productRoutes);
apiRouter.use('/sales', saleRoutes);
apiRouter.use('/work-orders', workOrderRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Healthcheck endpoint (verifica también conectividad real con PostgreSQL)
apiRouter.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      service: 'Tolosano Backend API',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'El servidor backend responde pero la base de datos PostgreSQL no está disponible.',
    });
  }
});

export default apiRouter;
