import { CreditCard, CheckCircle2, Zap } from "lucide-react";

export default function BillingDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy">Subscription & Billing</h1>
        <p className="text-gray-500 mt-2">Manage your active plans and upgrade for more features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        
        {/* Free Plan (Current) */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-navy relative overflow-hidden flex flex-col">
          <div className="bg-navy text-white text-center py-2 text-xs font-bold uppercase tracking-wider">
            Current Plan
          </div>
          <div className="p-8 flex-1">
            <h3 className="text-2xl font-serif text-navy font-semibold">Free Tier</h3>
            <p className="text-4xl font-bold text-navy mt-4 mb-2">₹0 <span className="text-sm text-gray-500 font-normal">/ month</span></p>
            <p className="text-gray-500 text-sm mb-6">Perfect for getting started and listing your first property.</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                Up to 2 property listings
              </li>
              <li className="flex items-center gap-3 text-gray-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                Basic support
              </li>
              <li className="flex items-center gap-3 text-gray-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                Standard visibility in search
              </li>
            </ul>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-b from-gold/10 to-transparent rounded-3xl shadow-lg border border-gold/30 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4">
            <Zap className="w-6 h-6 text-gold" />
          </div>
          <div className="p-8 flex-1">
            <h3 className="text-2xl font-serif text-navy font-semibold text-gold">Premium Agent</h3>
            <p className="text-4xl font-bold text-navy mt-4 mb-2">₹4,999 <span className="text-sm text-gray-500 font-normal">/ month</span></p>
            <p className="text-gray-500 text-sm mb-6">For serious professionals wanting maximum exposure.</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                <strong>Unlimited</strong> property listings
              </li>
              <li className="flex items-center gap-3 text-gray-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                Priority 24/7 support
              </li>
              <li className="flex items-center gap-3 text-gray-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                Featured placement in search
              </li>
              <li className="flex items-center gap-3 text-gray-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                Access to Instant Cash Offers
              </li>
            </ul>
            
            <button className="w-full bg-gold hover:bg-yellow-600 text-white font-semibold py-4 rounded-xl transition-colors shadow-md mt-auto flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              Upgrade Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
