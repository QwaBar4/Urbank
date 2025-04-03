import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import { getJwtToken } from '../../utils/auth';
import { handleResponse } from '../api';

const Transfer = ({ userAccount }) => {
    const [formData, setFormData] = useState({
        sourceAccount: userAccount?.accountNumber || '',
        targetAccount: '',
        amount: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                    amount: parseFloat(formData.amount)
                })
            });

            const data = await handleResponse(response);
            
            if (response.ok) {
                setSuccess('Transfer successful!');
                setFormData(prev => ({
                    ...prev,
                    targetAccount: '',
                    amount: ''
                }));
            }
        } catch (err) {
            setError(err.message || 'Transfer failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="transfer-container">
            <h2>Transfer Money</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>From Account:</label>
                    <input
                        type="text"
                        name="sourceAccount"
                        value={formData.sourceAccount}
                        onChange={handleChange}
                        readOnly
                        className="form-control"
                    />
                </div>
                
                <div className="form-group">
                    <label>To Account:</label>
                    <input
                        type="text"
                        name="targetAccount"
                        value={formData.targetAccount}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                
                <div className="form-group">
                    <label>Amount:</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                        className="form-control"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Transfer'}
                </button>
            </form>
        </div>
    );
};

export default Transfer;
