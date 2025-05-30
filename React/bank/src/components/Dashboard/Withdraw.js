import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';

const Withdraw = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showInfoModal, setShowInfoModal] = useState(false);
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
            const response = await fetch(`${API_BASE_URL}/api/transactions/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                body: JSON.stringify({
                    accountNumber: accountInfo.accountNumber,
                    amount: parseFloat(amount),
                    description: description || 'Withdrawal'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Withdrawal failed');
            }

            const data = await response.json();
            setSuccess(`Withdrawal successful! New balance: $${data.newBalance.toFixed(2)}`);
            setShowInfoModal(true);
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
        <div className="container mt-4 mx-3">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card">
                        <div className="card-header bg-success text-white">
                            <h3 className="mb-0">Make a Withdrawal</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            <div className="mb-4">
                                <h5>Account Information</h5>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Account Number:</span>
                                    <span className="font-monospace">{accountInfo.accountNumber}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Available Balance:</span>
                                    <span>${accountInfo.balance.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-3">
                                    <label htmlFor="amount" className="form-label">Amount to Withdraw</label>
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
                                            max={accountInfo.balance}
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <small className="form-text text-muted">Maximum withdrawal: ${accountInfo.balance.toFixed(2)}</small>
                                </div>
                                
                                <div className="form-group mb-4">
                                    <label htmlFor="description" className="form-label">Description (Optional)</label>
                                    <input
                                        type="text"
                                        id="description"
                                        className="form-control"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g., Cash withdrawal, ATM withdrawal"
                                    />
                                </div>
                                
                                <div className="d-grid gap-2">
                                    <button 
                                        type="submit" 
                                        className="btn btn-success border w-80 h-7 me-2 border-black me-2"
                                        disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > accountInfo.balance}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : 'Complete Withdrawal'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary border w-80 h-7 me-2 border-black me-2"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="card-footer text-muted">
                            <small>Withdrawals are processed immediately. Daily withdrawal limits may apply.</small>
                        </div>
                    </div>
                </div>
            </div>     
            
		    {showInfoModal && success && (
		            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
		                <div className="modal-dialog modal-lg">
		                    <div className="modal-content">
		                        <h1 className="modal-title text-2xl">Operation completed!</h1>
		                        <h5 className="mt-2">{success}</h5>
		                        <div className="modal-footer">
		                            <button
		                                type="button"
		                                className="btn btn-secondary border w-40 h-7 me-2 border-black me-2 mt-5"
		                                onClick={() => {
		                                    setShowInfoModal(false);
		                                }}
		                            >
		                                Close
		                            </button>
		                        </div>
		                    </div>
		                </div>
		            </div>
				)}
        </div>
    );
};

export default Withdraw;
