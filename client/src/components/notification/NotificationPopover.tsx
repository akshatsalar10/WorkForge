import React from 'react';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} from '../../services/notificationApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Bell, CheckCheck, Trash2, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useGetNotificationsQuery(undefined, { skip: !isOpen });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  if (!isOpen) return null;

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotif(id).unwrap();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
      {/* Popover Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white font-extrabold text-[10px]">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Read all
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
        {isLoading ? (
          <div className="p-6">
            <LoadingSpinner label="Loading notifications..." />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No notifications right now.</div>
        ) : (
          notifications.map((n) => {
            const notifId = n.id || n._id;
            return (
              <div
                key={notifId}
                className={`p-4 transition-colors relative group ${
                  !n.isRead ? 'bg-slate-800/50' : 'bg-slate-900/40 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                      <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                    <span className="text-[10px] text-slate-500 block">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkRead(notifId, e)}
                        className="p-1 text-slate-500 hover:text-brand-400 rounded"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notifId, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300 mt-2"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
