import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { unformatAccountNumber, formatAccountNumber } from '../../services/api';

const Transfer = ({ userAccount, refreshBalance }) => {
    const [targetAccountDetails, setTargetAccountDetails] = useState(null);
    const [validationLoading, setValidationLoading] = useState(false);
    const [formData, setFormData] = useState({
        sourceAccount: userAccount?.accountNumber || '',
        targetAccount: '',
        amount: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const validateAccount = async () => {
            if (formData.targetAccount.length < 5) return;

            setValidationLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/transactions/accounts/${unformatAccountNumber(formData.targetAccount)}`, {
                    headers: { 'Authorization': `Bearer ${getJwtToken()}` }
                });

                if (!response.ok) {
                    setTargetAccountDetails(null);
                    throw new Error('Account not found');
                }

                const data = await response.json();
                setTargetAccountDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setValidationLoading(false);
            }
        };

        const debounceTimer = setTimeout(validateAccount, 500);
        return () => clearTimeout(debounceTimer);
    }, [formData.targetAccount]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/transactions/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                body: JSON.stringify({
                    sourceAccount: unformatAccountNumber(formData.sourceAccount),
                    targetAccount: unformatAccountNumber(formData.targetAccount),
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    status: 'PENDING'
                })
            });

            const responseText = await response.text();
            if (!response.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.message || 'Transfer failed');
                } catch {
                    throw new Error(responseText || 'Transfer failed');
                }
            }

            setSuccess(`Transfer successful!`);

            setFormData(prev => ({
                ...prev,
                targetAccount: '',
                amount: '',
                description: ''
            }));

            if (refreshBalance) refreshBalance();

        } catch (err) {
            setError(err.message);
            if (err.message.includes('Unauthorized') || err.message.includes('token')) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="font-bold mb-6">Transfer Money</h3>
            
            {error && (
                <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-3 mb-4">
                    <p className="text-red-400">{error}</p>
                </div>
            )}
            
            {success && (
                <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-3 mb-4">
                    <p className="text-green-400">{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">From Account</label>
                    <input
                        type="text"
                        name="sourceAccount"
                        value={formatAccountNumber(formData.sourceAccount)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">To Account</label>
                    <input
                        type="text"
                        name="targetAccount"
                        value={formData.targetAccount}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        required
                        placeholder="Enter account number"
                    />
                    {validationLoading && (
                        <div className="mt-2 flex items-center text-sm text-gray-400">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validating...
                        </div>
                    )}
                    {targetAccountDetails && (
                        <div className="mt-2 text-sm text-purple-400">
                            Account Holder: {targetAccountDetails.ownerName}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Amount ($)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            min="0.01"
                            step="0.01"
                            required
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Transfer...
                        </>
                    ) : 'Transfer Money'}
                </button>
            </form>
        </div>
    );
};


export default Transfer;
