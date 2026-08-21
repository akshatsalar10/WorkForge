import { baseApi } from './api';
import {
  Organization,
  UserOrganization,
  OrganizationMember,
  Invitation,
  OrgRole
} from '../types/organization';

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  logoUrl?: string;
}

export interface UpdateOrganizationRequest {
  orgId: string;
  name?: string;
  logoUrl?: string;
}

export interface InviteMemberRequest {
  orgId: string;
  email: string;
  role: OrgRole;
}

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserOrganizations: builder.query<{ success: boolean; data: { organizations: UserOrganization[] } }, void>({
      query: () => '/organizations',
      providesTags: ['Organization']
    }),
    getOrganizationDetails: builder.query<
      {
        success: boolean;
        data: { organization: Organization; role: OrgRole; memberCount: number };
      },
      string
    >({
      query: (orgId) => `/organizations/${orgId}`,
      providesTags: ['Organization']
    }),
    createOrganization: builder.mutation<
      { success: boolean; data: { organization: Organization; member: OrganizationMember }; message: string },
      CreateOrganizationRequest
    >({
      query: (body) => ({
        url: '/organizations',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Organization']
    }),
    updateOrganization: builder.mutation<
      { success: boolean; data: { organization: Organization }; message: string },
      UpdateOrganizationRequest
    >({
      query: ({ orgId, ...body }) => ({
        url: `/organizations/${orgId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Organization']
    }),
    deleteOrganization: builder.mutation<
      { success: boolean; message: string },
      { orgId: string; confirmationSlug: string }
    >({
      query: ({ orgId, confirmationSlug }) => ({
        url: `/organizations/${orgId}`,
        method: 'DELETE',
        body: { confirmationSlug }
      }),
      invalidatesTags: ['Organization']
    }),
    getMembers: builder.query<{ success: boolean; data: { members: OrganizationMember[] } }, string>({
      query: (orgId) => `/organizations/${orgId}/members`,
      providesTags: ['Member']
    }),
    changeMemberRole: builder.mutation<
      { success: boolean; data: { member: OrganizationMember }; message: string },
      { orgId: string; memberId: string; role: OrgRole }
    >({
      query: ({ orgId, memberId, role }) => ({
        url: `/organizations/${orgId}/members/${memberId}/role`,
        method: 'PATCH',
        body: { role }
      }),
      invalidatesTags: ['Member']
    }),
    deleteMember: builder.mutation<{ success: boolean; message: string }, { orgId: string; userId: string }>({
      query: ({ orgId, userId }) => ({
        url: `/organizations/${orgId}/members/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Organization']
    }),
    getAuditLogs: builder.query<{ success: boolean; data: { logs: any[] } }, string>({
      query: (orgId) => `/organizations/${orgId}/audit-logs`,
      providesTags: ['Organization']
    }),
    removeMember: builder.mutation<{ success: boolean; message: string }, { orgId: string; memberId: string }>({
      query: ({ orgId, memberId }) => ({
        url: `/organizations/${orgId}/members/${memberId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Member']
    }),
    getPendingInvitations: builder.query<{ success: boolean; data: { invitations: Invitation[] } }, string>({
      query: (orgId) => `/organizations/${orgId}/invitations`,
      providesTags: ['Organization']
    }),
    inviteMember: builder.mutation<{ success: boolean; data: { invitation: Invitation; inviteUrl?: string }; message: string }, InviteMemberRequest>({
      query: ({ orgId, ...body }) => ({
        url: `/organizations/${orgId}/invitations`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Organization']
    }),
    revokeInvitation: builder.mutation<{ success: boolean; message: string }, { orgId: string; invitationId: string }>({
      query: ({ orgId, invitationId }) => ({
        url: `/organizations/${orgId}/invitations/${invitationId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Organization']
    }),
    acceptInvitation: builder.mutation<
      { success: boolean; data: { organization: Organization; member: OrganizationMember }; message: string },
      { token: string }
    >({
      query: (body) => ({
        url: '/invitations/accept',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Organization']
    })
  })
});

export const {
  useGetUserOrganizationsQuery,
  useGetOrganizationDetailsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetMembersQuery,
  useChangeMemberRoleMutation,
  useRemoveMemberMutation,
  useGetPendingInvitationsQuery,
  useInviteMemberMutation,
  useRevokeInvitationMutation,
  useAcceptInvitationMutation,
  useGetAuditLogsQuery
} = organizationApi;
