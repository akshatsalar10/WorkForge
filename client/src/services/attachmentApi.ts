import { baseApi } from './api';
import { Attachment, AttachmentEntityType } from '../types/attachment';

export const attachmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEntityAttachments: builder.query<
      { success: boolean; data: { attachments: Attachment[] } },
      { orgId: string; entityType: AttachmentEntityType; entityId: string }
    >({
      query: ({ orgId, entityType, entityId }) => ({
        url: `/organizations/${orgId}/attachments`,
        params: { entityType, entityId }
      }),
      providesTags: ['Task']
    }),
    uploadAttachment: builder.mutation<
      { success: boolean; data: { attachment: Attachment }; message: string },
      { orgId: string; file: File; entityType: AttachmentEntityType; entityId: string }
    >({
      query: ({ orgId, file, entityType, entityId }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);

        return {
          url: `/organizations/${orgId}/attachments`,
          method: 'POST',
          body: formData
        };
      },
      invalidatesTags: ['Task']
    }),
    deleteAttachment: builder.mutation<
      { success: boolean; message: string },
      { orgId: string; attachmentId: string }
    >({
      query: ({ orgId, attachmentId }) => ({
        url: `/organizations/${orgId}/attachments/${attachmentId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Task']
    })
  })
});

export const {
  useGetEntityAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation
} = attachmentApi;
