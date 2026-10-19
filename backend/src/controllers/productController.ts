import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export const ProductController = {
  // GET /api/products
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, lowStock } = req.query;

      const where: any = {};

      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category && typeof category === 'string' && category !== 'TODAS') {
        where.category = category;
      }

      let products = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      // Filter in memory or query for lowStock if requested
      if (lowStock === 'true') {
        products = products.filter((p) => p.stock <= p.minStock);
      }

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/products/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new AppError('Producto no encontrado.', 404);
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/products
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { sku, name, category, costPrice, salePrice, stock, minStock, description } = req.body;

      if (!sku || !name || !category) {
        throw new AppError('Los campos sku, nombre y categoría son obligatorios.', 400);
      }

      const numCost = Number(costPrice);
      const numSale = Number(salePrice);
      const numStock = Number(stock ?? 0);
      const numMinStock = Number(minStock ?? 5);

      if (isNaN(numCost) || isNaN(numSale) || numCost < 0 || numSale < 0) {
        throw new AppError('Los precios deben ser valores numéricos válidos y no negativos.', 400);
      }

      // Verify SKU uniqueness
      const existing = await prisma.product.findUnique({
        where: { sku: sku.trim().toUpperCase() },
      });

      if (existing) {
        throw new AppError(`El código / SKU "${sku}" ya está registrado para otro producto.`, 409);
      }

      const product = await prisma.product.create({
        data: {
          sku: sku.trim().toUpperCase(),
          name: name.trim(),
          category,
          costPrice: numCost,
          salePrice: numSale,
          stock: numStock,
          minStock: numMinStock,
          description: description?.trim() || null,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/products/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { sku, name, category, costPrice, salePrice, stock, minStock, description } = req.body;

      const existing = await prisma.product.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new AppError('Producto no encontrado para actualizar.', 404);
      }

      // If SKU is changing, check uniqueness
      if (sku && sku.trim().toUpperCase() !== existing.sku) {
        const skuCheck = await prisma.product.findUnique({
          where: { sku: sku.trim().toUpperCase() },
        });
        if (skuCheck) {
          throw new AppError(`El código SKU "${sku}" ya pertenece a otro artículo.`, 409);
        }
      }

      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(sku && { sku: sku.trim().toUpperCase() }),
          ...(name && { name: name.trim() }),
          ...(category && { category }),
          ...(costPrice !== undefined && { costPrice: Number(costPrice) }),
          ...(salePrice !== undefined && { salePrice: Number(salePrice) }),
          ...(stock !== undefined && { stock: Number(stock) }),
          ...(minStock !== undefined && { minStock: Number(minStock) }),
          ...(description !== undefined && { description: description?.trim() || null }),
        },
      });

      res.json({
        success: true,
        message: 'Producto actualizado con éxito.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/products/:id/stock
  async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { delta, newStock } = req.body;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new AppError('Producto no encontrado.', 404);
      }

      let updatedStock = product.stock;

      if (newStock !== undefined) {
        updatedStock = Math.max(0, Number(newStock));
      } else if (delta !== undefined) {
        updatedStock = Math.max(0, product.stock + Number(delta));
      } else {
        throw new AppError('Debes indicar delta (+/-) o newStock.', 400);
      }

      const updated = await prisma.product.update({
        where: { id },
        data: { stock: updatedStock },
      });

      res.json({
        success: true,
        message: `Stock actualizado a ${updatedStock} unidades.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/products/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new AppError('Producto no encontrado.', 404);
      }

      await prisma.product.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: `Producto "${product.name}" eliminado correctamente.`,
      });
    } catch (error) {
      next(error);
    }
  },
};
