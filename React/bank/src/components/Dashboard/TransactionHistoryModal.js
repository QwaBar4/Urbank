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

    const getAmountClass = (transaction) => {
        if (transaction.type === 'DEPOSIT') return 'text-success';
        if (transaction.sourceAccountNumber === userAccount.accountNumber) return 'text-danger';
        if (transaction.targetAccountNumber === userAccount.accountNumber) return 'text-success';
        return 'text-muted';
    };

    const formatAmount = (transaction) => {
        const amount = Math.abs(transaction.amount).toFixed(2);
        if (transaction.type === 'TRANSFER') {
            if (transaction.targetAccountOwner === transaction.sourceAccountOwner){
                return `${amount}$`;
            } else if (transaction.sourceAccountOwner === name){
                return `-${amount}$`;
            }
            else{
                return `+${amount}$`;
            }
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

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Transaction History</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="p-4">
                        {loading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Details</th>
                                            <th className="text-end">Amount</th>
                                            <th>Status</th>
                                            <th>Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr 
                                                key={transaction.id}
                                                onClick={() => handleRowClick(transaction)}
                                                className="cursor-pointer hover:bg-gray-50"
                                            >
                                                <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                                                <td>{transaction.type}</td>
												<td>
													{transaction.type === 'TRANSFER' && (
														<>
															<div className="small text-muted">
																From: {transaction.sourceAccountOwner} 
															</div>
															<div className="small text-muted">
																To: {transaction.targetAccountOwner === 'Unknown' ? <span className="text-xs text-red-500">DELETED</span> : transaction.targetAccountOwner}
															</div>
														</>
													)}
													{transaction.description && `Message: ${transaction.description}`}
												</td>
                                                <td className={`text-end ${getAmountClass(transaction)}`}>
                                                    {formatAmount(transaction)}
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        transaction.status === 'COMPLETED' ? 'bg-success' : 
                                                        transaction.status === 'FAILED' ? 'bg-danger' : 'bg-warning'
                                                    }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">{transaction.reference}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 border-t flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
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
