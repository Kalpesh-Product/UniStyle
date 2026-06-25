import { CreditCard, Plus, ShieldCheck } from 'lucide-react';
import { showToast } from '@/components/ToastContainer';

export function PaymentMethodsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Payment Methods</h2>
      <p className="text-sm text-[#666] mb-6">Manage your saved payment methods for faster checkout.</p>

      <p className="text-sm font-semibold mb-4">Saved Cards (0)</p>
      <div className="text-center py-10 bg-[#F5F5F5] mb-6">
        <CreditCard size={32} className="mx-auto text-[#CCC] mb-3" />
        <p className="text-[#666]">No saved cards yet</p>
      </div>

      <h3 className="font-bold mb-4">Add New Payment Method</h3>
      <div className="border border-[#E5E5E5] p-6">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          <div className="flex flex-col items-center justify-center text-center border-r border-[#F0F0F0] pr-0 md:pr-6">
            <div className="w-12 h-12 rounded-full bg-[#F1E7FB] flex items-center justify-center mb-3"><Plus size={20} /></div>
            <p className="font-semibold text-sm">Add New Card</p>
            <p className="text-xs text-[#999] mt-1">Saved cards aren't supported yet &mdash; this is a preview of the upcoming design.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast('Saved payment methods are coming soon. Card details are entered securely at checkout and are never stored.', 'info');
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Card Number</label>
              <input disabled placeholder="1234 5678 9012 3456" className="w-full bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Name on Card</label>
                <input disabled placeholder="Full Name" className="w-full bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">Expiry</label>
                  <input disabled placeholder="MM / YY" className="w-full bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">CVV</label>
                  <input disabled placeholder="123" className="w-full bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-2.5 text-sm outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
            <button type="submit" className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:bg-[#333] transition-colors">
              Save Card
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-[#F5F5F5] mt-6">
        <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
        <div>
          <p className="text-sm font-semibold">Your payment information is secure</p>
          <p className="text-xs text-[#666]">Payment details are entered at checkout via Stripe and are never stored in plain text on our servers.</p>
        </div>
      </div>
    </div>
  );
}
