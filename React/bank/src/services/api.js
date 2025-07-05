import { getJwtToken, storeJwtToken } from '../utils/auth';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const handleResponse = async (response) => {
    const text = await response.text();
    if (!text) return null;

    try {
        const json = JSON.parse(text);
        if (!response.ok) {
            const error = new Error(json.message || 'Request failed');
            error.status = response.status;
            throw error;
        }
        return json;
    } catch (err) {
        if (!response.ok) {
            const error = new Error(text || 'Request failed');
            error.status = response.status;
            if(JSON.parse(text).message) throw JSON.parse(text).message;
            throw error;
        }
        return text;
    }
};

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
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
        credentials: 'include', 
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

export const getUserFullDetails = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, {
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

export const updateUserProfile = async (updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Profile update error:', error);
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
        'Accept': 'application/json'
      },
      body: JSON.stringify({ active })
    });

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

export const getUserAuditLogs = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/audit-logs`, {
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Audit logs error:', error);
    throw error;
  }
};

export const generateUserStatement = async (username, theme) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/statements?theme=${theme}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`,
                'Content-Type': 'application/pdf'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to generate user statement');
        }

        const blob = await response.blob();
        return {
            data: blob,
            filename: `${username}_transaction_statement.pdf`
        };
    } catch (error) {
        console.error('Error generating user statement:', error);
        throw error;
    }
};

export const generateUserStatementByID = async (userId, theme) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/statements?theme=${theme}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`,
                'Accept': 'application/pdf'
            }
        });

        if (!response.ok) {
            // Get the full error message from response
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('PDF Generation Error:', {
            userId,
            error: error.message,
            stack: error.stack
        });
        throw new Error(`Failed to generate statement: ${error.message}`);
    }
};
export const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  
  const cleanNumber = accountNumber.replace(/-/g, '');
  
  return cleanNumber.replace(/(.{5})(.{5})(.{5})(.{0,7})/, '$1-$2-$3-$4');
};

export const unformatAccountNumber = (formattedNumber) => {
  if (!formattedNumber) return '';
  return formattedNumber.replace(/-/g, '');
};

const applyForLoan = async (loanData) => {
    try {
        const response = await fetch('/api/loans/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJwtToken()}`
            },
            body: JSON.stringify(loanData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Loan application failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Loan application error:', error);
        throw error;
    }
};


const getAllLoans = async () => {
  try {
    const response = await fetch('/api/loans/admin', {
      headers: {
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch loans');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get loans error:', error);
    throw error;
  }
};

const approveLoan = async (loanId) => {
  try {
    const response = await fetch(`/api/loans/${loanId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Loan approval error:', error);
    throw error;
  }
};

const rejectLoan = async (loanId) => {
  try {
    const response = await fetch(`/api/loans/${loanId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getJwtToken()}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Loan rejection error:', error);
    throw error;
  }
};

const getLoanDetails = async (loanId) => {
    try {
        const response = await fetch(`/api/loans/${loanId}/details`, {
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`
            }
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Get loan details error:', error);
        throw error;
    }
};

const recordPayment = async (loanId, paymentData) => {
    try {
        const response = await fetch(`/api/loans/${loanId}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJwtToken()}`
            },
            body: JSON.stringify(paymentData)
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Record payment error:', error);
        throw error;
    }
};

const getUserLoans = async () => {
    try {
        const response = await fetch('/api/loans/my-loans', {
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`
            }
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Get user loans error:', error);
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
    getAdminDashboardData,
    getUserDetails,
    getUserFullDetails,
    updateUser,
    updateUserProfile,
    activateUser,
    getUserAuditLogs,
    generateUserStatement,
    generateUserStatementByID,
    formatAccountNumber,
    getUserProfile,
    unformatAccountNumber,
	applyForLoan,
	getAllLoans,
	approveLoan,
	rejectLoan,
	getLoanDetails,
	recordPayment,
	getUserLoans
};
export default api;
