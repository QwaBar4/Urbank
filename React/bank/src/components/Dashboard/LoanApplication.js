import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import logotype from '../../assets/logo_purple.png';

const LoanApplication = () => {
    const [formData, setFormData] = useState({
        principal: '',
        interestRate: '',
        startDate: '',
        termMonths: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const loanData = {
                principal: parseFloat(formData.principal),
                interestRate: parseFloat(formData.interestRate),
                startDate: formData.startDate,
                termMonths: parseInt(formData.termMonths)
            };

            await api.applyForLoan(loanData);
            setSuccess('Loan application submitted successfully!');
            setFormData({
                principal: '',
                interestRate: '',
                startDate: '',
                termMonths: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit loan application');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (path) => {
        setPageLoading(true);
        setTimeout(() => {
            navigate(path);
            setPageLoading(false);
        }, 150);
    };

    const pageVariants = {
        initial: {
            opacity: 0,
            x: 100,
        },
        in: {
            opacity: 1,
            x: 0,
        },
        out: {
            opacity: 0,
            x: -100,
        }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.3
    };

    return (
        <motion.div 
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen bg-gray-900 text-white p-4 pb-20"
        >
            {/* Loading overlay */}
            <AnimatePresence>
                {pageLoading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            <div className="relative z-10 max-w-2xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="pt-6 pb-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-medium">Loan Application</h2>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigation('/dashboard')}
                            className="flex items-center text-purple-400 hover:text-purple-300 mb-4"
                        >
                            <div className="bg-purple-600 bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </div>
                            <span className="text-sm text-purple-400 hover:text-purple-300">Back to Dashboard</span>
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-xl p-6 mb-6"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="block text-sm font-medium mb-1" htmlFor="principal">
                                    Loan Amount ($)
                                </label>
                                <input
                                    type="number"
                                    id="principal"
                                    name="principal"
                                    value={formData.principal}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                    min="100"
                                    step="100"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium mb-1" htmlFor="interestRate">
                                    Interest Rate (%)
                                </label>
                                <input
                                    type="number"
                                    id="interestRate"
                                    name="interestRate"
                                    value={formData.interestRate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                    min="1"
                                    max="30"
                                    step="0.1"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium mb-1" htmlFor="startDate">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium mb-1" htmlFor="termMonths">
                                    Loan Term (Months)
                                </label>
                                <input
                                    type="number"
                                    id="termMonths"
                                    name="termMonths"
                                    value={formData.termMonths}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                    min="1"
                                    max="360"
                                    required
                                />
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="pt-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <motion.svg 
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="-ml-1 mr-2 h-4 w-4 text-white" 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                fill="none" 
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </motion.svg>
                                            Processing...
                                        </>
                                    ) : 'Apply for Loan'}
                                </motion.button>
                            </motion.div>
                        </div>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500"
                            >
                                <p className="text-red-500">{error}</p>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 bg-green-500 bg-opacity-20 p-3 rounded-lg border border-green-500"
                            >
                                <p className="text-green-500">{success}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gray-800 rounded-xl p-6"
                >
                    <h2 className="text-lg font-bold mb-4">Loan Terms</h2>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="space-y-2 text-gray-300"
                    >
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 }}
                        >
                            • Minimum loan amount: $100
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1 }}
                        >
                            • Maximum loan term: 30 years (360 months)
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2 }}
                        >
                            • Interest rates start from 1%
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.3 }}
                        >
                            • Early repayment is allowed without penalties
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoanApplication;
