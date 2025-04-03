import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';
import { getJwtToken } from '../../utils/auth';
import { handleResponse } from '../api';

const TransactionHistory = ({ userAccount }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            <table className="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                            <td>{transaction.type}</td>
                            <td>{transaction.sourceAccountNumber || '-'}</td>
                            <td>{transaction.targetAccountNumber || '-'}</td>
                            <td>${transaction.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionHistory;
