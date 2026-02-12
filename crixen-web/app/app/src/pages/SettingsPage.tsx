import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { PaymentModal } from "@/components/modals/PaymentModal";

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "$0",
        period: "/mo",
        description: "Ideal for solopreneurs managing one brand",
        features: [
            "1 Project / Memory Context",
            "Basic generation limits",
            "Standard tone settings",
            "Community support"
        ],
        itemId: null
    },
    {
        id: "pro",
        name: "Pro",
        price: "$10",
        period: "/mo",
        description: "Great for creators with multiple personas",
        features: [
            "3 Projects",
            "150 Generations / day",
            "Advanced strategy tools",
            "Priority support",
            "Local-first speed"
        ],
        itemId: "ecbeffd41e7a3619a140093cc011e6bc384970f96e69502d8f50cf95c248f7c5",
        amount: "10.00"
    },
    {
        id: "agency",
        name: "Agency",
        price: "$100",
        period: "/mo",
        description: "For social media managers & scaling teams",
        features: [
            "Unlimited Projects",
            "Unlimited Generations",
            "Isolated memory per project",
            "Team collaboration",
            "Dedicated account manager"
        ],
        itemId: "2b92641315835c432360ebc220cac4b901614764b85ce81dfbe1688688461749", // SHA256('agency_tier')
        amount: "100.00"
    }
];

const TIER_ORDER = ['starter', 'pro', 'agency'];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');

        if (paymentStatus === 'success') {
            // Hard refresh to update user tier as requested
            window.location.href = window.location.pathname;
        } else if (paymentStatus === 'canceled') {
            setError('Payment was canceled.');
            // Clear URL params without refresh
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleUpgradeClick = (plan: any) => {
        console.log('[Settings] Upgrade clicked for:', plan.id);
        if (!plan.itemId || !user) {
            console.error('[Settings] Missing itemId or user');
            return;
        }
        const currentTier = (user.tier as string) === 'free' ? 'starter' : user.tier;
        console.log('[Settings] Current Tier:', currentTier);

        if (plan.id === currentTier) return;

        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    };

    const handleHotPay = async () => {
        if (!selectedPlan) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.billing.createHotOrder(selectedPlan.itemId, selectedPlan.amount);
            if (data.url) window.location.href = data.url;
            else throw new Error("Failed to start Hot checkout");
        } catch (err: any) {
            setError(err.message || "Hot Pay failed");
            setLoading(false);
        }
    };

    const handlePingPay = async () => {
        if (!selectedPlan) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.billing.createPingpaySession(selectedPlan.id, selectedPlan.amount);
            if (data.url) window.location.href = data.url;
            else throw new Error("Failed to start Pingpay checkout");
        } catch (err: any) {
            setError(err.message || "Pingpay failed");
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="font-heading font-bold text-3xl text-dark-text">Settings & Billing</h2>
                <p className="text-dark-muted">Manage your subscription, usage limits, and account preferences.</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {PLANS.map((plan) => {
                    const currentTier = (user.tier as string) === 'free' ? 'starter' : user.tier;
                    const isCurrent = currentTier === plan.id;
                    const currentTierIndex = TIER_ORDER.indexOf(currentTier);
                    const planIndex = TIER_ORDER.indexOf(plan.id);
                    const isDowngrade = planIndex < currentTierIndex;

                    return (
                        <div
                            key={plan.id}
                            className={`flex flex-col p-6 rounded-2xl bg-white/[0.03] border transition-all ${isCurrent
                                ? 'border-dark-text/30 ring-1 ring-dark-text/30 bg-white/[0.05]'
                                : 'border-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-dark-text">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-dark-text">{plan.price}</span>
                                    <span className="text-sm text-dark-muted">{plan.period}</span>
                                </div>
                                <p className="text-sm text-dark-muted mt-2">{plan.description}</p>
                            </div>

                            <ul className="flex-1 space-y-3 text-sm text-dark-muted mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Check size={16} className="text-green-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {!isDowngrade && (
                                <button
                                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${isCurrent
                                        ? 'bg-white/10 text-dark-muted cursor-default'
                                        : 'bg-dark-text text-dark-bg hover:bg-dark-silver'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    disabled={isCurrent || loading}
                                    onClick={() => handleUpgradeClick(plan)}
                                >
                                    {loading && !isCurrent ? 'Processing...' : (
                                        isCurrent ? "Current Plan" : "Upgrade"
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Account Info Section */}
            <div className="pt-8 border-t border-white/5">
                <h3 className="font-heading font-bold text-xl text-dark-text mb-4">Account Information</h3>
                <div className="grid gap-4 max-w-xl">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <label className="text-xs uppercase tracking-wider text-dark-muted block mb-1">Email Address</label>
                        <p className="text-dark-text">{user.email}</p>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                plan={selectedPlan}
                onHotPay={handleHotPay}
                onPingPay={handlePingPay}
                loading={loading}
            />
        </div >
    );
}
