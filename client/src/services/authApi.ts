import { baseApi } from './api';
import { User, AuthTokens } from '../types/auth';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<{ success: boolean; data: AuthResponse; message: string }, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body
      })
    }),
    login: builder.mutation<{ success: boolean; data: AuthResponse; message: string }, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body
      })
    }),
    logoutApi: builder.mutation<{ success: boolean; message: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body
      })
    }),
    getCurrentUser: builder.query<{ success: boolean; data: { user: User } }, void>({
      query: () => '/auth/me',
      providesTags: ['User']
    }),
    updateProfile: builder.mutation<{ success: boolean; data: { user: User }; message: string }, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['User']
    }),
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body
      })
    }),
    forgotPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body
      })
    }),
    resetPassword: builder.mutation<{ success: boolean; message: string }, { token: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body
      })
    }),
    verifyEmail: builder.mutation<{ success: boolean; message: string }, { token: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body
      }),
      invalidatesTags: ['User']
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutApiMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation
} = authApi;
