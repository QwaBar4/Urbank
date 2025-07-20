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
            setError(err?.response?.data?.message || err.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg">Loan #{loan.id}</h3>
                    <p className="text-gray-400 text-sm">
                        ${loan.principal.toFixed(2)} at {loan.interestRate}% interest
                    </p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    loan.status === 'APPROVED' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
                }`}>
                    {loan.status}
                </span>
            </div>

            {nextPayment ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-gray-400 text-xs">Due Date</p>
                            <p className="font-medium">
                                {new Date(nextPayment.paymentDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-gray-400 text-xs">Amount Due</p>
                            <p className="font-medium">
                                ${nextPayment.totalPayment.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Your Available Balance</p>
                        <p className="font-medium text-lg">
                            ${accountInfo.balance?.toFixed(2) || 'Loading...'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Payment Amount</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                placeholder={`Suggested: $${nextPayment.totalPayment.toFixed(2)}`}
                                min="0.01"
                                step="0.01"
                                max={accountInfo.balance}
                            />
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing || !paymentAmount}
                            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                                processing || !paymentAmount
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Payment...
                                </>
                            ) : (
                                'Make Payment'
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-900 bg-opacity-20 p-3 rounded-lg border border-green-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">All payments completed</span>
                </div>
            )}

            {error && (
                <div className="mt-3 bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-400">{error}</span>
                </div>
            )}

            {success && (
                <div className="mt-3 bg-green-900 bg-opacity-20 p-3 rounded-lg border border-green-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">{success}</span>
                </div>
            )}
        </div>
    );
};

export default LoanPaymentCard;
