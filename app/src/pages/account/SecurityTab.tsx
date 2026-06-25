import { useState } from 'react';
import { Lock, Smartphone, Monitor, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { showToast } from '@/components/ToastContainer';

interface Props {
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export function SecurityTab({ changePassword, deleteAccount }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('Password updated');
      setShowForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showToast('Account deleted');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Security</h2>
      <p className="text-sm text-[#666] mb-6">Manage your account security and keep your information safe.</p>

      <div className="border border-[#E5E5E5] mb-6">
        <div className="flex items-center justify-between p-5">
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Lock size={18} /></div>
            <span>
              <span className="block text-sm font-semibold">Password</span>
              <span className="block text-xs text-[#666]">Keep your account secure with a strong password</span>
            </span>
          </span>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="text-sm font-medium border border-[#E5E5E5] px-4 py-2 hover:border-[#1A1A1A] transition-colors">
              Change Password
            </button>
          )}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4 max-w-[420px]">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Current Password</label>
              <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">New Password</label>
              <input required type="password" minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Confirm New Password</label>
              <input required type="password" minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="text-sm text-[#666] px-4 py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-6 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="border border-[#E5E5E5] divide-y divide-[#F0F0F0] mb-6">
        <div className="flex items-center justify-between p-5">
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Smartphone size={18} /></div>
            <span>
              <span className="block text-sm font-semibold">Two-Factor Authentication</span>
              <span className="block text-xs text-[#666]">Add an extra layer of security to your account.</span>
            </span>
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Coming soon</span>
        </div>
        <div className="flex items-center justify-between p-5">
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Monitor size={18} /></div>
            <span>
              <span className="block text-sm font-semibold">Login Sessions</span>
              <span className="block text-xs text-[#666]">Manage your active sessions across devices.</span>
            </span>
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Coming soon</span>
        </div>
      </div>

      <div className="border border-red-200 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">Delete Account</p>
            <p className="text-xs text-[#666]">Permanently delete your account and all of your data.</p>
          </div>
          {!confirmingDelete ? (
            <button onClick={() => setConfirmingDelete(true)} className="flex items-center gap-2 text-sm font-medium text-[#DC2626] border border-[#DC2626] px-4 py-2 hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-[#DC2626]"><AlertTriangle size={14} /> This cannot be undone</span>
              <button onClick={() => setConfirmingDelete(false)} className="text-sm text-[#666] px-3 py-2">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="text-sm font-medium text-white bg-[#DC2626] px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-60">
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-[#F5F5F5]">
        <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
        <div>
          <p className="text-sm font-semibold">Your security is our priority</p>
          <p className="text-xs text-[#666]">We use industry-standard encryption to protect your data and keep your account secure.</p>
        </div>
      </div>
    </div>
  );
}
