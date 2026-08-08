import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(tenantGuard);

router.get('/', SearchController.globalSearch);

export default router;
