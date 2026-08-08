import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth';
import { tenantGuard } from '../middlewares/tenant';
import { validate } from '../middlewares/validate';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(tenantGuard);

router.get('/', CommentController.getComments);
router.post('/', validate(createCommentSchema), CommentController.createComment);
router.put('/:commentId', validate(updateCommentSchema), CommentController.updateComment);
router.delete('/:commentId', CommentController.deleteComment);

export default router;
