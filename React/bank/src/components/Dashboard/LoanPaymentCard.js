import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';

const LoanPaymentCard = ({ loan, onPaymentSuccess }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [accountInfo, setAccountInfo] = useState({ accountNumber: '', balance: 0 });

    const nextPayment = loan.paymentSchedule?.find(p => !p.isPaid);

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${getJwtToken()}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch account data');
                
                const data = await response.json();
                setAccountInfo({
                    accountNumber: data.account.accountNumber,
                    balance: data.account.balance
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchAccountData();
    }, []);
        
    const handlePayment = async () => {
        if (!nextPayment || !paymentAmount) return;
        
        setProcessing(true);
        setError('');
        setSuccess('');

        try {
            await api.recordPayment(loan.id, {
            	accountNumber: accountInfo.accountNumber,
                paymentNumber: nextPayment.paymentNumber,
                amount: parseFloat(paymentAmount),
            });
            
            setSuccess('Payment processed successfully!');
            setPaymentAmount('');
            onPaymentSuccess();
        } catch (err) {
            setError(err || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };
    return (
        <div className="bg-black p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-medium">Loan #{loan.id}</h3>
                    <p className="text-sm text-gray-400">
                        ${loan.principal.toFixed(2)} at {loan.interestRate}% interest
                    </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                    loan.status === 'APPROVED' ? 'bg-green-500 bg-opacity-20 text-green-500' : 
                    'bg-yellow-500 bg-opacity-20 text-yellow-500'
                }`}>
                    {loan.status}
                </span>
            </div>

            {nextPayment ? (
                <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Next Payment Due</p>
                            <p>{new Date(nextPayment.paymentDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Amount Due</p>
                            <p>${nextPayment.totalPayment.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Payment Amount</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2"
                                placeholder={nextPayment.totalPayment.toFixed(2)}
                                min="0.01"
                                step="0.01"
                            />
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={processing || !paymentAmount}
                            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Pay'}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-green-500 text-sm mt-2">All payments completed</p>
            )}

            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            {success && (
                <p className="text-green-500 text-sm mt-2">{success}</p>
            )}
        </div>
    );
};

export default LoanPaymentCard;
