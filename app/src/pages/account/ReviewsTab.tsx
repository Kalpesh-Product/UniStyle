import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Clock } from 'lucide-react';
import { api, ApiError, type BackendReview, type BackendAwaitingReview } from '@/lib/api';
import { showToast } from '@/components/ToastContainer';

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < Math.round(rating) ? '#1A1A1A' : 'none'} stroke="#1A1A1A" />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}>
          <Star size={22} fill={i < value ? '#1A1A1A' : 'none'} stroke="#1A1A1A" />
        </button>
      ))}
    </div>
  );
}

export function ReviewsTab() {
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [awaiting, setAwaiting] = useState<BackendAwaitingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [writingFor, setWritingFor] = useState<BackendAwaitingReview | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getMyReviews();
      setReviews(data.reviews);
      setAwaiting(data.awaiting);
    } catch {
      setReviews([]);
      setAwaiting([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const startEdit = (review: BackendReview) => {
    setEditingId(review._id);
    setWritingFor(null);
    setRating(review.rating);
    setComment(review.comment);
  };

  const startWrite = (item: BackendAwaitingReview) => {
    setWritingFor(item);
    setEditingId(null);
    setRating(5);
    setComment('');
  };

  const cancel = () => {
    setEditingId(null);
    setWritingFor(null);
  };

  const submit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await api.updateReview(editingId, { rating, comment });
        showToast('Review updated');
      } else if (writingFor) {
        await api.createReview({ productId: writingFor.product._id, orderId: writingFor.orderId, rating, comment });
        showToast('Review submitted');
      }
      cancel();
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save review', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#666]">Loading reviews...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Reviews</h2>
      <p className="text-sm text-[#666] mb-6">Manage your product reviews and ratings.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-[#E5E5E5] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><MessageSquare size={18} /></div>
          <div>
            <p className="text-xs text-[#666]">Reviews Written</p>
            <p className="text-xl font-bold">{reviews.length}</p>
          </div>
        </div>
        <div className="border border-[#E5E5E5] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Star size={18} /></div>
          <div>
            <p className="text-xs text-[#666]">Average Rating</p>
            <div className="flex items-center gap-2">
              <StarRow rating={avgRating} />
              <span className="text-sm font-bold">{reviews.length ? avgRating.toFixed(1) : '—'}</span>
            </div>
          </div>
        </div>
        <div className="border border-[#E5E5E5] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Clock size={18} /></div>
          <div>
            <p className="text-xs text-[#666]">Pending Reviews</p>
            <p className="text-xl font-bold">{awaiting.length}</p>
          </div>
        </div>
      </div>

      <h3 className="font-bold mb-4">Your Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-sm text-[#999] mb-8">You haven't written any reviews yet.</p>
      ) : (
        <div className="border border-[#E5E5E5] divide-y divide-[#F0F0F0] mb-8">
          {reviews.map(review => (
            <div key={review._id} className="p-5">
              {editingId === review._id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={review.productId.images[0]} alt="" className="w-14 h-14 object-cover bg-[#F5F5F5]" />
                    <p className="text-sm font-medium">{review.productId.name}</p>
                  </div>
                  <StarPicker value={rating} onChange={setRating} />
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                  <div className="flex gap-2">
                    <button onClick={cancel} className="text-sm text-[#666] px-4 py-2">Cancel</button>
                    <button onClick={submit} disabled={saving} className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-5 py-2 hover:bg-[#333] disabled:opacity-60">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <img src={review.productId.images[0]} alt={review.productId.name} className="w-16 h-16 object-cover bg-[#F5F5F5] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <StarRow rating={review.rating} />
                    <Link to={`/product/${review.productId.slug}`} className="font-semibold hover:underline block mt-1">{review.productId.name}</Link>
                    <p className="text-sm text-[#666] mt-1">{review.comment}</p>
                    <p className="text-xs text-[#999] mt-2">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <button onClick={() => startEdit(review)} className="text-sm font-medium border border-[#E5E5E5] px-4 py-2 hover:border-[#1A1A1A] transition-colors shrink-0">
                    Edit Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 className="font-bold mb-4">Products Awaiting Review</h3>
      {awaiting.length === 0 ? (
        <p className="text-sm text-[#999]">Nothing to review right now &mdash; delivered orders show up here.</p>
      ) : (
        <div className="border border-[#E5E5E5] divide-y divide-[#F0F0F0]">
          {awaiting.map(item => (
            <div key={`${item.orderId}-${item.product._id}`} className="p-5">
              {writingFor && writingFor.product._id === item.product._id && writingFor.orderId === item.orderId ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={item.product.images[0]} alt="" className="w-14 h-14 object-cover bg-[#F5F5F5]" />
                    <p className="text-sm font-medium">{item.product.name}</p>
                  </div>
                  <StarPicker value={rating} onChange={setRating} />
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Share your thoughts about this product..." className="w-full border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                  <div className="flex gap-2">
                    <button onClick={cancel} className="text-sm text-[#666] px-4 py-2">Cancel</button>
                    <button onClick={submit} disabled={saving || !comment.trim()} className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-5 py-2 hover:bg-[#333] disabled:opacity-60">
                      {saving ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover bg-[#F5F5F5] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-[#999]">Delivered {new Date(item.deliveredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <button onClick={() => startWrite(item)} className="text-sm font-medium border border-[#E5E5E5] px-4 py-2 hover:border-[#1A1A1A] transition-colors shrink-0">
                    Write Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
