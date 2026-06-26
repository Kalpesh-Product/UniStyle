import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Plus, Pencil, Trash2, Upload, Download, LogOut, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { api, ApiError, getAdminToken, setAdminToken, type BackendProduct, type AdminProductInput } from '@/lib/api';
import { AdminProductForm } from './AdminProductForm';
import { AdminCsvUpload } from './AdminCsvUpload';

export function AdminPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [search, setSearch] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BackendProduct | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [deleting, setDeleting] = useState<BackendProduct | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { products } = await api.getProducts({
        search: search || undefined,
        featured: featuredOnly ? true : undefined,
        limit: 100,
      });
      setProducts(products);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setAdminToken(null);
        navigate('/admin/login', { replace: true });
        return;
      }
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, featuredOnly]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: BackendProduct) => { setEditing(p); setFormOpen(true); };

  const toggleFeatured = async (p: BackendProduct) => {
    await api.updateProduct(p._id, { featured: !p.featured });
    await load();
  };

  const featuredCount = products.filter((p) => p.featured).length;

  const handleSave = async (data: AdminProductInput) => {
    if (editing) {
      await api.updateProduct(editing._id, data);
    } else {
      await api.createProduct(data);
    }
    setFormOpen(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await api.deleteProduct(deleting._id);
    setDeleting(null);
    await load();
  };

  const handleLogout = () => {
    setAdminToken(null);
    navigate('/admin/login', { replace: true });
  };

  const handleExport = () => {
    const rows = products.map((p) => ({
      Name: p.name,
      Slug: p.slug,
      Category: p.category,
      University: p.university ?? '',
      Price: (p.price / 100).toFixed(2),
      'Compare At': p.compareAt ? (p.compareAt / 100).toFixed(2) : '',
      Stock: p.stock,
      Status: p.stock > 0 ? 'In stock' : 'Out of stock',
      Featured: p.featured ? 'Yes' : 'No',
      Rating: p.rating ?? '',
      Reviews: p.reviewCount ?? '',
      Badge: p.badge ?? '',
      Sizes: p.sizes.join(', '),
      Colors: p.colors.map((c) => c.name).join(', '),
      Description: p.description,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Products');
    XLSX.writeFile(workbook, `unistyle-products-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">UniStyle Admin</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4 mr-1.5" /> Log out
          </Button>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={featuredOnly ? 'default' : 'outline'}
              className={featuredOnly ? 'bg-[#1A1A1A] hover:bg-[#333]' : undefined}
              onClick={() => setFeaturedOnly((v) => !v)}
            >
              <Star className="size-4 mr-1.5" /> Featured only
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={products.length === 0}>
              <Download className="size-4 mr-1.5" /> Export
            </Button>
            <Button variant="outline" onClick={() => setCsvOpen(true)}>
              <Upload className="size-4 mr-1.5" /> Upload CSV
            </Button>
            <Button onClick={openCreate} className="bg-[#1A1A1A] hover:bg-[#333]">
              <Plus className="size-4 mr-1.5" /> Add product
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {featuredCount > 3 && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
            {featuredCount} products are marked Featured, but the homepage only shows 3. Turn off the extras below so you know exactly which 3 will appear.
          </p>
        )}

        <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-[#999]">Loading...</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-[#999]">No products found</TableCell></TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 object-cover rounded bg-[#F5F5F5]"
                        />
                        <span className="font-medium text-[#1A1A1A]">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      {p.compareAt ? (
                        <span className="flex items-center gap-1.5">
                          <span>${(p.price / 100).toFixed(2)}</span>
                          <span className="text-[#999] line-through text-xs">${(p.compareAt / 100).toFixed(2)}</span>
                        </span>
                      ) : (
                        `$${(p.price / 100).toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                      {p.stock > 0 ? (
                        <Badge variant="secondary">In stock</Badge>
                      ) : (
                        <Badge variant="destructive">Out of stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFeatured(p)}
                        title={p.featured ? 'Remove from Featured' : 'Mark as Featured'}
                      >
                        <Star className={`size-4 ${p.featured ? 'fill-amber-400 text-amber-500' : 'text-[#999]'}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(p)}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
            <DialogDescription>
              {editing ? `Editing "${editing.name}"` : 'Fill in the details for the new product'}
            </DialogDescription>
          </DialogHeader>
          <AdminProductForm
            initial={editing ?? undefined}
            onSubmit={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Upload product CSV</DialogTitle>
            <DialogDescription>Preview the file before committing it to the database.</DialogDescription>
          </DialogHeader>
          <AdminCsvUpload onImported={() => { setCsvOpen(false); load(); }} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
