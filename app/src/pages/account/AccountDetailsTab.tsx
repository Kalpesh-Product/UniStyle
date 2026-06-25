import { useState } from 'react';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import type { User } from '@/context/AuthContext';
import type { BackendUserPreferences } from '@/lib/api';
import { showToast } from '@/components/ToastContainer';

interface Props {
  user: User;
  updateProfile: (data: Partial<Omit<User, 'preferences'>> & { preferences?: Partial<BackendUserPreferences> }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

function toDateInputValue(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export function AccountDetailsTab({ user, updateProfile, deleteAccount }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone || '',
    dateOfBirth: toDateInputValue(user.dateOfBirth),
    gender: user.gender || '',
    nationality: user.nationality || '',
  });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startEdit = () => {
    setForm({
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: toDateInputValue(user.dateOfBirth),
      gender: user.gender || '',
      nationality: user.nationality || '',
    });
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const [firstName, ...rest] = form.fullName.trim().split(' ');
      await updateProfile({
        firstName: firstName || '',
        lastName: rest.join(' '),
        email: form.email,
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        nationality: form.nationality || undefined,
      });
      showToast('Account details updated');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = async (key: 'emailNotifications' | 'smsNotifications', value: boolean) => {
    const preferences: Partial<BackendUserPreferences> = { [key]: value };
    await updateProfile({ preferences });
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

  const prefs = user.preferences;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Account Details</h2>
      <p className="text-sm text-[#666] mb-6">Manage your personal information and account preferences.</p>

      <form onSubmit={handleSave} className="border border-[#E5E5E5] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold">Personal Information</h3>
          {!editing ? (
            <button type="button" onClick={startEdit} className="flex items-center gap-1 text-sm font-medium border border-[#E5E5E5] px-3 py-1.5 hover:border-[#1A1A1A] transition-colors">
              <Pencil size={12} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setEditing(false)} className="text-sm font-medium text-[#666] hover:text-[#1A1A1A]">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-4 py-2 hover:bg-[#333] transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Full Name</label>
            <input disabled={!editing} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] disabled:bg-[#FAFAFA] disabled:text-[#666]" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Email Address</label>
            <input disabled={!editing} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] disabled:bg-[#FAFAFA] disabled:text-[#666]" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Phone Number</label>
            <input disabled={!editing} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Not set" className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] disabled:bg-[#FAFAFA] disabled:text-[#666]" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Date of Birth</label>
            <input disabled={!editing} type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] disabled:bg-[#FAFAFA] disabled:text-[#666]" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Gender</label>
            <select disabled={!editing} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] disabled:bg-[#FAFAFA] disabled:text-[#666]">
              <option value="">Not set</option>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Nationality</label>
            <input disabled={!editing} value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} placeholder="Not set" className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] disabled:bg-[#FAFAFA] disabled:text-[#666]" />
          </div>
        </div>
      </form>

      <div className="border border-[#E5E5E5] divide-y divide-[#F0F0F0] mb-6">
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold">Email Notifications</p>
            <p className="text-xs text-[#666]">Receive order updates, recommendations and more.</p>
          </div>
          <button
            onClick={() => togglePreference('emailNotifications', !(prefs?.emailNotifications ?? true))}
            className={`text-xs font-semibold px-3 py-1 rounded-full ${prefs?.emailNotifications ?? true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {(prefs?.emailNotifications ?? true) ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold">SMS Notifications</p>
            <p className="text-xs text-[#666]">Receive important updates via text message.</p>
          </div>
          <button
            onClick={() => togglePreference('smsNotifications', !(prefs?.smsNotifications ?? false))}
            className={`text-xs font-semibold px-3 py-1 rounded-full ${prefs?.smsNotifications ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {prefs?.smsNotifications ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold">Language</p>
            <p className="text-xs text-[#666]">Choose your preferred language.</p>
          </div>
          <span className="text-sm text-[#666]">{prefs?.language || 'English (UK)'}</span>
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold">Currency</p>
            <p className="text-xs text-[#666]">Choose your preferred currency.</p>
          </div>
          <span className="text-sm text-[#666]">{prefs?.currency || 'GBP'}</span>
        </div>
      </div>

      <div className="border border-red-200 p-6">
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
    </div>
  );
}
