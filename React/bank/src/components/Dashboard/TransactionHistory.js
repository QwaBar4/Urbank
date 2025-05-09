import React, { useState, useEffect } from 'react';
import { API_BASE_URL, handleResponse, getDashboardData } from '../../services/api';
import { getJwtToken } from '../../utils/auth';

const TransactionHistory = ({ userAccount }) => {
    const [transactions, setTransactions] = useState([]);
    const [name, setName] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getAmountClass = (transaction) => {
        if (transaction.type === 'DEPOSIT') return 'text-success';
        if (transaction.sourceAccountNumber === userAccount.accountNumber) return 'text-danger';
        if (transaction.targetAccountNumber === userAccount.accountNumber) return 'text-success';
        return 'text-muted';
    };

    const formatAmount = (transaction) => {
        const amount = Math.abs(transaction.amount).toFixed(2);
        if (transaction.type == 'TRANSFER') {
		    if (transaction.targetAccountOwner == transaction.sourceAccountOwner){
		        return `${amount}$`;
		    } else if (transaction.sourceAccountOwner == name){
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
                setTransactions(data);
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
                                    {transaction.type === 'TRANSFER' && (
                                        <>
                                            <div className="small text-muted">
                                                From: {transaction.sourceAccountOwner}
                                            </div>
                                            <div className="small text-muted">
                                                To: {transaction.targetAccountOwner}
                                            </div>
                                        </>
                                    )}
                                    {transaction.description && `Message: ${transaction.description}`}
                                </td>
                                <td className={`text-end ${getAmountClass(transaction)}`}>
                                    {formatAmount(transaction)}
                                </td>
                                <td>
                                    {transaction.status}
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
