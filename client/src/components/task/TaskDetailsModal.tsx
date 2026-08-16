import React, { useState } from 'react';
import { useGetTaskDetailsQuery, useUpdateTaskMutation, useDeleteTaskMutation } from '../../services/taskApi';
import {
  useGetTaskCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetTaskActivitiesQuery
} from '../../services/commentApi';
import { useGetMembersQuery } from '../../services/organizationApi';
import { TaskStatus, TaskPriority } from '../../types/task';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AttachmentList } from '../common/AttachmentList';
import { X, CheckSquare, Plus, Trash2, MessageSquare, History, Send } from 'lucide-react';

export interface TaskDetailsModalProps {
  orgId: string;
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  orgId,
  taskId,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [commentContent, setCommentContent] = useState('');

  const { data, isLoading } = useGetTaskDetailsQuery(
    { orgId, taskId },
    { skip: !isOpen || !taskId }
  );
  const { data: membersData } = useGetMembersQuery(orgId, { skip: !isOpen });

  const { data: commentsData } = useGetTaskCommentsQuery(
    { orgId, taskId },
    { skip: !isOpen || activeTab !== 'comments' }
  );

  const { data: activitiesData } = useGetTaskActivitiesQuery(
    { orgId, taskId },
    { skip: !isOpen || activeTab !== 'activity' }
  );

  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [createComment, { isLoading: isSubmittingComment }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen) return null;
  if (isLoading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <LoadingSpinner label="Loading task details..." />
      </div>
    );
  }

  const task = data.data.task;
  const members = membersData?.data?.members || [];
  const comments = commentsData?.data?.comments || [];
  const activities = activitiesData?.data?.activities || [];

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      await updateTask({ orgId, taskId, status }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update status');
    }
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    try {
      await updateTask({ orgId, taskId, priority }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update priority');
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await updateTask({ orgId, taskId, assigneeId: assigneeId || null }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update assignee');
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    const updatedSubtasks = (task.subtasks || []).map((s) =>
      (s._id || s.id) === subtaskId ? { ...s, isCompleted: !isCompleted } : s
    );
    try {
      await updateTask({ orgId, taskId, subtasks: updatedSubtasks }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to toggle subtask');
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updatedSubtasks = [...(task.subtasks || []), { title: newSubtaskTitle.trim(), isCompleted: false }];
    try {
      await updateTask({ orgId, taskId, subtasks: updatedSubtasks }).unwrap();
      setNewSubtaskTitle('');
    } catch (err: any) {
      alert(err.data?.message || 'Failed to add subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter((s) => (s._id || s.id) !== subtaskId);
    try {
      await updateTask({ orgId, taskId, subtasks: updatedSubtasks }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete subtask');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      await createComment({ orgId, taskId, content: commentContent.trim() }).unwrap();
      setCommentContent('');
    } catch (err: any) {
      alert(err.data?.message || 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({ orgId, taskId, commentId }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete comment');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm(`Delete task ${task.taskKey}?`)) return;
    try {
      await deleteTask({ orgId, taskId }).unwrap();
      onClose();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-brand-950 border border-brand-800 text-brand-400 font-extrabold text-xs tracking-wider">
              {task.taskKey}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{task.projectId?.name || 'Project'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{task.title}</h2>

        {/* Tabs Bar */}
        <div className="flex items-center gap-3 sm:gap-4 border-b border-slate-800 text-xs font-semibold overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'details' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Task Details & Subtasks
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'comments' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Comments ({comments.length})
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'activity' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Activity Stream
          </button>
        </div>

        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {task.description || 'No description provided for this task.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-semibold">Status</label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-bold"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-semibold">Priority</label>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 font-bold"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-semibold">Assignee</label>
                <select
                  value={task.assigneeId?.id || task.assigneeId?._id || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => {
                    const uid = m.userId.id || m.userId._id;
                    return (
                      <option key={uid} value={uid}>
                        {m.userId.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand-400" /> Subtask Checklist ({(task.subtasks || []).filter((s) => s.isCompleted).length}/{(task.subtasks || []).length})
              </h3>

              <div className="space-y-1.5">
                {(task.subtasks || []).map((s) => {
                  const sid = s._id || s.id || '';
                  return (
                    <div key={sid} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.isCompleted}
                          onChange={() => handleToggleSubtask(sid, s.isCompleted)}
                          className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                        />
                        <span className={s.isCompleted ? 'line-through text-slate-400' : ''}>{s.title}</span>
                      </label>
                      <button onClick={() => handleDeleteSubtask(sid)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add subtask item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700/80 text-xs text-slate-100 rounded-lg px-3 py-2 outline-none"
                />
                <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add
                </Button>
              </form>
            </div>

            {/* Attachments Section */}
            <div className="pt-4 border-t border-slate-800">
              <AttachmentList orgId={orgId} entityType="TASK" entityId={taskId} />
            </div>
          </div>
        )}

        {/* TAB 2: COMMENTS */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <form onSubmit={handlePostComment} className="space-y-2">
              <textarea
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/50 h-20"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingComment} leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Post Comment
                </Button>
              </div>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id || c._id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200">{c.authorId?.name || 'User'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                        <button onClick={() => handleDeleteComment(c.id || c._id)} className="text-slate-600 hover:text-rose-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITY STREAM */}
        {activeTab === 'activity' && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No activity recorded yet.</p>
            ) : (
              activities.map((a) => (
                <div key={a.id || a._id} className="flex items-start gap-3 text-xs p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="w-6 h-6 rounded-full bg-brand-700 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    {a.actorId?.name?.slice(0, 2) || 'US'}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-300 font-medium">
                      <span className="font-bold text-white">{a.actorId?.name || 'System User'}</span> performed{' '}
                      <span className="font-mono text-brand-400">{a.action}</span>
                    </p>
                    <span className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="danger" size="sm" onClick={handleDeleteTask} leftIcon={<Trash2 className="w-4 h-4" />}>
            Delete Task
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
