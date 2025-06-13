import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';

const Deposit = () => {
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
            const response = await fetch(`${API_BASE_URL}/api/transactions/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                body: JSON.stringify({
                    accountNumber: accountInfo.accountNumber,
                    amount: parseFloat(amount),
                    description: description || 'Deposit'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Deposit failed');
            }

            const data = await response.json();
            setSuccess(`Deposit successful! New balance: $${data.newBalance.toFixed(2)}`);
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
        <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
            <div className="relative z-10 max-w-6xl mx-auto w-full">
                <div className="flex flex-col items-center my-6">
                    <div className="flex space-x-1 mb-2">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="w-2 h-px bg-gray-400"></div>
                        ))}
                    </div>

                    <div className="flex items-center">
                        <div className="flex flex-col space-y-1 mr-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-px h-2 bg-gray-400"></div>
                            ))}
                        </div>
                        <div className="px-4 py-2 border border-white rounded">
                            <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold">
                                Make a Deposit
                            </h1>
                        </div>
                        <div className="flex flex-col space-y-1 ml-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-px h-2 bg-gray-400"></div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex space-x-1 mt-2">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="w-2 h-px bg-gray-400"></div>
                        ))}
                    </div>
                </div>

                <div className="bg-black bg-opacity-70 p-6 rounded-lg mb-6">
                    {error && (
                        <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-4">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-gray-400">Account Number</p>
                                <p className="font-mono">{accountInfo.accountNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Current Balance</p>
                                <p>${accountInfo.balance.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <h2 className="text-xl font-bold mb-4">Deposit Details</h2>
                        
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Amount to Deposit</label>
                            <div className="flex">
                                <span className="bg-white bg-opacity-10 border border-r-0 border-gray-500 rounded-l px-3 py-2">$</span>
                                <input
                                    type="number"
                                    className="flex-1 bg-white bg-opacity-10 border border-gray-500 rounded-r px-3 py-2"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0.01"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-gray-400 text-sm mt-1">Minimum deposit: $0.01</p>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block mb-2 font-medium">Description (Optional)</label>
                            <input
                                type="text"
                                className="w-full bg-white bg-opacity-10 border border-gray-500 rounded px-3 py-2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Cash deposit, Check deposit"
                            />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Complete Deposit'}
                            </button>
                            <button 
                                type="button" 
                                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showInfoModal && success && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-md w-full border border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Operation completed!</h3>
                        <p className="mb-6">{success}</p>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
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

export default Deposit;
