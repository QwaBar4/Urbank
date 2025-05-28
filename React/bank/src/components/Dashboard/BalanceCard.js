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
                
                <div className="mb-3">
                    <small className="text-muted">Account Number</small>
                    <h3 className="mb-0">
                   	 {accountNumber ? formatAccountNumber(accountNumber) : 'Loading...'}
                    </h3>
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
                        className="btn btn-primary border w-20 h-7 me-2 border-black me-2"
                    >
                        Deposit
                    </button>
                    <button 
                        onClick={handleWithdraw}
                        className="btn btn-success border w-20 h-7 me-2 border-black me-2"
                    >
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;
