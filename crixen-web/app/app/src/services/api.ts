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

    projects: {
        list: async () => {
            const res = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch projects');
            return res.json();
        },

        getById: async (id: number) => {
            const res = await fetch(`${API_URL}/projects/${id}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch project');
            return res.json();
        },

        create: async (name: string) => {
            const res = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error('Failed to create project');
            return res.json();
        },

        updateName: async (id: number, name: string) => {
            const res = await fetch(`${API_URL}/projects/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error('Failed to update project');
            return res.json();
        },

        updateBrandVoice: async (id: number, brand_voice: string) => {
            const res = await fetch(`${API_URL}/projects/${id}/brand-voice`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ brand_voice })
            });
            if (!res.ok) throw new Error('Failed to update brand voice');
            return res.json();
        },

        // Strategy CRUD
        getStrategies: async (id: number) => {
            const project = await fetch(`${API_URL}/projects/${id}`, { headers: getHeaders() });
            if (!project.ok) throw new Error('Failed to fetch project');
            return project.json();
        },

        addStrategy: async (projectId: number, strategy: { name: string; prompt: string; source?: string }) => {
            const res = await fetch(`${API_URL}/projects/${projectId}/strategies`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(strategy)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to add strategy');
            }
            return res.json();
        },

        updateStrategies: async (projectId: number, strategies: any[]) => {
            const res = await fetch(`${API_URL}/projects/${projectId}/strategies`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ strategies })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update strategies');
            }
            return res.json();
        },

        deleteStrategy: async (projectId: number, strategyId: string) => {
            const res = await fetch(`${API_URL}/projects/${projectId}/strategies/${strategyId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete strategy');
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
        },

        createPingpaySession: async (planId: string, amount: string) => {
            // Call our backend, which proxies to Pingpay
            const res = await fetch(`${API_URL}/billing/create-pingpay-session`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ planId, amount })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to start Pingpay checkout');
            }
            return res.json();
        }
    },

    // NOVA - Encrypted strategy storage
    nova: {
        // Get user's NEAR account credentials
        getCredentials: async () => {
            const res = await fetch(`${API_URL}/nova/credentials`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch NOVA credentials');
            return res.json();
        },

        // Get NOVA integration status
        getStatus: async () => {
            const res = await fetch(`${API_URL}/nova/status`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch NOVA status');
            return res.json();
        },

        // Upload strategy to NOVA (encrypted)
        uploadStrategy: async (projectId: number | null, strategyData: any) => {
            const res = await fetch(`${API_URL}/nova/upload`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    projectId,
                    strategyData,
                    groupId: 'crixen-strategies'
                })
            });
            if (!res.ok) throw new Error('Failed to upload to NOVA');
            return res.json();
        },

        // Retrieve strategy from NOVA (decrypted)
        retrieveStrategy: async (projectId: number) => {
            const res = await fetch(`${API_URL}/nova/strategy/${projectId}`, {
                headers: getHeaders()
            });
            if (!res.ok) {
                if (res.status === 404) return null;
                throw new Error('Failed to retrieve from NOVA');
            }
            return res.json();
        },

        // Retrieve by CID directly
        retrieveByCid: async (cid: string, groupId = 'crixen-strategies') => {
            const res = await fetch(`${API_URL}/nova/retrieve/${cid}?groupId=${groupId}`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to retrieve from NOVA');
            return res.json();
        },

        // Register a new NOVA group
        registerGroup: async (groupId: string) => {
            const res = await fetch(`${API_URL}/nova/groups/register`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ groupId })
            });
            if (!res.ok) throw new Error('Failed to register group');
            return res.json();
        }
    }
};
