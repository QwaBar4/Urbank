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
        <div className="bg-black bg-opacity-70 p-6 rounded-lg border border-gray-700">
            <div className="flex space-x-1 mb-2">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-px bg-gray-400"></div>
                ))}
            </div>
            
            <h2 className="text-xl font-bold mb-6">Transfer Money</h2>
            
            {error && (
                <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4">
                    <p className="text-red-500">{error}</p>
                </div>
            )}
            
            {success && (
                <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg border border-green-500 mb-4">
                    <p className="text-green-500">{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1">From Account</label>
                    <input
                        type="text"
                        name="sourceAccount"
                        value={formatAccountNumber(formData.sourceAccount)}
                        className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 text-white"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-1">To Account</label>
                    <input
                        type="text"
                        name="targetAccount"
                        value={formData.targetAccount}
                        onChange={handleChange}
                        className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 text-white"
                        required
                        placeholder="Enter recipient account number"
                    />
                    {validationLoading && (
                        <div className="mt-2 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            <span className="text-gray-400 text-sm">Validating account...</span>
                        </div>
                    )}
                    {targetAccountDetails && (
                        <div className="mt-2 text-green-500">
                            Account Holder: {targetAccountDetails.ownerName}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-gray-400 mb-1">Amount ($)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 text-white"
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-1">Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 text-white"
                        placeholder="e.g., Rent payment"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </div>
                    ) : 'Transfer Money'}
                </button>
            </form>
            
            <div className="flex space-x-1 mt-6">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-px bg-gray-400"></div>
                ))}
            </div>
        </div>
    );
};

export default Transfer;
