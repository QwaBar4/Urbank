import React from 'react';
import { API_BASE_URL } from '../api';
import { getJwtToken } from '../../utils/auth';
import { useState, useEffect } from 'react';

const BalanceCard = ({ accountNumber, balance, refreshBalance }) => {
    const [currentBalance, setCurrentBalance] = useState(balance);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Sync with parent component's balance
    useEffect(() => {
        setCurrentBalance(balance);
    }, [balance]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/transactions/balance`, {
                headers: {
                    'Authorization': `Bearer ${getJwtToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to refresh balance');
            
            const newBalance = await response.json();
            setCurrentBalance(newBalance);
            
            // Notify parent component if refreshBalance prop is provided
            if (refreshBalance) {
                refreshBalance(newBalance);
            }
        } catch (error) {
            console.error("Balance refresh error:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Account Balance</h5>
                    <button 
                        onClick={handleRefresh}
                        className="btn btn-sm btn-outline-secondary"
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <i className="bi bi-arrow-clockwise"></i>
                        )}
                    </button>
                </div>
                
                <hr />
                
                <div className="mb-2">
                    <small className="text-muted">Account Number</small>
                    <p className="mb-0">{accountNumber || 'Loading...'}</p>
                </div>
                
                <div>
                    <small className="text-muted">Available Balance</small>
                    <h3 className="mb-0">
                        ${currentBalance !== undefined ? currentBalance.toFixed(2) : '0.00'}
                    </h3>
                </div>
                
                <div className="mt-3">
                    <button className="btn btn-outline-primary btn-sm me-2">
                        Deposit
                    </button>
                    <button className="btn btn-outline-success btn-sm">
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;
