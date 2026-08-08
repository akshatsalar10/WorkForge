import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { CommentController } from '../controllers/comment.controller';
import commentRoutes from './comment.routes';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';
import { projectGuard, requireProjectRole } from '../middlewares/project';
import { validate } from '../middlewares/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  createLabelSchema
} from '../validators/task.validator';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(tenantGuard);

// Project Task Scoped Endpoints
router.get('/', projectGuard, requireProjectRole('VIEWER'), TaskController.getProjectTasks);
router.post('/', projectGuard, requireProjectRole('MEMBER'), validate(createTaskSchema), TaskController.createTask);

router.get('/:taskId', TaskController.getTask);
router.put('/:taskId', projectGuard, requireProjectRole('MEMBER'), validate(updateTaskSchema), TaskController.updateTask);
router.patch('/:taskId/status', projectGuard, requireProjectRole('MEMBER'), validate(updateTaskStatusSchema), TaskController.updateTaskStatus);
router.delete('/:taskId', projectGuard, requireProjectRole('MANAGER'), TaskController.deleteTask);

// Task Activity Stream & Comments (nested router)
router.get('/:taskId/activity', CommentController.getTaskActivities);
router.use('/:taskId/comments', commentRoutes);

export default router;
