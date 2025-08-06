import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getDashboardData } from '../../services/api';
import { getJwtToken } from '../../utils/auth';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionHistoryModal = ({ userAccount, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [name, setName] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const getAmountClass = (transaction) => {
        if (transaction.type === 'DEPOSIT') return 'text-green-500';
        if (transaction.type === 'WITHDRAWAL') return 'text-red-500';
        if (transaction.sourceAccountOwner === name) return 'text-red-500';
        if (transaction.targetAccountOwner === name) return 'text-green-500';
        return 'text-gray-400';
    };

    const formatAmount = (transaction) => {
        const amount = Math.abs(transaction.amount).toFixed(2);
        if (transaction.type === 'TRANSFER') {
            if (transaction.targetAccountOwner === transaction.sourceAccountOwner) {
                return `${amount}$`;
            } else if (transaction.sourceAccountOwner === name) {
                return `-${amount}$`;
            } else {
                return `+${amount}$`;
            }
        }
        else if (transaction.type === 'WITHDRAWAL') {
			return `-${amount}$`;
        }
        return `${amount}$`;
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/transactions/history`, {
                    headers: {
                        'Authorization': `Bearer ${getJwtToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch transactions');
                }

                const data = await response.json();
                const userData = await getDashboardData();
                const transactionsWithAccount = data.map(tx => ({
                    ...tx,
                    userAccountNumber: userAccount.accountNumber
                }));
                setTransactions(transactionsWithAccount);
                setName(userData.username);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userAccount) {
            fetchTransactions();
        }
    }, [userAccount]);

    const handleRowClick = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
    };

    const handleClose = () => {
        setIsClosing(true);
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    return (
        <>
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 overflow-y-auto transition-opacity duration-300 ${
                isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
            }`}>
                <div className={`bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[80vh] overflow-y-auto transition-all duration-300 ${
                    isVisible && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Transaction History</h2>
                        <button 
                            onClick={handleClose}
                            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center p-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg border border-red-500 text-center">
                            {error}
                        </div>
                    ) : !transactions || transactions.length === 0 ? (
                        <div className="bg-blue-500 bg-opacity-20 p-4 rounded-lg border border-blue-500 text-center">
                            No transactions found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-3 text-gray-400">Date</th>
                                        <th className="text-left p-3 text-gray-400">Type</th>
                                        <th className="text-left p-3 text-gray-400">Details</th>
                                        <th className="text-right p-3 text-gray-400">Amount</th>
                                        <th className="text-center p-3 text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr 
                                            key={transaction.id}
                                            onClick={() => handleRowClick(transaction)}
                                            className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                                        >
                                            <td className="p-3">
                                                {new Date(transaction.timestamp).toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                                {transaction.type}
                                            </td>
                                            <td className="p-3">
                                                {transaction.type === 'TRANSFER' && (
                                                    <>
                                                        <div className="text-sm text-gray-400 mb-1">
                                                            From: {transaction.sourceAccountOwner === 'Unknown' ? 
                                                                <span className="text-xs text-red-500">DELETED</span> : 
                                                                transaction.sourceAccountOwner}
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            To: {transaction.targetAccountOwner === 'Unknown' ? 
                                                                <span className="text-xs text-red-500">DELETED</span> : 
                                                                transaction.targetAccountOwner}
                                                        </div>
                                                    </>
                                                )}
                                                {transaction.description && 
                                                    <div className="mt-1 text-sm">Message: {transaction.description}</div>
                                                }
                                            </td>
                                            <td className={`p-3 text-right ${getAmountClass(transaction)} font-medium`}>
                                                {formatAmount(transaction)}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-block px-2 py-1 rounded text-xs ${
                                                    transaction.status === 'COMPLETED' ? 'bg-green-500 bg-opacity-20 text-green-500' : 
                                                    transaction.status === 'FAILED' ? 'bg-red-500 bg-opacity-20 text-red-500' : 
                                                    'bg-yellow-500 bg-opacity-20 text-yellow-500'
                                                }`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {showDetailsModal && (
                <TransactionDetailsModal 
                    transaction={selectedTransaction}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}
        </>
    );
};

export default TransactionHistoryModal;
