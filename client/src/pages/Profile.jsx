import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Save, Camera, ArrowLeft, Lock, Eye, EyeOff, User, Pencil, Mail, AtSign, Type } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, username, displayName });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      addToast('Profile updated', 'success');
      setEditing(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setUsername(user?.username || '');
    setDisplayName(user?.displayName || '');
    setEditing(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      addToast('Password changed', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setChangingPassword(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePicClick = () => {
    fileInputRef.current?.click();
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await api.post('/auth/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfilePic(res.data.user.profilePic);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      addToast('Profile picture updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload picture', 'error');
    }
  };

  const picUrl = profilePic
    ? `http://localhost:5000${profilePic}`
    : null;

  const displayNameValue = displayName || user?.name;
  const usernameValue = username ? `@${username}` : '';

  return (
    <div className="page-container max-w-2xl">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-all duration-200 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="card p-8 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div
              onClick={handlePicClick}
              className="w-28 h-28 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 hover:border-primary-500/40 hover:bg-primary-500/5 flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden group"
            >
              {picUrl ? (
                <img src={picUrl} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <User size={32} className="text-gray-500 group-hover:text-primary-400 transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-primary-400 transition-colors">Add photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                <Camera size={22} className="text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePicUpload}
              className="hidden"
            />
          </div>
          <h1 className="text-xl font-bold text-white">{displayNameValue}</h1>
          {usernameValue && <p className="text-sm text-primary-400">{usernameValue}</p>}
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="@username"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="How your name appears in the app"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-ghost">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User size={14} />
                  Name
                </div>
                <p className="text-white font-medium">{user?.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <AtSign size={14} />
                  Username
                </div>
                <p className="text-white font-medium">{username || '—'}</p>
              </div>
              <div className="sm:col-span-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Type size={14} />
                  Display Name
                </div>
                <p className="text-white font-medium">{displayName || '—'}</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="btn-primary"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Change Password</h2>
              <p className="text-sm text-gray-400">Update your account password</p>
            </div>
            <button
              type="button"
              onClick={() => setChangingPassword(!changingPassword)}
              className="btn-ghost text-sm"
            >
              {changingPassword ? 'Cancel' : 'Change'}
            </button>
          </div>

          {changingPassword && (
            <form onSubmit={handleChangePassword} className="space-y-4 animate-slide-up">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={passwordSaving} className="btn-primary">
                {passwordSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
