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
            <div className="modal d-flex align-items-center justify-content-center" style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-content bg-white p-4" style={{ width: '90%', maxWidth: '1000px', maxHeight: '80vh', overflowY: 'auto' }}>
                    <span className="close" onClick={onClose} style={{ float: 'right', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</span>
                    
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-xl fw-bold text-center w-100">Transaction History</h2>
                    </div>
                    
                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center">{error}</div>
                        ) : !transactions || transactions.length === 0 ? (
                            <div className="alert alert-info text-center">No transactions found</div>
                        ) : (
                            <table className="table table-hover" style={{ width: '100%' }}>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="text-center p-3">Date</th>
                                        <th className="text-center p-3">Type</th>
                                        <th className="text-center p-3">Details</th>
                                        <th className="text-center p-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr 
                                            key={transaction.id}
                                            onClick={() => handleRowClick(transaction)}
                                            className="cursor-pointer hover:bg-gray-50"
                                        >
                                            <td className="text-center p-3">{new Date(transaction.timestamp).toLocaleString()}</td>
                                            <td className="text-center p-3">{transaction.type}</td>
                                            <td className="text-center p-3">
                                                {transaction.type === 'TRANSFER' && (
                                                    <>
                                                        <div className="small text-muted mb-1">
                                                            From: {transaction.sourceAccountOwner} 
                                                        </div>
                                                        <div className="small text-muted">
                                                            To: {transaction.targetAccountOwner === 'Unknown' ? 
                                                                <span className="text-xs text-danger">DELETED</span> : 
                                                                transaction.targetAccountOwner}
                                                        </div>
                                                    </>
                                                )}
                                                {transaction.description && <div className="mt-1">Message: {transaction.description}</div>}
                                            </td>
                                            <td className={`text-center p-3 ${getAmountClass(transaction)}`}>
                                                {formatAmount(transaction)}
                                            </td>
                                            <td className="text-center p-3">
                                                <span className={`badge ${
                                                    transaction.status === 'COMPLETED' ? 'bg-success' : 
                                                    transaction.status === 'FAILED' ? 'bg-danger' : 'bg-warning'
                                                }`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="text-center p-3 small text-muted">{transaction.reference}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    <div className="d-flex justify-content-center mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
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
