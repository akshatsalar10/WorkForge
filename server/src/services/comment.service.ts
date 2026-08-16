import { Comment, IComment } from '../models/comment.model';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { ActivityService } from './activity.service';
import { EmailService } from './email.service';
import { AppError } from '../utils/appError';

export class CommentService {
  static async createComment(
    orgId: string,
    taskId: string,
    authorId: string,
    content: string
  ): Promise<IComment> {
    const task = await Task.findOne({ _id: taskId, organizationId: orgId });
    if (!task) {
      throw new AppError('Task not found in this organization.', 404);
    }

    const comment = await Comment.create({
      organizationId: orgId,
      taskId,
      authorId,
      content,
      isEdited: false
    });

    await ActivityService.logEvent(orgId, 'TASK', taskId, authorId, 'COMMENT_ADDED', {
      commentId: comment._id,
      snippet: content.length > 50 ? `${content.slice(0, 50)}...` : content
    });

    // Notify task assignee if different from author
    if (task.assigneeId && task.assigneeId.toString() !== authorId) {
      const [assignee, author] = await Promise.all([
        User.findById(task.assigneeId),
        User.findById(authorId)
      ]);
      if (assignee && author) {
        EmailService.sendCommentNotificationEmail(
          assignee.email,
          assignee.name,
          task.title,
          task.taskKey,
          author.name,
          content
        ).catch((err) => console.error('Failed to send comment email notification:', err));
      }
    }

    return await comment.populate('authorId', 'name email avatarUrl');
  }

  static async getTaskComments(orgId: string, taskId: string): Promise<IComment[]> {
    const comments = await Comment.find({ organizationId: orgId, taskId })
      .populate('authorId', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    return comments;
  }

  static async updateComment(
    orgId: string,
    commentId: string,
    userId: string,
    isOrgAdmin: boolean,
    content: string
  ): Promise<IComment> {
    const comment = await Comment.findOne({ _id: commentId, organizationId: orgId });
    if (!comment) {
      throw new AppError('Comment not found.', 404);
    }

    if (comment.authorId.toString() !== userId && !isOrgAdmin) {
      throw new AppError('Permission denied. You can only edit your own comments.', 403);
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    return await comment.populate('authorId', 'name email avatarUrl');
  }

  static async deleteComment(
    orgId: string,
    commentId: string,
    userId: string,
    isOrgAdmin: boolean
  ): Promise<void> {
    const comment = await Comment.findOne({ _id: commentId, organizationId: orgId });
    if (!comment) {
      throw new AppError('Comment not found.', 404);
    }

    if (comment.authorId.toString() !== userId && !isOrgAdmin) {
      throw new AppError('Permission denied. You can only delete your own comments.', 403);
    }

    await Comment.findByIdAndDelete(commentId);
  }
}
