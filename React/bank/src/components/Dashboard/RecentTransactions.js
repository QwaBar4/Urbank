import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';
import TransactionHistoryModal from './TransactionHistoryModal';

const RecentTransactions = ({ accountNumber }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecentTransactions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/transactions/history`, {
                    headers: {
                        'Authorization': `Bearer ${getJwtToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recent transactions');
                }

                const data = await response.json();
                setTransactions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (accountNumber) {
            fetchRecentTransactions();
        }
    }, [accountNumber]);

    const getAmountDisplay = (transaction) => {
        const amount = Math.abs(transaction.amount).toFixed(2);
        
        if (transaction.type === 'DEPOSIT') {
            return { text: `+$${amount}`, color: 'text-green-400' };
        }
        
        if (transaction.sourceAccountNumber === accountNumber) {
            return { text: `-$${amount}`, color: 'text-red-400' };
        }
        
        return { text: `+$${amount}`, color: 'text-green-400' };
    };

    const getTransactionDescription = (transaction) => {
        switch (transaction.type) {
            case 'TRANSFER':
                if (transaction.sourceAccountNumber === accountNumber) {
                    return `Transfer to ${transaction.targetAccountOwner || 'Unknown'}`;
                }
                return `Transfer from ${transaction.sourceAccountOwner || 'Unknown'}`;
            case 'DEPOSIT':
                return 'Deposit';
            case 'PAYMENT':
                return `Payment to ${transaction.targetAccountOwner || 'Merchant'}`;
            default:
                return transaction.description || transaction.type;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400">No recent transactions</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            {transactions.slice(0, 2).map((transaction) => {
                const amount = getAmountDisplay(transaction);
                return (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-700">
                        <div className="flex items-center">
                            <div className="bg-purple-600 bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                                {transaction.type === 'TRANSFER' ? (
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{getTransactionDescription(transaction)}</p>
                                <p className="text-gray-400 text-sm">
                                    {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                        <p className={`${amount.color} font-medium`}>{amount.text}</p>
                    </div>
                );
            })}
            
            <button 
                onClick={() => setShowTransactionHistoryModal(true)}
                className="w-full pt-3 text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center"
            >
                View All Transactions
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
            
            {showTransactionHistoryModal && (
                <TransactionHistoryModal 
                    userAccount={transactions[0].sourceAccountNumber}
                    onClose={() => setShowTransactionHistoryModal(false)}
                />
            )}
            
        </div>
        
    );
};

export default RecentTransactions;
