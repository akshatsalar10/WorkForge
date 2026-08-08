import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    database: {
      status: string;
      readyState: number;
    };
    memoryUsage: Record<string, number>;
  };
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('workforge_access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const activeOrgId = localStorage.getItem('workforge_active_org_id');
      if (activeOrgId) {
        headers.set('X-Organization-Id', activeOrgId);
      }
      return headers;
    }
  }),
  tagTypes: ['User', 'Organization', 'Project', 'Task', 'Member', 'Team', 'Comment', 'Notification'],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthCheckResponse, void>({
      query: () => '/health'
    })
  })
});

export const { useGetHealthQuery } = baseApi;
