import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment.controller';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';
import { uploadSingle } from '../middlewares/upload';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(tenantGuard);

router.post('/', uploadSingle, AttachmentController.uploadAttachment);
router.get('/', AttachmentController.getAttachments);
router.delete('/:id', AttachmentController.deleteAttachment);

export default router;
