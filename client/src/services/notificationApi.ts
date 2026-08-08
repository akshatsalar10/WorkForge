import { baseApi } from './api';
import { Notification } from '../types/notification';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ success: boolean; data: Notification[]; meta: any }, void>({
      query: () => '/notifications',
      providesTags: ['Notification']
    }),
    getUnreadCount: builder.query<{ success: boolean; data: { unreadCount: number } }, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification']
    }),
    markAsRead: builder.mutation<{ success: boolean; data: { notification: Notification } }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Notification']
    }),
    markAllAsRead: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH'
      }),
      invalidatesTags: ['Notification']
    }),
    deleteNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Notification']
    })
  })
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi;
