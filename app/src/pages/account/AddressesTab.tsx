import { useState } from 'react';
import { Plus, X, Pencil, Trash2, Home, Building2, Briefcase, Heart, MapPin, ShieldCheck } from 'lucide-react';
import type { Address } from '@/context/AuthContext';
import { showToast } from '@/components/ToastContainer';

const LABEL_OPTIONS = ['Home', 'Hostel', 'Work', 'Parents Home', 'Other'];

const LABEL_ICONS: Record<string, typeof Home> = {
  Home, Hostel: Building2, Work: Briefcase, 'Parents Home': Heart,
};

function labelIcon(label: string) {
  return LABEL_ICONS[label] || MapPin;
}

const emptyForm = {
  label: 'Home', firstName: '', lastName: '', address1: '', address2: '',
  city: '', country: '', postalCode: '', phone: '', isDefault: false,
};

interface Props {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Omit<Address, 'id'>>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
}

export function AddressesTab({ addresses, addAddress, updateAddress, removeAddress }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label, firstName: addr.firstName, lastName: addr.lastName,
      address1: addr.address1, address2: addr.address2 || '', city: addr.city,
      country: addr.country, postalCode: addr.postalCode, phone: addr.phone, isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
        showToast('Address updated');
      } else {
        await addAddress(form);
        showToast('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Addresses</h2>
        {!showForm && (
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#333] transition-colors">
            <Plus size={16} /> Add New Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#F5F5F5] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingId ? 'Edit Address' : 'New Address'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={16} /></button>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Label</label>
            <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]">
              {LABEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input required placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
            <input required placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
          </div>
          <input required placeholder="Address" value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] mb-4" />
          <input placeholder="Apartment, suite, etc. (optional)" value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input required placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
            <input required placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
            <input required placeholder="Postal Code" value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
          </div>
          <input required placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A] mb-4" />
          <label className="flex items-center gap-2 text-sm text-[#666] mb-4">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="accent-[#1A1A1A]" />
            Set as default address
          </label>
          <button type="submit" disabled={saving} className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:bg-[#333] transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      )}

      <p className="text-sm font-semibold mb-4">Saved Addresses ({addresses.length})</p>

      <div className="space-y-4 mb-6">
        {addresses.map(addr => {
          const Icon = labelIcon(addr.label);
          return (
            <div key={addr.id} className="border border-[#E5E5E5] p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {addr.isDefault && <span className="text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="font-bold">{addr.label}</p>
                  <p className="text-sm text-[#666] mt-1">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
                  <p className="text-sm text-[#666]">{addr.city}, {addr.postalCode}</p>
                  <p className="text-sm text-[#666]">{addr.country}</p>
                  <p className="text-sm text-[#666] mt-2">Phone: {addr.phone}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button onClick={() => openEdit(addr)} className="flex items-center gap-1 text-sm font-medium hover:text-[#1A1A1A] text-[#666]">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={async () => { await removeAddress(addr.id); showToast('Address removed'); }} className="flex items-center gap-1 text-sm font-medium text-[#666] hover:text-[#DC2626]">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {addresses.length === 0 && !showForm && (
          <p className="text-sm text-[#999]">No addresses saved.</p>
        )}
      </div>

      <div className="flex items-center gap-4 p-5 bg-[#F5F5F5]">
        <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
        <div>
          <p className="text-sm font-semibold">Your addresses are secure</p>
          <p className="text-xs text-[#666]">We use industry-standard encryption to keep your information safe.</p>
        </div>
      </div>
    </div>
  );
}
