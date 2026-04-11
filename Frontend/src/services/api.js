const API_BASE_URL = '/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();

export const visitorAPI = {
    getAll: () => api.get('/visitors'),
    getById: (id) => api.get(`/visitors/${id}`),
    create: (data) => api.post('/visitors', data),
    update: (id, data) => api.put(`/visitors/${id}`, data),
    delete: (id) => api.delete(`/visitors/${id}`),
};

export const hostAPI = {
    getAll: () => api.get('/hosts'),
    getById: (id) => api.get(`/hosts/${id}`),
    create: (data) => api.post('/hosts', data),
    update: (id, data) => api.put(`/hosts/${id}`, data),
    delete: (id) => api.delete(`/hosts/${id}`),
};

export const visitRequestAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/visit-requests${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => api.get(`/visit-requests/${id}`),
    create: (data) => api.post('/visit-requests', data),
    update: (id, data) => api.put(`/visit-requests/${id}`, data),
    delete: (id) => api.delete(`/visit-requests/${id}`),
    approve: (id, adminId) => api.patch(`/visit-requests/${id}/approve`, { admin_id: adminId }),
    reject: (id, adminId, reason) => api.patch(`/visit-requests/${id}/reject`, { 
        admin_id: adminId, 
        rejection_reason: reason 
    }),
};

export const entryExitAPI = {
    getCurrentVisitors: () => api.get('/entry-exit/current-visitors'),
    checkIn: (requestId) => api.patch(`/entry-exit/${requestId}/checkin`),
    checkOut: (requestId) => api.patch(`/entry-exit/${requestId}/checkout`),
    getVisitHistory: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/entry-exit/history${queryString ? `?${queryString}` : ''}`);
    },
    getEntryLogs: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/entry-exit/logs${queryString ? `?${queryString}` : ''}`);
    },
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRecentActivity: (limit = 10) => api.get(`/dashboard/recent-activity?limit=${limit}`),
    getVisitStatsByDate: (startDate, endDate) => 
        api.get(`/dashboard/visit-stats-by-date?start_date=${startDate}&end_date=${endDate}`),
    getTopHosts: (limit = 10) => api.get(`/dashboard/top-hosts?limit=${limit}`),
    getTopVisitors: (limit = 10) => api.get(`/dashboard/top-visitors?limit=${limit}`),
    getAverageVisitDuration: (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return api.get(`/dashboard/average-visit-duration?${params.toString()}`);
    },
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getStatusBadgeClass = (status) => {
    const statusClasses = {
        'Pending': 'status-pending',
        'Approved': 'status-approved',
        'Rejected': 'status-rejected',
        'Completed': 'status-completed'
    };
    return statusClasses[status] || '';
};

export const handleApiError = (error, customMessage = 'Operation failed') => {
    console.error('API Error:', error);
    return error.message || customMessage;
};