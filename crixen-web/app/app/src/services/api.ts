export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const api = {
    auth: {
        login: (credentials: any) => fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        }).then(res => res.json()),

        register: (credentials: any) => fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        }).then(res => res.json()),

        google: (data: { code?: string, token?: string }) => fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()),
    },

    ai: {
        getStats: async () => {
            const res = await fetch(`${API_URL}/ai/stats`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },

        getActivity: async () => {
            const res = await fetch(`${API_URL}/ai/activity`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch activity');
            return res.json();
        },

        generate: async (data: any) => {
            const res = await fetch(`${API_URL}/ai/generate`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Generation failed');
            return res.json();
        }
    },

    billing: {
        createHotOrder: async (itemId?: string, amount?: string) => {
            const res = await fetch(`${API_URL}/billing/create-hot-order`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ itemId, amount })
            });
            if (!res.ok) throw new Error('Failed to create order');
            return res.json();
        }
    }
};
