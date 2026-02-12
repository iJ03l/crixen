
import { X, CreditCard, Wallet } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        id: string;
        name: string;
        price: string;
        amount: string;
    } | null;
    onHotPay: () => void;
    onPingPay: () => void;
    loading?: boolean;
}

export function PaymentModal({ isOpen, onClose, plan, onHotPay, onPingPay, loading }: PaymentModalProps) {
    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="tex-2xl font-bold text-white mb-2">Upgrade to {plan.name}</h3>
                <p className="text-white/60 text-sm mb-8">
                    Choose your preferred payment method. Secure and instant.
                </p>

                <div className="space-y-4">
                    {/* Pingpay Option */}
                    <button
                        onClick={onPingPay}
                        disabled={loading}
                        className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all text-left"
                    >
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-white">Crypto (Pingpay)</div>
                            <div className="text-xs text-white/50">Fast crypto checkout via Pingpay</div>
                        </div>
                    </button>

                    {/* Hot Wallet Option */}
                    <button
                        onClick={onHotPay}
                        disabled={loading}
                        className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all text-left"
                    >
                        <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-white">HOT Pay</div>
                            <div className="text-xs text-white/50">Pay with any token on any chain</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
