import React, { useRef } from 'react';
import {
  useGetEntityAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation
} from '../../services/attachmentApi';
import { AttachmentEntityType } from '../../types/attachment';
import { Button } from './Button';
import { Paperclip, Upload, FileText, Image as ImageIcon, Trash2, Download } from 'lucide-react';

export interface AttachmentListProps {
  orgId: string;
  entityType: AttachmentEntityType;
  entityId: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ orgId, entityType, entityId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data } = useGetEntityAttachmentsQuery({ orgId, entityType, entityId });
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  const attachments = data?.data?.attachments || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAttachment({ orgId, file, entityType, entityId }).unwrap();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(err.data?.message || 'Failed to upload attachment.');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await deleteAttachment({ orgId, attachmentId }).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete attachment.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-brand-400" /> File Attachments ({attachments.length})
        </h3>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload File
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
            No files attached yet. Upload specifications, images, or documents.
          </p>
        ) : (
          attachments.map((att) => {
            const attId = att.id || att._id;
            const isImage = att.mimeType.startsWith('image/');

            return (
              <div
                key={attId}
                className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0">
                    {isImage ? <ImageIcon className="w-4 h-4 text-brand-400" /> : <FileText className="w-4 h-4 text-amber-400" />}
                  </div>

                  <div>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-200 hover:text-brand-300 line-clamp-1 flex items-center gap-1.5"
                    >
                      {att.originalName}
                    </a>
                    <span className="text-[10px] text-slate-400">
                      {formatFileSize(att.size)} • Uploaded by {att.uploaderId?.name || 'User'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={att.url}
                    download={att.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-brand-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(attId)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title="Delete Attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
