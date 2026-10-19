import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const DashboardController = {
  // GET /api/dashboard/stats
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      // Calcular rango de hoy en hora local
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // Ventas de hoy
      const todaySales = await prisma.sale.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.total, 0);
      const todaySalesCount = todaySales.length;

      // Desglose de pagos de hoy
      const paymentBreakdown = todaySales.reduce(
        (acc, s) => {
          acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
          return acc;
        },
        {} as Record<string, number>
      );

      // Productos y alertas
      const allProducts = await prisma.product.findMany();
      const zeroStockCount = allProducts.filter((p) => p.stock === 0).length;
      const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;

      // Órdenes de trabajo
      const pendingWorkOrdersCount = await prisma.workOrder.count({
        where: { status: 'PENDIENTE' },
      });
      const inProgressWorkOrdersCount = await prisma.workOrder.count({
        where: { status: 'EN_PROCESO' },
      });

      res.json({
        success: true,
        data: {
          todaySalesTotal,
          todaySalesCount,
          lowStockCount,
          zeroStockCount,
          pendingWorkOrdersCount,
          inProgressWorkOrdersCount,
          paymentBreakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
