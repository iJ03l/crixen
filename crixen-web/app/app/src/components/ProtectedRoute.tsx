import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute component
 * Validates session on mount. If token is expired or invalid,
 * the user is logged out and redirected to the landing page with the auth modal.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, openAuthModal, validateSession } = useAuthStore();
    const location = useLocation();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        const check = async () => {
            await validateSession();
            setIsValidating(false);
        };
        check();
    }, [validateSession]);

    useEffect(() => {
        if (!isValidating && !user) {
            openAuthModal('login');
        }
    }, [isValidating, user, openAuthModal]);

    // Still validating — show nothing to prevent flash
    if (isValidating) {
        return null;
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

