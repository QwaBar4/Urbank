import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const LoanDetails = ({ loan, onClose, refreshLoans }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('schedule');
    const [nextPayment, setNextPayment] = useState(null);

    useEffect(() => {
        if (loan.paymentSchedule) {
            const upcoming = loan.paymentSchedule.find(
                payment => !payment.isPaid && new Date(payment.paymentDate) <= new Date()
            ) || loan.paymentSchedule.find(payment => !payment.isPaid);
            setNextPayment(upcoming);
        }
    }, [loan]);

    const handlePayment = async (e) => {
        e.stopPropagation(); 
        if (!nextPayment || !paymentAmount) return;
        
        setPaymentProcessing(true);
        setPaymentError('');
        setPaymentSuccess('');

        try {
            await api.recordPayment(loan.id, {
                paymentNumber: nextPayment.paymentNumber,
                amount: parseFloat(paymentAmount)
            });
            
            setPaymentSuccess('Payment recorded successfully!');
            setPaymentAmount('');
            
            const updatedLoan = await api.getLoanDetails(loan.id);
            refreshLoans(updatedLoan);
        } catch (err) {
            setPaymentError(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setPaymentProcessing(false);
        }
    };
    
    const handleClose = (e) => {
        e.stopPropagation();
        onClose();
    };
    
    const calculateTotals = () => {
        if (!loan.paymentSchedule) return {};
        
        return loan.paymentSchedule.reduce((acc, payment) => {
            if (payment.isPaid) {
                acc.paidPrincipal += payment.principalAmount;
                acc.paidInterest += payment.interestAmount;
            } else {
                acc.pendingPrincipal += payment.principalAmount;
                acc.pendingInterest += payment.interestAmount;
            }
            return acc;
        }, { 
            paidPrincipal: 0, 
            paidInterest: 0, 
            pendingPrincipal: 0, 
            pendingInterest: 0 
        });
    };
    
    const handleTabChange = (tab) => (e) => {
        e.stopPropagation();
        setActiveTab(tab);
    };
    
    const totals = calculateTotals();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div 
                className="bg-gray-800 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Loan #{loan.id}</h2>
                        <p className="text-gray-400">{loan.username || 'N/A'}</p>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                        <h3 className="font-semibold mb-3 text-gray-200">Loan Terms</h3>
                        <div className="space-y-2 text-gray-100">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Principal:</span>
                                <span>${loan.principal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Interest Rate:</span>
                                <span>{loan.interestRate}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Term:</span>
                                <span>{loan.termMonths} months</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Start Date:</span>
                                <span>{new Date(loan.startDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                        <h3 className="font-semibold mb-3 text-gray-200">Payment Summary</h3>
                        <div className="space-y-2 text-gray-100">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Paid Principal:</span>
                                <span className="text-green-400">${totals.paidPrincipal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Paid Interest:</span>
                                <span className="text-green-400">${totals.paidInterest.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Pending Principal:</span>
                                <span className="text-yellow-400">${totals.pendingPrincipal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Pending Interest:</span>
                                <span className="text-yellow-400">${totals.pendingInterest.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-4">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'schedule' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={handleTabChange('schedule')}
                    >
                        Payment Schedule
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'activity' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={handleTabChange('activity')}
                    >
                        Payment Activity
                    </button>
                </div>

                {/* Payment Schedule Tab */}
                {activeTab === 'schedule' && (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-3 text-gray-400">#</th>
                                        <th className="text-left p-3 text-gray-400">Due Date</th>
                                        <th className="text-right p-3 text-gray-400">Principal</th>
                                        <th className="text-right p-3 text-gray-400">Interest</th>
                                        <th className="text-right p-3 text-gray-400">Total</th>
                                        <th className="text-right p-3 text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loan.paymentSchedule?.map(payment => (
                                        <tr key={payment.paymentNumber} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                                            <td className="p-3">{payment.paymentNumber}</td>
                                            <td className="p-3">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                            <td className="p-3 text-right">${payment.principalAmount.toFixed(2)}</td>
                                            <td className="p-3 text-right">${payment.interestAmount.toFixed(2)}</td>
                                            <td className="p-3 text-right">${payment.totalPayment.toFixed(2)}</td>
                                            <td className="p-3 text-right">
                                                <span className={`inline-block px-2 py-1 rounded text-xs ${
                                                    payment.isPaid ? 'bg-green-500 bg-opacity-20 text-green-500' 
                                                    : new Date(payment.paymentDate) < new Date() ? 'bg-red-500 bg-opacity-20 text-red-500'
                                                    : 'bg-yellow-500 bg-opacity-20 text-yellow-500'
                                                }`}>
                                                    {payment.isPaid ? 'Paid' : 
                                                    new Date(payment.paymentDate) < new Date() ? 'Overdue' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Payment Activity Tab */}
                {activeTab === 'activity' && (
                    <div>
                        {loan.paymentActivity?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left p-3 text-gray-400">Date</th>
                                            <th className="text-left p-3 text-gray-400">Installment</th>
                                            <th className="text-right p-3 text-gray-400">Amount</th>
                                            <th className="text-right p-3 text-gray-400">Method</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loan.paymentActivity.map((activity, index) => (
                                            <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                                                <td className="p-3">{new Date(activity.paymentDate).toLocaleDateString()}</td>
                                                <td className="p-3">#{activity.paymentNumber}</td>
                                                <td className="p-3 text-right">${activity.amount.toFixed(2)}</td>
                                                <td className="p-3 text-right">{activity.method || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No payment activity recorded</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanDetails;
