import { Router } from 'express';
import { WorkOrderController } from '../controllers/workOrderController';

const router = Router();

router.get('/', WorkOrderController.getAll);
router.get('/:id', WorkOrderController.getById);
router.post('/', WorkOrderController.create);
router.put('/:id', WorkOrderController.update);
router.patch('/:id/status', WorkOrderController.updateStatus);
router.delete('/:id', WorkOrderController.delete);

export default router;
