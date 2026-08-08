import { baseApi } from './api';
import { Project, ProjectMember, ProjectStatus, ProjectPriority, ProjectRole } from '../types/project';

export interface CreateProjectRequest {
  orgId: string;
  name: string;
  key?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  dueDate?: string;
  teamId?: string;
}

export interface UpdateProjectRequest {
  orgId: string;
  projectId: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string | null;
  dueDate?: string | null;
  teamId?: string | null;
}

export interface GetProjectsParams {
  orgId: string;
  status?: string;
  priority?: string;
  isArchived?: boolean;
  search?: string;
}

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<{ success: boolean; data: Project[]; meta: any }, GetProjectsParams>({
      query: ({ orgId, ...params }) => ({
        url: `/organizations/${orgId}/projects`,
        params
      }),
      providesTags: ['Project']
    }),
    getProjectDetails: builder.query<
      { success: boolean; data: { project: Project; memberCount: number } },
      { orgId: string; projectId: string }
    >({
      query: ({ orgId, projectId }) => `/organizations/${orgId}/projects/${projectId}`,
      providesTags: ['Project']
    }),
    createProject: builder.mutation<
      { success: boolean; data: { project: Project; member: ProjectMember }; message: string },
      CreateProjectRequest
    >({
      query: ({ orgId, ...body }) => ({
        url: `/organizations/${orgId}/projects`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Project']
    }),
    updateProject: builder.mutation<
      { success: boolean; data: { project: Project }; message: string },
      UpdateProjectRequest
    >({
      query: ({ orgId, projectId, ...body }) => ({
        url: `/organizations/${orgId}/projects/${projectId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Project']
    }),
    archiveProject: builder.mutation<
      { success: boolean; data: { project: Project }; message: string },
      { orgId: string; projectId: string; isArchived: boolean }
    >({
      query: ({ orgId, projectId, isArchived }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/archive`,
        method: 'PATCH',
        body: { isArchived }
      }),
      invalidatesTags: ['Project']
    }),
    deleteProject: builder.mutation<{ success: boolean; message: string }, { orgId: string; projectId: string }>({
      query: ({ orgId, projectId }) => ({
        url: `/organizations/${orgId}/projects/${projectId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Project']
    }),
    getProjectMembers: builder.query<
      { success: boolean; data: { members: ProjectMember[] } },
      { orgId: string; projectId: string }
    >({
      query: ({ orgId, projectId }) => `/organizations/${orgId}/projects/${projectId}/members`,
      providesTags: ['Project']
    }),
    addProjectMember: builder.mutation<
      { success: boolean; data: { member: ProjectMember }; message: string },
      { orgId: string; projectId: string; userId: string; role: ProjectRole }
    >({
      query: ({ orgId, projectId, ...body }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/members`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Project']
    }),
    updateProjectMemberRole: builder.mutation<
      { success: boolean; data: { member: ProjectMember }; message: string },
      { orgId: string; projectId: string; userId: string; role: ProjectRole }
    >({
      query: ({ orgId, projectId, userId, role }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/members/${userId}`,
        method: 'PATCH',
        body: { role }
      }),
      invalidatesTags: ['Project']
    }),
    removeProjectMember: builder.mutation<
      { success: boolean; message: string },
      { orgId: string; projectId: string; userId: string }
    >({
      query: ({ orgId, projectId, userId }) => ({
        url: `/organizations/${orgId}/projects/${projectId}/members/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Project']
    })
  })
});

export const {
  useGetProjectsQuery,
  useGetProjectDetailsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
  useRemoveProjectMemberMutation
} = projectApi;
