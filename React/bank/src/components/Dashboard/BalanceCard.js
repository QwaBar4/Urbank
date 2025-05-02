import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatAccountNumber} from '../../services/api'

const BalanceCard = ({ accountNumber, balance, refreshBalance }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    const handleRefresh = async (e) => {
        e.preventDefault(); // Prevent any default navigation
        e.stopPropagation(); // Stop event bubbling
        setIsRefreshing(true);
        try {
            await refreshBalance();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDeposit = () => {
        navigate('/deposit');
    };

    const handleWithdraw = () => {
        navigate('/withdraw');
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Account Balance</h5>
                    <button 
                        onClick={handleRefresh}
                        className="btn btn-sm btn-outline-secondary"
                        disabled={isRefreshing}
                        aria-label="Refresh balance"
                    >
                        {isRefreshing ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <span>↻Refresh↻</span> 
                        )}
                    </button>
                </div>
                
                <div className="mb-3">
                    <small className="text-muted">Account Number</small>
                    <p className="mb-0 font-monospace">
                   	 ${accountNumber ? formatAccountNumber(accountNumber) : 'Loading...'}
                    </p>
                </div>
                
                <div className="mb-4">
                    <small className="text-muted">Available Balance</small>
                    <h3 className="mb-0">
                        ${balance !== undefined ? balance.toFixed(2) : '0.00'}
                    </h3>
                </div>
                
                <div className="d-grid gap-2">
                    <button 
                        onClick={handleDeposit}
                        className="btn btn-primary"
                    >
                        Deposit
                    </button>
                    <button 
                        onClick={handleWithdraw}
                        className="btn btn-success"
                    >
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;
