import { baseApi } from './api';
import { Team } from '../types/team';

export interface CreateTeamRequest {
  orgId: string;
  name: string;
  description?: string;
  members?: string[];
}

export interface UpdateTeamRequest {
  orgId: string;
  teamId: string;
  name?: string;
  description?: string;
}

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<{ success: boolean; data: { teams: Team[] } }, string>({
      query: (orgId) => `/organizations/${orgId}/teams`,
      providesTags: ['Team']
    }),
    getTeamDetails: builder.query<{ success: boolean; data: { team: Team } }, { orgId: string; teamId: string }>({
      query: ({ orgId, teamId }) => `/organizations/${orgId}/teams/${teamId}`,
      providesTags: ['Team']
    }),
    createTeam: builder.mutation<{ success: boolean; data: { team: Team }; message: string }, CreateTeamRequest>({
      query: ({ orgId, ...body }) => ({
        url: `/organizations/${orgId}/teams`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Team']
    }),
    updateTeam: builder.mutation<{ success: boolean; data: { team: Team }; message: string }, UpdateTeamRequest>({
      query: ({ orgId, teamId, ...body }) => ({
        url: `/organizations/${orgId}/teams/${teamId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Team']
    }),
    deleteTeam: builder.mutation<{ success: boolean; message: string }, { orgId: string; teamId: string }>({
      query: ({ orgId, teamId }) => ({
        url: `/organizations/${orgId}/teams/${teamId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Team']
    }),
    addTeamMember: builder.mutation<
      { success: boolean; data: { team: Team }; message: string },
      { orgId: string; teamId: string; userId: string }
    >({
      query: ({ orgId, teamId, userId }) => ({
        url: `/organizations/${orgId}/teams/${teamId}/members`,
        method: 'POST',
        body: { userId }
      }),
      invalidatesTags: ['Team']
    }),
    removeTeamMember: builder.mutation<
      { success: boolean; data: { team: Team }; message: string },
      { orgId: string; teamId: string; userId: string }
    >({
      query: ({ orgId, teamId, userId }) => ({
        url: `/organizations/${orgId}/teams/${teamId}/members/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Team']
    })
  })
});

export const {
  useGetTeamsQuery,
  useGetTeamDetailsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation
} = teamApi;
