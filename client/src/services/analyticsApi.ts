import { baseApi } from './api';
import { AnalyticsSummary, UserWorkload } from '../types/analytics';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsSummary: builder.query<{ success: boolean; data: AnalyticsSummary }, string>({
      query: (orgId) => `/organizations/${orgId}/analytics/summary`,
      providesTags: ['Task', 'Project']
    }),
    getWorkloadAnalytics: builder.query<{ success: boolean; data: { workload: UserWorkload[] } }, string>({
      query: (orgId) => `/organizations/${orgId}/analytics/workload`,
      providesTags: ['Task']
    })
  })
});

export const { useGetAnalyticsSummaryQuery, useGetWorkloadAnalyticsQuery } = analyticsApi;
