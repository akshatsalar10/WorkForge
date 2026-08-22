import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../services/authApi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { User, Lock, CheckCircle2, AlertCircle, ShieldCheck, Upload, Trash2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().optional()
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setValueProfile,
    watch: watchProfile,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      avatarUrl: user?.avatarUrl || ''
    }
  });

  const currentAvatarUrl = watchProfile('avatarUrl') || user?.avatarUrl;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'error', message: 'Image size must be less than 5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setValueProfile('avatarUrl', reader.result, { shouldValidate: true, shouldDirty: true });
        setProfileMsg({ type: 'success', message: 'Image selected! Click "Save Profile Changes" to update.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setValueProfile('avatarUrl', '', { shouldValidate: true, shouldDirty: true });
  };

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors }
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema)
  });

  const onUpdateProfile = async (data: ProfileFormValues) => {
    setProfileMsg(null);
    try {
      await updateProfile(data).unwrap();
      setProfileMsg({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', message: err.data?.message || 'Failed to update profile.' });
    }
  };

  const onChangePassword = async (data: ChangePasswordValues) => {
    setPasswordMsg(null);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }).unwrap();
      setPasswordMsg({ type: 'success', message: 'Password updated successfully. All other active sessions revoked.' });
      resetPasswordForm();
    } catch (err: any) {
      setPasswordMsg({ type: 'error', message: err.data?.message || 'Failed to change password.' });
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Profile & Security Settings</h1>
        <p className="text-sm text-slate-400">Manage your personal credentials, profile picture, and password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 flex flex-col items-center text-center p-6 space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-brand-700 border-2 border-brand-500/50 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-xl overflow-hidden">
              {currentAvatarUrl ? (
                <img src={currentAvatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2) || 'WF'
              )}
            </div>
            <label
              className="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-150 hover:scale-110"
              title="Upload Profile Picture"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>

          <div className="flex flex-col gap-2 w-full pt-2">
            <label className="w-full border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all">
              <Upload className="w-3.5 h-3.5 text-brand-400" />
              <span>Choose Photo File</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            {currentAvatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1 py-1"
              >
                <Trash2 className="w-3 h-3" /> Remove Photo
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-700/60 w-full flex justify-center">
            {user?.isEmailVerified ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Pending Verification
              </Badge>
            )}
          </div>
        </Card>

        {/* Update Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" /> General Details
            </h2>

            {profileMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{profileMsg.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <Input
                label="Full Name"
                error={profileErrors.name?.message}
                {...registerProfile('name')}
              />

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border border-dashed border-slate-700 hover:border-brand-500/50 bg-slate-900/60 hover:bg-slate-900 p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-200">Upload an Image File</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WEBP or GIF (Max 5MB)</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <Input
                label="Or Avatar Image URL"
                placeholder="https://images.unsplash.com/photo-..."
                error={profileErrors.avatarUrl?.message}
                {...registerProfile('avatarUrl')}
              />

              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
                Save Profile Changes
              </Button>
            </form>
          </Card>

          {/* Change Password Form */}
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" /> Security & Password
            </h2>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{passwordMsg.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />

              <Input
                label="New Password"
                type="password"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              <Button type="submit" variant="primary" size="sm" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
