import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export const WorkOrderController = {
  // GET /api/work-orders
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search } = req.query;

      const where: any = {};

      if (status && typeof status === 'string' && status !== 'TODAS') {
        where.status = status;
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { clientName: { contains: search, mode: 'insensitive' } },
          { clientPhone: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const workOrders = await prisma.workOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: workOrders,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/work-orders/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await prisma.workOrder.findUnique({
        where: { id },
      });

      if (!order) {
        throw new AppError('Orden de cerrajería no encontrada.', 404);
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/work-orders
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        clientName,
        clientPhone,
        clientAddress,
        isHomeService = false,
        orderType,
        description,
        status = 'PENDIENTE',
        estimatedCost = 0,
        deposit = 0,
        promisedDate,
        notes,
      } = req.body;

      if (!clientName || !clientPhone || !description || !orderType) {
        throw new AppError('Cliente, teléfono, tipo de servicio y descripción son requeridos.', 400);
      }

      const numCost = Number(estimatedCost) || 0;
      const numDeposit = Number(deposit) || 0;
      const balance = Math.max(0, numCost - numDeposit);

      // Auto-generar número correlativo OT-XXXX
      const count = await prisma.workOrder.count();
      const orderNumber = `OT-${(count + 1).toString().padStart(4, '0')}`;

      const order = await prisma.workOrder.create({
        data: {
          orderNumber,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          clientAddress: isHomeService ? clientAddress?.trim() || null : null,
          isHomeService: Boolean(isHomeService),
          orderType,
          description: description.trim(),
          status,
          estimatedCost: numCost,
          deposit: numDeposit,
          balance,
          promisedDate: promisedDate ? new Date(promisedDate) : null,
          notes: notes?.trim() || null,
        },
      });

      res.status(201).json({
        success: true,
        message: `Orden ${order.orderNumber} creada con éxito.`,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/work-orders/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const {
        clientName,
        clientPhone,
        clientAddress,
        isHomeService,
        orderType,
        description,
        status,
        estimatedCost,
        deposit,
        promisedDate,
        notes,
      } = req.body;

      const existing = await prisma.workOrder.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new AppError('Orden de cerrajería no encontrada para actualizar.', 404);
      }

      const finalCost = estimatedCost !== undefined ? Number(estimatedCost) : existing.estimatedCost;
      const finalDeposit = deposit !== undefined ? Number(deposit) : existing.deposit;
      const finalBalance = Math.max(0, finalCost - finalDeposit);

      const finalStatus = status || existing.status;
      const completedAt =
        (finalStatus === 'TERMINADO' || finalStatus === 'ENTREGADO') && !existing.completedAt
          ? new Date()
          : existing.completedAt;

      const updated = await prisma.workOrder.update({
        where: { id },
        data: {
          ...(clientName && { clientName: clientName.trim() }),
          ...(clientPhone && { clientPhone: clientPhone.trim() }),
          ...(isHomeService !== undefined && { isHomeService: Boolean(isHomeService) }),
          ...(clientAddress !== undefined && {
            clientAddress: isHomeService ? clientAddress?.trim() || null : null,
          }),
          ...(orderType && { orderType }),
          ...(description && { description: description.trim() }),
          status: finalStatus,
          estimatedCost: finalCost,
          deposit: finalDeposit,
          balance: finalBalance,
          completedAt,
          ...(promisedDate !== undefined && {
            promisedDate: promisedDate ? new Date(promisedDate) : null,
          }),
          ...(notes !== undefined && { notes: notes?.trim() || null }),
        },
      });

      res.json({
        success: true,
        message: 'Orden de cerrajería actualizada.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/work-orders/:id/status
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        throw new AppError('Debes indicar el nuevo estado.', 400);
      }

      const validStatuses = ['PENDIENTE', 'EN_PROCESO', 'TERMINADO', 'ENTREGADO'];
      if (!validStatuses.includes(status)) {
        throw new AppError(`Estado no válido. Opciones: ${validStatuses.join(', ')}`, 400);
      }

      const completedAt = status === 'TERMINADO' || status === 'ENTREGADO' ? new Date() : null;

      const updated = await prisma.workOrder.update({
        where: { id },
        data: {
          status,
          ...(completedAt && { completedAt }),
        },
      });

      res.json({
        success: true,
        message: `Estado de la orden actualizado a ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/work-orders/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const order = await prisma.workOrder.findUnique({
        where: { id },
      });

      if (!order) {
        throw new AppError('Orden no encontrada.', 404);
      }

      await prisma.workOrder.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: `Orden ${order.orderNumber} eliminada correctamente.`,
      });
    } catch (error) {
      next(error);
    }
  },
};
