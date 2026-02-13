import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useExtensionAuth } from '../hooks/useExtensionAuth';
import {
    LayoutDashboard,
    Settings,
    FileText,
    Menu,
    X,
    LogOut,
    Chrome
} from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout, validateSession } = useAuthStore();
    const { isExtensionInstalled, syncAuthToExtension, clearExtensionAuth } = useExtensionAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Validate session on dashboard mount
    useEffect(() => {
        validateSession();
    }, [validateSession]);

    // Sync auth on mount if extension is present
    useEffect(() => {
        if (user && isExtensionInstalled) {
            syncAuthToExtension();
        }
    }, [user, isExtensionInstalled, syncAuthToExtension]);

    // Expose sync handlers for authStore to use on login/logout
    useEffect(() => {
        (window as any).__crixenSyncAuth = syncAuthToExtension;
        (window as any).__crixenClearAuth = clearExtensionAuth;
    }, [syncAuthToExtension, clearExtensionAuth]);

    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Strategy', path: '/dashboard/strategy' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    if (!user) {
        return null; // Or loading spinner, though App.tsx handles redirect
    }

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-dark-bg h-screen sticky top-0">
                <div className="p-6 border-b border-white/5">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
                        <img src="/logo.png" alt="Crixen" className="h-8 w-auto object-contain" />
                        Crixen
                        <span className="ml-2 px-1.5 py-0.5 text-[0.6rem] font-bold bg-primary-500/20 text-primary-400 rounded border border-primary-500/30 tracking-wider">
                            ALPHA
                        </span>
                    </button>
                    {isExtensionInstalled && (
                        <span className="text-[9px] text-green-400 font-medium block mt-0.5 ml-1 px-1.5 py-0 bg-green-900/20 rounded-full w-fit">
                            Extension Active
                        </span>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path
                                ? 'bg-white/10 text-white'
                                : 'text-dark-muted hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-silver/40 to-dark-silver/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-dark-text">
                                {user.email.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-dark-muted capitalize">{user.tier} Plan</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-dark-bg/80 backdrop-blur sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Crixen" className="h-8 w-auto" />
                        <span className="font-heading font-bold text-xl flex items-center gap-2">
                            Crixen
                            <span className="px-1.5 py-0.5 text-[0.6rem] font-bold bg-primary-500/20 text-primary-400 rounded border border-primary-500/30 tracking-wider">
                                ALPHA
                            </span>
                        </span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-16 left-0 right-0 bg-dark-bg border-b border-white/5 z-40 p-4 space-y-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path
                                    ? 'bg-white/10 text-white'
                                    : 'text-dark-muted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-sm text-dark-muted">Logged in as {user.email}</span>
                            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-dark-muted hover:text-red-400 transition-colors">
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
            {/* Floating Extension Install Button */}
            {!isExtensionInstalled && (
                <a
                    href="https://chromewebstore.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-full shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                    <Chrome size={20} className="text-black" />
                    <span>Install Extension</span>
                </a>
            )}
        </div>
    );
}
