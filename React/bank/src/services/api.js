export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
    const text = await response.text();
    try {
        const json = text ? JSON.parse(text) : {};
        if (!response.ok) {
            throw new Error(json.message || json.error || 'Request failed');
        }
        return json;
    } catch (err) {
        throw new Error(text || 'Failed to parse response');
    }
};

export const signup = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/req/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

const getCsrfToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
        }
    }
    return '';
};

export const login = async (credentials) => {
    // First get CSRF token from Spring's cookie
    const csrfResponse = await fetch(`${API_BASE_URL}/api/csrf`, {
        credentials: 'include'
    });
    const csrfToken = csrfResponse.headers.get('X-CSRF-TOKEN');

    // Then send login request
    const response = await fetch(`${API_BASE_URL}/req/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': csrfToken // Include CSRF token
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};
