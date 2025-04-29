import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';

const Deposit = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [accountInfo, setAccountInfo] = useState({ accountNumber: '', balance: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${getJwtToken()}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch account data');
                
                const data = await response.json();
                setAccountInfo({
                    accountNumber: data.account.accountNumber,
                    balance: data.account.balance
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchAccountData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/transactions/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                body: JSON.stringify({
                    accountNumber: accountInfo.accountNumber,
                    amount: parseFloat(amount),
                    description: description || 'Deposit'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Deposit failed');
            }

		const data = await response.json();
		setSuccess(`Deposit successful! New balance: $${data.newBalance.toFixed(2)}`);
		setAccountInfo(prev => ({ ...prev, balance: data.newBalance }));
            setAmount('');
            setDescription('');
            
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Make a Deposit</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            
                            <div className="mb-4">
                                <h5>Account Information</h5>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Account Number:</span>
                                    <span className="font-monospace">{accountInfo.accountNumber}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Current Balance:</span>
                                    <span>${accountInfo.balance.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-3">
                                    <label htmlFor="amount" className="form-label">Amount to Deposit</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input
                                            type="number"
                                            id="amount"
                                            className="form-control"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="0.01"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <small className="form-text text-muted">Minimum deposit: $0.01</small>
                                </div>
                                
                                <div className="form-group mb-4">
                                    <label htmlFor="description" className="form-label">Description (Optional)</label>
                                    <input
                                        type="text"
                                        id="description"
                                        className="form-control"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g., Cash deposit, Check deposit"
                                    />
                                </div>
                                
                                <div className="d-grid gap-2">
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
                                        ) : 'Complete Deposit'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="card-footer text-muted">
                            <small>Deposits are processed immediately. For large deposits, additional verification may be required.</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Deposit;
