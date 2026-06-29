import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { api, type BackendStaffUser } from '@/lib/api';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 text-[#999] hover:text-[#1A1A1A]" title="Copy">
      {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
    </button>
  );
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<BackendStaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor'>('editor');
  const [newPassword, setNewPassword] = useState('');
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<BackendStaffUser | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { users } = await api.getAdminUsers();
      setUsers(users);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openForm = () => {
    setNewEmail(''); setNewFirstName(''); setNewLastName('');
    setNewRole('editor'); setNewPassword(''); setFormError('');
    setCreatedPassword(null);
    setFormOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await api.createAdminUser({
        email: newEmail,
        password: newPassword,
        role: newRole,
        firstName: newFirstName || undefined,
        lastName: newLastName || undefined,
      });
      setCreatedPassword(newPassword);
      await load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRoleChange = async (user: BackendStaffUser, role: 'admin' | 'editor') => {
    try {
      await api.updateUserRole(user._id, role);
      await load();
    } catch {
      // silently fail — could add toast here
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.deleteAdminUser(deleting._id);
      setDeleting(null);
      await load();
    } catch {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Staff users</h2>
          <p className="text-sm text-[#666]">Admins and editors who can access this panel</p>
        </div>
        <Button onClick={openForm} className="bg-[#1A1A1A] hover:bg-[#333]">
          <Plus className="size-4 mr-1.5" /> Add user
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-[#999]">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-[#999]">No staff users yet</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium text-[#1A1A1A]">
                    {u.firstName || u.lastName ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—'}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value as 'admin' | 'editor')}
                      className="text-sm border border-[#E5E5E5] rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-[#666] text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(u)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create user dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); setCreatedPassword(null); } }}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Add staff user</DialogTitle>
            <DialogDescription>Create a new admin or editor account</DialogDescription>
          </DialogHeader>

          {createdPassword ? (
            <div className="space-y-4">
              <p className="text-sm text-[#1A1A1A]">User created successfully. Share these credentials:</p>
              <div className="bg-[#F5F5F5] rounded p-4 space-y-2 text-sm font-mono">
                <div className="flex items-center">
                  <span className="text-[#666] w-24">Email:</span>
                  <span>{newEmail}</span>
                  <CopyButton text={newEmail} />
                </div>
                <div className="flex items-center">
                  <span className="text-[#666] w-24">Password:</span>
                  <span>{createdPassword}</span>
                  <CopyButton text={createdPassword} />
                </div>
              </div>
              <p className="text-xs text-[#999]">This password won't be shown again. Copy it before closing.</p>
              <Button className="w-full bg-[#1A1A1A] hover:bg-[#333]" onClick={() => { setFormOpen(false); setCreatedPassword(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newEmail">Email <span className="text-red-500">*</span></Label>
                <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">Temporary password <span className="text-red-500">*</span></Label>
                <Input id="newPassword" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newRole">Role <span className="text-red-500">*</span></Label>
                <select
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor')}
                  className="w-full text-sm border border-[#E5E5E5] rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                >
                  <option value="editor">Editor — can add and edit products</option>
                  <option value="admin">Admin — full access including user management</option>
                </select>
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={formLoading} className="flex-1 bg-[#1A1A1A] hover:bg-[#333]">
                  {formLoading ? 'Creating...' : 'Create user'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.email}?</AlertDialogTitle>
            <AlertDialogDescription>This will delete their panel access. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
