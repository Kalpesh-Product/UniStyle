import type { Order } from '@/context/AuthContext';

export const STATUS_STYLES: Record<Order['status'], string> = {
  delivered: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export function statusLabel(status: Order['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export type OrderBucket = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export function orderBucket(order: Order): OrderBucket {
  if (order.status === 'pending' || order.status === 'processing') return 'processing';
  if (order.status === 'shipped') return 'shipped';
  if (order.status === 'delivered') return 'delivered';
  return 'cancelled';
}

export function statusDetailLine(order: Order) {
  switch (orderBucket(order)) {
    case 'delivered':
      return order.deliveredAt ? `Delivered on ${formatDate(order.deliveredAt)}` : 'Delivered';
    case 'shipped':
      return 'Your order is on its way';
    case 'processing':
      return 'We are preparing your order';
    case 'cancelled':
      return order.status === 'refunded' ? 'Order was refunded' : 'Order was cancelled';
  }
}
