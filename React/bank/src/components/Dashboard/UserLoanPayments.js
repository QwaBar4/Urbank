import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import logotype from '../../assets/logotype.jpg';

const UserLoanPayments = () => {
    const [loans, setLoans] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        const fetchUserLoans = async () => {
            try {
                const response = await api.getUserLoans();
                setLoans(response);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your loans');
            } finally {
                setLoading(false);
            }
        };
        fetchUserLoans();
    }, []);

    const handlePayment = async () => {
        if (!selectedLoan || !paymentAmount) return;

        setProcessingPayment(true);
        setError('');

        try {
            await api.recordPayment(selectedLoan.id, {
                amount: parseFloat(paymentAmount)
            });
            // Refresh loan data
            const updatedLoans = await api.getUserLoans();
            setLoans(updatedLoans);
            setSelectedLoan(updatedLoans.find(loan => loan.id === selectedLoan.id));
            setPaymentAmount('');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed');
        } finally {
            setProcessingPayment(false);
        }
    };

    const getNextPayment = (loan) => {
        return loan.paymentSchedule?.find(payment => !payment.isPaid) || null;
    };

    return (
        <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10 z-0"
                style={{ backgroundImage: `url(${logotype})` }} />

            <div className="relative z-10 max-w-4xl mx-auto w-full">
                <h1 className="text-2xl font-bold mb-6">Your Loan Payments</h1>

                {error && (
                    <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : loans.length === 0 ? (
                    <div className="text-center py-8">
                        <p>You don't have any active loans</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Loans List */}
                        <div className="space-y-4">
                            {loans.map(loan => (
                                <div key={loan.id} className="bg-gray-900 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">Loan #{loan.id}</h3>
                                            <p className="text-gray-400 text-sm">
                                                ${loan.principal.toFixed(2)} at {loan.interestRate}% for {loan.termMonths} months
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedLoan(loan === selectedLoan ? null : loan)}
                                            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                                        >
                                            {loan === selectedLoan ? 'Hide' : 'View'}
                                        </button>
                                    </div>

                                    {/* Expanded Loan Details */}
                                    {loan === selectedLoan && (
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-gray-400 text-sm">Status</p>
                                                    <p className={`${
                                                        loan.status === 'APPROVED' ? 'text-green-500' :
                                                        loan.status === 'REJECTED' ? 'text-red-500' : 'text-yellow-500'
                                                    }`}>
                                                        {loan.status}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-sm">Next Payment</p>
                                                    <p>
                                                        {getNextPayment(loan) ? 
                                                            `$${getNextPayment(loan).totalPayment.toFixed(2)} on ${new Date(getNextPayment(loan).paymentDate).toLocaleDateString()}` : 
                                                            'No payments due'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Form */}
                                            {loan.status === 'APPROVED' && getNextPayment(loan) && (
                                                <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                                                    <h4 className="font-medium mb-3">Make Payment</h4>
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="flex-1">
                                                            <label className="block text-gray-400 text-sm mb-1">Amount</label>
                                                            <input
                                                                type="number"
                                                                value={paymentAmount}
                                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                                className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2"
                                                                placeholder={getNextPayment(loan).totalPayment.toFixed(2)}
                                                                min="0.01"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={handlePayment}
                                                            disabled={processingPayment}
                                                            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 mt-6 sm:mt-0"
                                                        >
                                                            {processingPayment ? 'Processing...' : 'Pay Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Payment History */}
                                            <div className="mt-4">
                                                <h4 className="font-medium mb-2">Payment History</h4>
                                                {loan.paymentSchedule?.filter(p => p.isPaid).length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="border-b border-gray-700">
                                                                    <th className="text-left p-2">Date</th>
                                                                    <th className="text-right p-2">Amount</th>
                                                                    <th className="text-right p-2">Principal</th>
                                                                    <th className="text-right p-2">Interest</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {loan.paymentSchedule
                                                                    .filter(payment => payment.isPaid)
                                                                    .map(payment => (
                                                                        <tr key={payment.paymentNumber} className="border-b border-gray-700">
                                                                            <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                                                            <td className="p-2 text-right">${payment.totalPayment.toFixed(2)}</td>
                                                                            <td className="p-2 text-right">${payment.principalAmount.toFixed(2)}</td>
                                                                            <td className="p-2 text-right">${payment.interestAmount.toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-400 text-sm">No payments made yet</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserLoanPayments;
