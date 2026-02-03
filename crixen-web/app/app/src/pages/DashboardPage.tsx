import { useEffect, useState } from 'react';
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await api.ai.getStats();
                setStats(statsData);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    if (!user) return null;
    if (loading) return <div className="p-8 text-dark-muted">Loading dashboard...</div>;

    // Use fetched stats or fallback to 0/empty
    const displayStats = [
        { label: 'Replies sent', value: stats?.generatedCount || 0, change: '+12%' },
        { label: 'Credits remaining', value: stats?.limit ? stats.limit - (stats.generatedCount || 0) : 0, change: 'this month' },
        { label: 'Active Projects', value: `${stats?.projects || 0} / ${stats?.projectLimit || 0}`, change: '' },
    ];

    return (
        <div>
            <h2 className="font-heading font-semibold text-xl text-dark-text mb-4">
                Overview
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-6">
                {displayStats.map((stat, i) => (
                    <div
                        key={i}
                        className="stat-card p-3 lg:p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                    >
                        <p className="font-heading font-bold text-xl lg:text-2xl text-dark-text mb-1">
                            {stat.value}
                        </p>
                        <p className="text-xs text-dark-muted mb-1">{stat.label}</p>
                        {stat.change && (
                            <span className="text-xs font-mono text-dark-muted uppercase">
                                {stat.change}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
