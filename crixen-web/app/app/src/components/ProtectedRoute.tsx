import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute component
 * If user is not authenticated, opens the auth modal and shows the landing page.
 * After successful login, the user will be redirected to dashboard via AuthModal's navigate.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, openAuthModal } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            // Open auth modal when user tries to access protected route
            openAuthModal('login');
        }
    }, [user, openAuthModal]);

    if (!user) {
        // Redirect to landing page while modal is open
        // Store intended destination for potential future use
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
