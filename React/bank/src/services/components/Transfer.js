import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import { getJwtToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const Transfer = ({ userAccount, refreshBalance }) => {
    const [formData, setFormData] = useState({
        sourceAccount: userAccount?.accountNumber || '',
        targetAccount: '',
        amount: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (userAccount) {
            setFormData(prev => ({
                ...prev,
                sourceAccount: userAccount.accountNumber
            }));
        }
    }, [userAccount]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');
		setSuccess('');

		try {
		    const response = await fetch(`${API_BASE_URL}/api/transactions/transfer`, {
		        method: 'POST',
		        headers: {
		            'Content-Type': 'application/json',
		            'Authorization': `Bearer ${getJwtToken()}`
		        },
		        body: JSON.stringify({
		            sourceAccount: formData.sourceAccount,
		            targetAccount: formData.targetAccount,
		            amount: parseFloat(formData.amount),
		            description: formData.description // Add this
		        })
		    });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Transfer failed');
            }

            const data = await response.json();
            setSuccess(`Transfer successful! Transaction ID: ${data.id}`);
            
            // Reset form
            setFormData(prev => ({
                ...prev,
                targetAccount: '',
                amount: '',
                description: ''
            }));
            
            // Refresh balance
            if (refreshBalance) refreshBalance();
            
        } catch (err) {
            setError(err.message);
            if (err.message.includes('Unauthorized') || err.message.includes('token')) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="transfer-container card">
            <div className="card-body">
                <h2 className="card-title">Transfer Money</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label">From Account:</label>
                        <input
                            type="text"
                            name="sourceAccount"
                            value={formData.sourceAccount}
                            className="form-control"
                            readOnly
                        />
                    </div>
                    
                    <div className="form-group mb-3">
                        <label className="form-label">To Account:</label>
                        <input
                            type="text"
                            name="targetAccount"
                            value={formData.targetAccount}
                            onChange={handleChange}
                            className="form-control"
                            required
                            placeholder="Enter recipient account number"
                        />
                    </div>
                    
                    <div className="form-group mb-3">
                        <label className="form-label">Amount ($):</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="form-control"
                            min="0.01"
                            step="0.01"
                            required
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div className="form-group mb-3">
                        <label className="form-label">Description (Optional):</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., Rent payment"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                            </>
                        ) : 'Transfer'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Transfer;
