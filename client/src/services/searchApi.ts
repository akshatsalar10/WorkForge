import { baseApi } from './api';
import { SearchResults } from '../types/search';

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query<{ success: boolean; data: SearchResults }, { orgId: string; query: string }>({
      query: ({ orgId, query }) => ({
        url: `/organizations/${orgId}/search`,
        params: { q: query }
      }),
      providesTags: ['Task', 'Project']
    })
  })
});

export const { useGlobalSearchQuery } = searchApi;
