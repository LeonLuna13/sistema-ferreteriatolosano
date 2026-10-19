import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.patch('/:id/stock', ProductController.adjustStock);
router.delete('/:id', ProductController.delete);

export default router;
