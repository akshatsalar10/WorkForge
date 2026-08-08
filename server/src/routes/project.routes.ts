import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import taskRoutes from './task.routes';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';
import { projectGuard, requireProjectRole } from '../middlewares/project';
import { validate } from '../middlewares/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberRoleSchema
} from '../validators/project.validator';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(tenantGuard);

router.get('/', ProjectController.getProjects);
router.post('/', validate(createProjectSchema), ProjectController.createProject);

router.get('/:projectId', projectGuard, requireProjectRole('VIEWER'), ProjectController.getProject);
router.put('/:projectId', projectGuard, requireProjectRole('MANAGER'), validate(updateProjectSchema), ProjectController.updateProject);
router.patch('/:projectId/archive', projectGuard, requireProjectRole('MANAGER'), ProjectController.archiveProject);
router.delete('/:projectId', projectGuard, requireProjectRole('MANAGER'), ProjectController.deleteProject);

// Project Members
router.get('/:projectId/members', projectGuard, requireProjectRole('VIEWER'), ProjectController.getMembers);
router.post('/:projectId/members', projectGuard, requireProjectRole('MANAGER'), validate(addProjectMemberSchema), ProjectController.addMember);
router.patch('/:projectId/members/:userId', projectGuard, requireProjectRole('MANAGER'), validate(updateProjectMemberRoleSchema), ProjectController.updateMemberRole);
router.delete('/:projectId/members/:userId', projectGuard, requireProjectRole('MANAGER'), ProjectController.removeMember);

// Project Tasks (nested router)
router.use('/:projectId/tasks', taskRoutes);

export default router;
