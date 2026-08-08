import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';
import { requireOrgRole } from '../middlewares/rbac';
import { validate } from '../middlewares/validate';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema
} from '../validators/team.validator';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(tenantGuard);

router.get('/', TeamController.getTeams);
router.post('/', requireOrgRole('ADMIN'), validate(createTeamSchema), TeamController.createTeam);

router.get('/:teamId', TeamController.getTeam);
router.put('/:teamId', requireOrgRole('ADMIN'), validate(updateTeamSchema), TeamController.updateTeam);
router.delete('/:teamId', requireOrgRole('ADMIN'), TeamController.deleteTeam);

router.post('/:teamId/members', requireOrgRole('ADMIN'), validate(addTeamMemberSchema), TeamController.addMember);
router.delete('/:teamId/members/:userId', requireOrgRole('ADMIN'), TeamController.removeMember);

export default router;
