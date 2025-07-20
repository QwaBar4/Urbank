import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';
import { getJwtToken } from '../../utils/auth';
import { unformatAccountNumber, formatAccountNumber } from '../../services/api';

const PaymentsModal = ({ userAccount, refreshBalance, onClose }) => {
    const [payeeDetails, setPayeeDetails] = useState(null);
    const [validationLoading, setValidationLoading] = useState(false);
    const [formData, setFormData] = useState({
        sourceAccount: userAccount?.accountNumber || '',
        payeeAccount: '',
        amount: '',
        reference: '',
        paymentType: 'BILL'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [payeeList, setPayeeList] = useState([]);

    // Load saved payees on component mount
    useEffect(() => {
        const fetchPayees = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/payments/payees`, {
                    headers: { 'Authorization': `Bearer ${getJwtToken()}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setPayeeList(data);
                }
            } catch (err) {
                console.error('Failed to fetch payees:', err);
            }
        };
        
        fetchPayees();
    }, []);

    const validatePayee = async () => {
        if (formData.payeeAccount.length < 5) return;

        setValidationLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/payments/validate/${unformatAccountNumber(formData.payeeAccount)}`, {
                headers: { 'Authorization': `Bearer ${getJwtToken()}` }
            });

            if (!response.ok) {
                setPayeeDetails(null);
                throw new Error('Payee account not found or invalid');
            }

            const data = await response.json();
            setPayeeDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setValidationLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Clear payee details when account number changes
        if (e.target.name === 'payeeAccount') {
            setPayeeDetails(null);
        }
    };

    const handlePayeeSelect = (payee) => {
        setFormData({
            ...formData,
            payeeAccount: payee.accountNumber,
            paymentType: payee.paymentType || 'BILL'
        });
        setPayeeDetails({
            accountNumber: payee.accountNumber,
            name: payee.name
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJwtToken()}`
                },
                body: JSON.stringify({
                    sourceAccount: unformatAccountNumber(formData.sourceAccount),
                    payeeAccount: unformatAccountNumber(formData.payeeAccount),
                    amount: parseFloat(formData.amount),
                    reference: formData.reference,
                    paymentType: formData.paymentType
                })
            });

            const responseText = await response.text();
            if (!response.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.message || 'Payment failed');
                } catch {
                    throw new Error(responseText || 'Payment failed');
                }
            }

            setSuccess(`Payment processed successfully!`);
            setFormData(prev => ({
                ...prev,
                payeeAccount: '',
                amount: '',
                reference: ''
            }));

            if (refreshBalance) refreshBalance();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">Make a Payment</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
                
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
                        <label className="block text-sm text-gray-400 mb-2">To Payee</label>
                        <div className="mb-2">
                            {payeeList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {payeeList.map(payee => (
                                        <button
                                            type="button"
                                            key={payee.id}
                                            onClick={() => handlePayeeSelect(payee)}
                                            className={`text-xs px-3 py-1 rounded-full ${formData.payeeAccount === payee.accountNumber ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            {payee.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            name="payeeAccount"
                            value={formData.payeeAccount}
                            onChange={handleChange}
                            onBlur={validatePayee}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            required
                            placeholder="Enter payee account number"
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
                        {payeeDetails && (
                            <div className="mt-2 text-sm text-purple-400">
                                Payee: {payeeDetails.name}
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
                            <label className="block text-sm text-gray-400 mb-2">Reference</label>
                            <input
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                required
                                placeholder="Payment reference"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Payment Type</label>
                        <select
                            name="paymentType"
                            value={formData.paymentType}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                            <option value="BILL">Bill Payment</option>
                            <option value="LOAN">Loan Payment</option>
                            <option value="TAX">Tax Payment</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center"
                            disabled={isLoading || !payeeDetails}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : 'Make Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentsModal;
