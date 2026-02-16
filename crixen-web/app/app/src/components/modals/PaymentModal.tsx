import { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, Loader2 } from 'lucide-react';

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
    const [processingMethod, setProcessingMethod] = useState<'hot' | 'ping' | null>(null);

    useEffect(() => {
        if (!loading) {
            setProcessingMethod(null);
        }
    }, [loading]);

    const handlePingClick = () => {
        setProcessingMethod('ping');
        onPingPay();
    };

    const handleHotClick = () => {
        setProcessingMethod('hot');
        onHotPay();
    };

    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors disabled:opacity-50"
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
                        onClick={handlePingClick}
                        disabled={loading}
                        className={`w-full group relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${loading && processingMethod !== 'ping' ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/[0.01]' :
                            'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                            }`}
                    >
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                            {loading && processingMethod === 'ping' ? <Loader2 size={24} className="animate-spin" /> : <CreditCard size={24} />}
                        </div>
                        <div>
                            <div className="font-bold text-white">
                                {loading && processingMethod === 'ping' ? 'Redirecting...' : 'PingPay (Crypto)'}
                            </div>
                            <div className="text-xs text-white/50">Pay with any method on any chain</div>
                        </div>
                    </button>

                    {/* Hot Wallet Option */}
                    <button
                        onClick={handleHotClick}
                        disabled={loading}
                        className={`w-full group relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${loading && processingMethod !== 'hot' ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/[0.01]' :
                            'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                            }`}
                    >
                        <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                            {loading && processingMethod === 'hot' ? <Loader2 size={24} className="animate-spin" /> : <Wallet size={24} />}
                        </div>
                        <div>
                            <div className="font-bold text-white">
                                {loading && processingMethod === 'hot' ? 'Processing...' : 'HOT Pay (Crypto)'}
                            </div>
                            <div className="text-xs text-white/50">Pay with any wallet on any chain</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
