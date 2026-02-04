import { useEffect, useCallback, useState } from 'react';

interface ExtensionAuthHook {
    isExtensionInstalled: boolean;
    syncAuthToExtension: () => void;
    clearExtensionAuth: () => void;
}

export function useExtensionAuth(): ExtensionAuthHook {
    const [isInstalled, setIsInstalled] = useState(false);

    // Listen for extension ready signal
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Validate origin
            if (event.origin !== window.location.origin) return;

            const { type, extensionId } = event.data;

            if (type === 'CRIXEN_EXTENSION_READY') {
                console.log('[Dashboard] Extension detected:', extensionId);
                setIsInstalled(true);
            }

            if (type === 'CRIXEN_AUTH_LOGIN_ACK') {
                console.log('[Dashboard] Extension login confirmed:', event.data.success);
            }

            if (type === 'CRIXEN_AUTH_LOGOUT_ACK') {
                console.log('[Dashboard] Extension logout confirmed');
            }

            if (type === 'CRIXEN_REQUEST_TOKEN_REFRESH') {
                console.log('[Dashboard] Extension requesting token refresh');
                handleTokenRefreshRequest();
            }
        };

        window.addEventListener('message', handleMessage);

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Sync auth to extension
    const syncAuthToExtension = useCallback(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            console.warn('[Dashboard] No auth data to sync');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            // Default to 7 days if not set, or parse existing
            const storedExpires = localStorage.getItem('tokenExpiresAt');
            const expiresAt = storedExpires
                ? parseInt(storedExpires)
                : Date.now() + (7 * 24 * 60 * 60 * 1000);

            console.log('[Dashboard] Syncing auth to extension...');

            window.postMessage({
                type: 'CRIXEN_AUTH_LOGIN',
                payload: {
                    token,
                    user,
                    expiresAt
                }
            }, window.location.origin); // Target origin for security

        } catch (e) {
            console.error('[Dashboard] Failed to sync auth:', e);
        }
    }, []);

    // Clear extension auth
    const clearExtensionAuth = useCallback(() => {
        console.log('[Dashboard] Clearing extension auth...');

        window.postMessage({
            type: 'CRIXEN_AUTH_LOGOUT',
            payload: {}
        }, window.location.origin);
    }, []);

    // Handle token refresh requests from extension
    const handleTokenRefreshRequest = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

            // Call refresh endpoint
            const response = await fetch(`${apiUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Update localStorage
                localStorage.setItem('token', data.token);
                // Assuming API returns expiresAt or we default it
                const expiresAt = data.expiresAt || (Date.now() + (7 * 24 * 60 * 60 * 1000));
                localStorage.setItem('tokenExpiresAt', expiresAt.toString());

                // Sync new token to extension
                window.postMessage({
                    type: 'CRIXEN_AUTH_REFRESH',
                    payload: { token: data.token, expiresAt }
                }, window.location.origin);
            }
        } catch (e) {
            console.error('[Dashboard] Token refresh failed:', e);
        }
    }, []);

    return {
        isExtensionInstalled: isInstalled,
        syncAuthToExtension,
        clearExtensionAuth
    };
}
