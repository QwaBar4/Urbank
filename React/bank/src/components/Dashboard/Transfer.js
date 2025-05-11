import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { unformatAccountNumber, formatAccountNumber } from '../../services/api'

const Transfer = ({ userAccount, refreshBalance }) => {
    const [targetAccountDetails, setTargetAccountDetails] = useState(null);
    const [validationLoading, setValidationLoading] = useState(false);
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
        const validateAccount = async () => {
            if (formData.targetAccount.length < 5) return;

            setValidationLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/transactions/accounts/${unformatAccountNumber(formData.targetAccount)}`,  {
                    headers: { 'Authorization': `Bearer ${getJwtToken()}` }
                });

                if (!response.ok) {
                    setTargetAccountDetails(null);
                    throw new Error('Account not found');
                }

                const data = await response.json();
                setTargetAccountDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setValidationLoading(false);
            }
        };

        const debounceTimer = setTimeout(validateAccount, 500);
        return () => clearTimeout(debounceTimer);
    }, [formData.targetAccount]);

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
				  sourceAccount: unformatAccountNumber(formData.sourceAccount),
				  targetAccount: unformatAccountNumber(formData.targetAccount),
				  amount: parseFloat(formData.amount),
				  description: formData.description
				})
			  });

            const responseText = await response.text();
            if (!response.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.message || 'Transfer failed');
                } catch {
                    throw new Error(responseText || 'Transfer failed');
                }
            }

            setSuccess(`Transfer successful!`);

            setFormData(prev => ({
                ...prev,
                targetAccount: '',
                amount: '',
                description: ''
            }));

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
                {error && (
                    <div className="alert alert-danger" style={{ color: 'red' }}>
                        {error}
                    </div>
                )}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label">From Account:</label>
                        <input
                            type="text"
                            name="sourceAccount"
                            value={formatAccountNumber(formData.sourceAccount)}
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
                        {validationLoading && (
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )}
                        {targetAccountDetails && (
                            <div className="mt-2 text-success" style={{ color: 'green' }}>
                                Account Holder: {targetAccountDetails.ownerName}
                            </div>
                        )}
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
