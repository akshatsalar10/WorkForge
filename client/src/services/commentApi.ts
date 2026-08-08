import { baseApi } from './api';
import { Comment, ActivityLog } from '../types/comment';

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskComments: builder.query<{ success: boolean; data: { comments: Comment[] } }, { orgId: string; taskId: string }>({
      query: ({ orgId, taskId }) => `/organizations/${orgId}/projects/dummy/tasks/${taskId}/comments`,
      providesTags: ['Task']
    }),
    createComment: builder.mutation<
      { success: boolean; data: { comment: Comment }; message: string },
      { orgId: string; taskId: string; content: string }
    >({
      query: ({ orgId, taskId, content }) => ({
        url: `/organizations/${orgId}/projects/dummy/tasks/${taskId}/comments`,
        method: 'POST',
        body: { content }
      }),
      invalidatesTags: ['Task']
    }),
    updateComment: builder.mutation<
      { success: boolean; data: { comment: Comment }; message: string },
      { orgId: string; taskId: string; commentId: string; content: string }
    >({
      query: ({ orgId, taskId, commentId, content }) => ({
        url: `/organizations/${orgId}/projects/dummy/tasks/${taskId}/comments/${commentId}`,
        method: 'PUT',
        body: { content }
      }),
      invalidatesTags: ['Task']
    }),
    deleteComment: builder.mutation<
      { success: boolean; message: string },
      { orgId: string; taskId: string; commentId: string }
    >({
      query: ({ orgId, taskId, commentId }) => ({
        url: `/organizations/${orgId}/projects/dummy/tasks/${taskId}/comments/${commentId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Task']
    }),
    getTaskActivities: builder.query<{ success: boolean; data: { activities: ActivityLog[] } }, { orgId: string; taskId: string }>({
      query: ({ orgId, taskId }) => `/organizations/${orgId}/projects/dummy/tasks/${taskId}/activity`,
      providesTags: ['Task']
    })
  })
});

export const {
  useGetTaskCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetTaskActivitiesQuery
} = commentApi;
