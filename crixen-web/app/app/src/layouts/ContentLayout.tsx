import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

interface ContentLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

const ContentLayout = ({ children, title, subtitle }: ContentLayoutProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
            {/* Header */}
            <header className="border-b border-white/[0.06] bg-dark-bg/80 backdrop-blur fixed top-0 left-0 right-0 z-50">
                <div className="w-[86vw] max-w-[1100px] mx-auto h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight"
                    >
                        <img src="/logo.png" alt="Crixen" className="h-8 w-auto object-contain" />
                        Crixen
                    </button>
                    <div className='flex gap-4'>
                        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-dark-muted hover:text-white transition-colors">
                            Log in
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-[86vw] max-w-[800px] mx-auto pt-32 pb-20">
                <div className="mb-12">
                    <h1 className="font-heading font-bold text-4xl mb-4">{title}</h1>
                    {subtitle && <p className="text-xl text-dark-muted">{subtitle}</p>}
                </div>
                <div className="prose prose-invert max-w-none prose-headings:font-heading prose-a:text-blue-400">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContentLayout;
