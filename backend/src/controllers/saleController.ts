import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

interface CartItemInput {
  productId?: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  isCustom?: boolean;
  subtotal: number;
}

export const SaleController = {
  // GET /api/sales
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentMethod, search, startDate, endDate } = req.query;

      const where: any = {};

      if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod !== 'TODOS') {
        where.paymentMethod = paymentMethod;
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { receiptNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate && typeof startDate === 'string') {
          where.date.gte = new Date(startDate);
        }
        if (endDate && typeof endDate === 'string') {
          where.date.lte = new Date(endDate);
        }
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { date: 'desc' },
      });

      res.json({
        success: true,
        data: sales,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/sales/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!sale) {
        throw new AppError('Comprobante de venta no encontrado.', 404);
      }

      res.json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/sales (Transacción atómica: guarda venta y descuenta stock)
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        items,
        paymentMethod,
        discount = 0,
        cashReceived,
        customerName,
        notes,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new AppError('El carrito de venta debe contener al menos un artículo.', 400);
      }

      if (!paymentMethod) {
        throw new AppError('Debes especificar un método de pago.', 400);
      }

      const numDiscount = Number(discount) || 0;

      // Ejecutar en transacción atómica de Prisma
      const newSale = await prisma.$transaction(async (tx) => {
        // 1. Validar y descontar stock para artículos que no sean mano de obra libre
        for (const item of items as CartItemInput[]) {
          if (!item.isCustom && item.productId) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });

            if (!product) {
              throw new AppError(`El producto "${item.name}" no existe en el catálogo.`, 404);
            }

            if (product.stock < item.quantity) {
              throw new AppError(
                `Stock insuficiente para "${product.name}". Disponible: ${product.stock} u., Solicitado: ${item.quantity} u.`,
                400
              );
            }

            // Descontar stock
            await tx.product.update({
              where: { id: product.id },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }

        // 2. Calcular subtotal y total
        const subtotal = items.reduce(
          (acc: number, item: CartItemInput) => acc + item.price * item.quantity,
          0
        );
        const total = Math.max(0, subtotal - numDiscount);

        // 3. Generar número de comprobante único correlativo
        const count = await tx.sale.count();
        const year = new Date().getFullYear();
        const receiptNumber = `VTA-${year}-${(count + 1).toString().padStart(4, '0')}`;

        // 4. Calcular vuelto si es en efectivo
        let cashChange: number | null = null;
        if (paymentMethod === 'EFECTIVO' && cashReceived !== undefined) {
          const numCash = Number(cashReceived);
          if (numCash < total) {
            throw new AppError('El monto abonado en efectivo es menor al total a pagar.', 400);
          }
          cashChange = Math.max(0, numCash - total);
        }

        // 5. Crear la venta con sus ítems asociados
        const sale = await tx.sale.create({
          data: {
            receiptNumber,
            subtotal,
            discount: numDiscount,
            total,
            paymentMethod,
            cashReceived: cashReceived !== undefined ? Number(cashReceived) : null,
            cashChange,
            customerName: customerName?.trim() || 'Cliente mostrador',
            notes: notes?.trim() || null,
            items: {
              create: items.map((item: CartItemInput) => ({
                productId: item.productId || null,
                name: item.name,
                sku: item.sku || null,
                price: Number(item.price),
                quantity: Number(item.quantity),
                isCustom: Boolean(item.isCustom),
                subtotal: Number(item.price) * Number(item.quantity),
              })),
            },
          },
          include: {
            items: true,
          },
        });

        return sale;
      });

      res.status(201).json({
        success: true,
        message: `Venta ${newSale.receiptNumber} confirmada y stock descontado con éxito.`,
        data: newSale,
      });
    } catch (error) {
      next(error);
    }
  },
};
