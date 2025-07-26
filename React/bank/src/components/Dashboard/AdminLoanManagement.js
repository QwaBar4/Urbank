import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import LoanDetails from './LoanDetails';
import logotype from '../../assets/logo_purple.png';

const AdminLoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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

	const pageVariants = {
	  initial: { opacity: 0, y: 20 },
	  in: { opacity: 1, y: 0 },
	  out: { opacity: 0, y: -20 }
	};	
	
    const refreshLoans = async () => {
      try {
        const response = await api.getAllLoans();
        const loansData = Array.isArray(response) ? response : [];
        setLoans(loansData);
        setError('');
      } catch (err) {
        console.error('Error refreshing loans:', err);
        setError(err.message || 'Failed to refresh loans');
      }
    };
    
    const handleLogout = async () => {
      try {
        await api.logout();
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
        setError('Failed to log out: ' + error.message);
      }
    };

	return (
	  <div className="min-h-screen bg-gray-900 text-white">
		<AnimatePresence>
		  <motion.div
		    initial="initial"
		    animate="in"
		    exit="out"
		    variants={pageVariants}
		    transition={{ duration: 0.3 }}
		  >
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin')}>
                            <img src={logotype} alt="Logo" className="h-8" />
                            <span className="font-bold text-lg hover:text-purple-300 transition-colors">Urbank Admin</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button 
                                    className="flex items-center space-x-2"
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                        A
                                    </div>
                                </button>
                                
                                {showProfileDropdown && (
                                    <div 
                                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-30"
                                        onMouseLeave={() => setShowProfileDropdown(false)}
                                    >
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    navigate('/admin');
                                                    setShowProfileDropdown(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                            >
                                                Admin Dashboard
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    navigate('/dashboard');
                                                    setShowProfileDropdown(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                            >
                                                User Dashboard
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    handleLogout();
                                                    setShowProfileDropdown(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 pb-20">
                <div className="pt-6 pb-4">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Loan Management</h1>
                        <button 
                            onClick={() => navigate('/admin')} 
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
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
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
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
                                                className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
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
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprove(loan.id);
                                                                  }}
                                                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                                                                >
                                                                  Approve
                                                                </button>
                                                                <button
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleReject(loan.id);
                                                                  }}
                                                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
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
            </main>
		    <AnimatePresence>
		      {selectedLoan && (
		        <motion.div
		          initial={{ opacity: 0 }}
		          animate={{ opacity: 1 }}
		          exit={{ opacity: 0 }}
		          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
		        >
		          <motion.div
		            initial={{ y: 20, opacity: 0 }}
		            animate={{ y: 0, opacity: 1 }}
		            exit={{ y: -20, opacity: 0 }}
		            className="bg-gray-800 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
		          >
            {selectedLoan && (
              <LoanDetails 
                loan={selectedLoan} 
                onClose={() => setSelectedLoan(null)} 
                refreshLoans={refreshLoans}
              />
            )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  </div>
);
};

export default AdminLoanManagement;
