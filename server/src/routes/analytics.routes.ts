import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(tenantGuard);

router.get('/summary', AnalyticsController.getSummary);
router.get('/workload', AnalyticsController.getWorkload);

export default router;
