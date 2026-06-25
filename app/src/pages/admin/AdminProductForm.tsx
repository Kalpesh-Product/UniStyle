import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/products';
import type { AdminProductInput, BackendProduct } from '@/lib/api';

function toCommaList(values: string[]) {
  return values.join(', ');
}

function fromCommaList(text: string) {
  return text.split(',').map((v) => v.trim()).filter(Boolean);
}

function toColorsText(colors: { name: string; hex: string }[]) {
  return colors.map((c) => `${c.name}:${c.hex}`).join(', ');
}

function fromColorsText(text: string) {
  return text
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [name, hex] = pair.split(':').map((s) => s.trim());
      return { name, hex };
    })
    .filter((c) => c.name && c.hex);
}

interface Props {
  initial?: BackendProduct;
  onSubmit: (data: AdminProductInput) => Promise<void>;
  onCancel: () => void;
}

export function AdminProductForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? (initial.price / 100).toString() : '');
  const [compareAt, setCompareAt] = useState(initial?.compareAt ? (initial.compareAt / 100).toString() : '');
  const [category, setCategory] = useState(initial?.category ?? categories[0]);
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>(initial?.gender ?? 'unisex');
  const [university, setUniversity] = useState(initial?.university ?? '');
  const [images, setImages] = useState(toCommaList(initial?.images ?? []));
  const [sizes, setSizes] = useState(toCommaList(initial?.sizes ?? []));
  const [colors, setColors] = useState(toColorsText(initial?.colors ?? []));
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [badge, setBadge] = useState(initial?.badge ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        name,
        description,
        price: Math.round(Number(price) * 100),
        compareAt: compareAt ? Math.round(Number(compareAt) * 100) : undefined,
        category,
        gender,
        university: university || undefined,
        images: fromCommaList(images),
        sizes: fromCommaList(sizes),
        colors: fromColorsText(colors),
        stock: Number(stock) || 0,
        featured,
        badge: badge || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (AED)</Label>
          <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compareAt">Compare-at price (AED)</Label>
          <Input id="compareAt" type="number" step="0.01" min="0" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <Select value={gender} onValueChange={(v) => setGender(v as 'men' | 'women' | 'unisex')}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="men">Men</SelectItem>
            <SelectItem value="women">Women</SelectItem>
            <SelectItem value="unisex">Unisex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">University</Label>
        <Input id="university" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g. University of Birmingham" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Image URLs (comma separated)</Label>
        <Textarea id="images" value={images} onChange={(e) => setImages(e.target.value)} rows={2} placeholder="https://...jpg, https://...jpg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sizes">Sizes (comma separated)</Label>
          <Input id="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="badge">Badge</Label>
          <Input id="badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. New, Sale" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="colors">Colors (name:hex, comma separated)</Label>
        <Input id="colors" value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Black:#1A1A1A, Grey:#999999" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="featured" checked={featured} onCheckedChange={(v) => setFeatured(v === true)} />
        <Label htmlFor="featured">Featured</Label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-[#1A1A1A] hover:bg-[#333]">
          {saving ? 'Saving...' : initial ? 'Save changes' : 'Add product'}
        </Button>
      </div>
    </form>
  );
}
