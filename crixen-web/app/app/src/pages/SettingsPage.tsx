import { useState } from "react";
import { Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";

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
        itemId: "ecbeffd41e7a3619a140093cc011e6bc384970f96e69502d8f50cf95c248f7c5", // TODO: Get Agency Item ID
        amount: "100.00"
    }
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpgrade = async (plan: any) => {
        if (!plan.itemId || !user) return;
        const currentTier = (user.tier as string) === 'free' ? 'starter' : user.tier;
        if (plan.id === currentTier) return; // Already on plan

        setLoading(true);
        setError(null);

        try {
            const data = await api.billing.createHotOrder(plan.itemId, plan.amount);
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("Failed to start checkout");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
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

                            <button
                                className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${isCurrent
                                    ? 'bg-white/10 text-dark-muted cursor-default'
                                    : 'bg-dark-text text-dark-bg hover:bg-dark-silver'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled={isCurrent || loading}
                                onClick={() => handleUpgrade(plan)}
                            >
                                {loading && !isCurrent ? 'Processing...' : (
                                    isCurrent ? "Current Plan" : (plan.itemId ? "Upgrade" : "Downgrade")
                                )}
                            </button>
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
        </div>
    );
}
