import { storeJwtToken } from '../utils/auth';

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
        credentials: 'include', // Add this line
    });
    return handleResponse(response);
};

export const checkUsername = async (username) => {
    try {
        const encodedUsername = encodeURIComponent(username);
        const response = await fetch(
            `${API_BASE_URL}/api/check-username?username=${encodedUsername}`
        );
        
        console.log('Username check response status:', response.status);
        const data = await response.json();
        console.log('Username exists:', data);
        return data;
    } catch (error) {
        console.error('Username check error:', error);
        throw error;
    }
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
    const response = await fetch(`${API_BASE_URL}/req/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Add this line
    });
    
    const data = await handleResponse(response);
    storeJwtToken(data.jwt);
    return data;
};
