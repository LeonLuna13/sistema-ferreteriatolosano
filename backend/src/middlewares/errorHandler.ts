import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('💥 Error detectado en el servidor:', err);

  // Error operacional controlado
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violación de restricción única (ej. SKU o receiptNumber duplicado)
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'campo único';
      return res.status(409).json({
        success: false,
        message: `Ya existe un registro con el mismo valor para: ${target}.`,
        code: err.code,
      });
    }

    // Registro no encontrado para actualizar o eliminar
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'El registro solicitado no fue encontrado en la base de datos.',
        code: err.code,
      });
    }
  }

  // Error de validación de Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Los datos enviados no cumplen con el esquema de la base de datos.',
      details: err.message,
    });
  }

  // Error no controlado (500)
  return res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
