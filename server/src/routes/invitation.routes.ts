import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { acceptInvitationSchema } from '../validators/organization.validator';

const router = Router();

router.use(authenticate);
router.post('/accept', validate(acceptInvitationSchema), OrganizationController.acceptInvitation);

export default router;
