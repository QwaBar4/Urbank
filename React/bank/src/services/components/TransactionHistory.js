import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import { getJwtToken } from '../../utils/auth';
import { handleResponse } from '../api';

const TransactionHistory = ({ userAccount }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const getAmountClass = (transaction) => {
        if (transaction.type === 'DEPOSIT') return 'text-success';
        if (transaction.sourceAccountNumber === userAccount.accountNumber) return 'text-danger';
        return 'text-success';
    };

    const formatAmount = (transaction) => {
        const amount = transaction.amount.toFixed(2);
        if (transaction.sourceAccountNumber === userAccount.accountNumber) {
            return `-$${amount}`;
        }
        return `+$${amount}`;
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
                setTransactions(data);
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

    if (loading) return <div>Loading transactions...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;


    return (
        <div className="transaction-history">
            <h3>Transaction History</h3>
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
                            <tr key={transaction.id}>
                                <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                                <td>{transaction.type}</td>
								<td>
									{"Message: " + transaction.description || '-'}
									{transaction.type === 'TRANSFER' && (
										<>
											<div className="small text-muted">
												From: {transaction.sourceAccountNumber || '-'}
											</div>
											<div className="small text-muted">
												To: {transaction.targetAccountNumber || '-'}
											</div>
										</>
									)}
								</td>
                                <td className={`text-end ${getAmountClass(transaction)}`}>
                                    {formatAmount(transaction)}
                                </td>
                                <td>
								  {transaction.user?.username || 'System Transaction'}
								</td>
                                <td>
                                    <span className={`badge ${
                                        transaction.status === 'COMPLETED' ? 'bg-success' : 
                                        transaction.status === 'PENDING' ? 'bg-warning' : 'bg-danger'
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
        </div>
    );
};

export default TransactionHistory;
