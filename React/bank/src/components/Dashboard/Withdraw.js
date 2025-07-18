import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';

const Withdraw = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [accountInfo, setAccountInfo] = useState({ accountNumber: '', balance: 0 });
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/transactions/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                body: JSON.stringify({
                    accountNumber: accountInfo.accountNumber,
                    amount: parseFloat(amount),
                    description: description || 'Withdrawal'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Withdrawal failed');
            }

            const data = await response.json();
            setSuccess(`Withdrawal successful! New balance: $${data.newBalance.toFixed(2)}`);
            setShowInfoModal(true);
            setAccountInfo(prev => ({ ...prev, balance: data.newBalance }));
            setAmount('');
            setDescription('');
            
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="pt-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-medium">Make a Withdrawal</h2>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    {error && (
                        <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-4">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm">Account Number</p>
                                <p className="font-mono">{accountInfo.accountNumber}</p>
                            </div>
                            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm">Available Balance</p>
                                <p className="text-xl font-bold">${accountInfo.balance.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <h2 className="text-lg font-medium mb-4">Withdrawal Details</h2>
                        
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Amount to Withdraw</label>
                            <div className="flex">
                                <span className="bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg px-3 py-2 flex items-center">$</span>
                                <input
                                    type="number"
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0.01"
                                    step="0.01"
                                    max={accountInfo.balance}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-gray-400 text-xs mt-1">Maximum withdrawal: ${accountInfo.balance.toFixed(2)}</p>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block mb-2 font-medium">Description (Optional)</label>
                            <input
                                type="text"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Cash withdrawal, ATM withdrawal"
                            />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center"
                                disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > accountInfo.balance}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : 'Complete Withdrawal'}
                            </button>
                            <button 
                                type="button" 
                                className="px-4 py-2 bg-transparent text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showInfoModal && success && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Operation completed!</h3>
                        <p className="mb-6">{success}</p>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                                onClick={() => setShowInfoModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Withdraw;
