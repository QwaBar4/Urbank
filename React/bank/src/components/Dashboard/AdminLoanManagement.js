import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoanDetails from './LoanDetails';
import logotype from '../../assets/logotype.jpg';

const AdminLoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLoan, setSelectedLoan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await api.getAllLoans();
                const loansData = Array.isArray(response) ? response : [];
                setLoans(loansData);
                setError('');
            } catch (err) {
                console.error('Error fetching loans:', err);
                setError(err.message || 'Failed to load loan applications');
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, []);

    const handleApprove = async (loanId) => {
        try {
            await api.approveLoan(loanId);
            setLoans(loans.map(loan => 
                loan.id === loanId ? { ...loan, status: 'APPROVED' } : loan
            ));
        } catch (err) {
            console.error('Error approving loan:', err);
            setError('Failed to approve loan');
        }
    };

    const handleReject = async (loanId) => {
        try {
            await api.rejectLoan(loanId);
            setLoans(loans.map(loan => 
                loan.id === loanId ? { ...loan, status: 'REJECTED' } : loan
            ));
        } catch (err) {
            console.error('Error rejecting loan:', err);
            setError('Failed to reject loan');
        }
    };

    return (
        <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
            <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10 z-0"
                style={{ backgroundImage: `url(${logotype})` }}
            />

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
                                Loan Management
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

                <div className="flex flex-wrap gap-2 mb-6">
                    <button 
                        onClick={() => navigate('/admin')} 
                        className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        Back to Admin Dashboard
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-6">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="bg-black bg-opacity-70 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Pending Loan Applications</h2>
                        
                        {loans.length === 0 ? (
                            <div className="text-center py-8">
                                <p>No pending loan applications</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left p-3">Loan number</th>
                                            <th className="text-left p-3">Amount</th>
                                            <th className="text-left p-3">Interest</th>
                                            <th className="text-left p-3">Term</th>
                                            <th className="text-left p-3">Status</th>
                                            <th className="text-left p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loans.map(loan => (
                                            <tr 
                                            key={loan.id}
                                            className="border-b border-gray-700 hover:bg-gray-900 cursor-pointer"
                                            onClick={() => setSelectedLoan(loan)}
                                            >
                                                <td className="p-3">{loan.id}</td>
                                                <td className="p-3">${loan.principal.toFixed(2)}</td>
                                                <td className="p-3">{loan.interestRate}%</td>
                                                <td className="p-3">{loan.termMonths} months</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        loan.status === 'PENDING' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                                                        loan.status === 'APPROVED' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                                                        'bg-red-500 bg-opacity-20 text-red-500'
                                                    }`}>
                                                        {loan.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {loan.status === 'PENDING' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApprove(loan.id)}
                                                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(loan.id)}
                                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : <div>N/A</div>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {selectedLoan && (
				<LoanDetails 
					loan={selectedLoan} 
					onClose={() => setSelectedLoan(null)} 
			/>
		)}
        </div>
    );
};

export default AdminLoanManagement;
