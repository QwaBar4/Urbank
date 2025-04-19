import { getJwtToken, storeJwtToken } from '../utils/auth';


export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const handleResponse = async (response) => {
    const text = await response.text();
    if (!text) return null; // Handle empty responses
    
    try {
        const json = JSON.parse(text);
        if (!response.ok) {
            const error = new Error(json.message || 'Request failed');
            error.status = response.status;
            throw error;
        }
        return json;
    } catch (err) {
        // Return text if not JSON
        if (!response.ok) {
            const error = new Error(text || 'Request failed');
            error.status = response.status;
            throw error;
        }
        return text;
    }
};


export const getIndexData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Index data error:', error);
    throw error;
  }
};

// Modify your fetch calls to include credentials
export const getDashboardData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Dashboard data error:', error);
    throw error;
  }
};

export const getAdminDashboardData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`
            }
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Admin dashboard data error:', error);
        throw error;
    }
};


export const resetPassword = (token, newPassword, confirmPassword) => {
    return fetch(`${API_BASE_URL}/login/recovery/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword })
    });
};





export const sendVerificationCode = async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleResponse(response);
};

export const signup = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/req/signup`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                code: userData.code
            }),
            credentials: 'include',
        });

        const data = await handleResponse(response);
        
        if (data.jwt) {
            storeJwtToken(data.jwt);
        }
        
        return data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const checkEmail = async (email) => {
    try {
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
            `${API_BASE_URL}/api/check-email?email=${encodedEmail}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Email check error:', error);
        throw error;
    }
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


export const getUserDetails = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        roles: userData.roles
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const activateUser = async (userId, active) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Explicitly request JSON
      },
      body: JSON.stringify({ active })
    });

    const contentType = response.headers.get('content-type');
    
    const data = await handleResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Activation failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', {
      url: `${API_BASE_URL}/admin/users/${userId}/status`,
      status: error.status,
      message: error.message
    });
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Deletion error:', error);
    throw error;
  }
};

export const getUserTransactions = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/transactions`, {
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Transactions error:', error);
    throw error;
  }
};

const api = {
    API_BASE_URL,
    deleteUser,
    getUserTransactions,
    checkEmail,
    checkUsername,
    getDashboardData,
    getIndexData,
    handleResponse,
    login,
    resetPassword,
    sendVerificationCode,
    signup,
};
export default api;
