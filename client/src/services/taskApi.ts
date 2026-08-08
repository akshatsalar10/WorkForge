import { baseApi } from './api';
import { Task, TaskStatus, TaskPriority, Label, Subtask } from '../types/task';

export interface CreateTaskRequest {
  orgId: string;
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labels?: string[];
  subtasks?: { title: string; isCompleted: boolean }[];
  dependencies?: string[];
}

export interface UpdateTaskRequest {
  orgId: string;
  projectId?: string;
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  order?: number;
  labels?: string[];
  subtasks?: Subtask[];
  dependencies?: string[];
}

export interface GetTasksParams {
  orgId: string;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationTasks: builder.query<{ success: boolean; data: Task[]; meta: any }, GetTasksParams>({
      query: ({ orgId, ...params }) => ({
        url: `/organizations/${orgId}/tasks`,
        params
      }),
      providesTags: ['Task']
    }),
    getProjectTasks: builder.query<{ success: boolean; data: Task[]; meta: any }, GetTasksParams>({
      query: ({ orgId, projectId, ...params }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/tasks`,
        params
      }),
      providesTags: ['Task']
    }),
    getTaskDetails: builder.query<{ success: boolean; data: { task: Task } }, { orgId: string; taskId: string }>({
      query: ({ orgId, taskId }) => `/organizations/${orgId}/projects/dummy/tasks/${taskId}`,
      providesTags: ['Task']
    }),
    createTask: builder.mutation<
      { success: boolean; data: { task: Task }; message: string },
      CreateTaskRequest
    >({
      query: ({ orgId, projectId, ...body }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/tasks`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Task']
    }),
    updateTask: builder.mutation<
      { success: boolean; data: { task: Task }; message: string },
      UpdateTaskRequest
    >({
      query: ({ orgId, projectId = 'dummy', taskId, ...body }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Task']
    }),
    updateTaskStatus: builder.mutation<
      { success: boolean; data: { task: Task }; message: string },
      { orgId: string; projectId?: string; taskId: string; status: TaskStatus; order?: number }
    >({
      query: ({ orgId, projectId = 'dummy', taskId, status, order }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/status`,
        method: 'PATCH',
        body: { status, order }
      }),
      invalidatesTags: ['Task']
    }),
    deleteTask: builder.mutation<{ success: boolean; message: string }, { orgId: string; projectId?: string; taskId: string }>({
      query: ({ orgId, projectId = 'dummy', taskId }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Task']
    }),
    getLabels: builder.query<{ success: boolean; data: { labels: Label[] } }, string>({
      query: (orgId) => `/organizations/${orgId}/labels`,
      providesTags: ['Task']
    }),
    createLabel: builder.mutation<{ success: boolean; data: { label: Label } }, { orgId: string; name: string; color?: string }>({
      query: ({ orgId, ...body }) => ({
        url: `/organizations/${orgId}/labels`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Task']
    })
  })
});

export const {
  useGetOrganizationTasksQuery,
  useGetProjectTasksQuery,
  useGetTaskDetailsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useGetLabelsQuery,
  useCreateLabelMutation
} = taskApi;
