import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logotype from '../../assets/logotype.jpg';

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

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
            <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10 z-0"
                style={{ backgroundImage: `url(${logotype})` }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
                <div className="pt-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-medium">Loan Application</h2>
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
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="principal">
                                    Loan Amount ($)
                                </label>
                                <input
                                    type="number"
                                    id="principal"
                                    name="principal"
                                    value={formData.principal}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    min="100"
                                    step="100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="interestRate">
                                    Interest Rate (%)
                                </label>
                                <input
                                    type="number"
                                    id="interestRate"
                                    name="interestRate"
                                    value={formData.interestRate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    min="1"
                                    max="30"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="startDate">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="termMonths">
                                    Loan Term (Months)
                                </label>
                                <input
                                    type="number"
                                    id="termMonths"
                                    name="termMonths"
                                    value={formData.termMonths}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    min="1"
                                    max="360"
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : 'Apply for Loan'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 bg-green-500 bg-opacity-20 p-3 rounded-lg border border-green-500">
                            <p className="text-green-500">{success}</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4">Loan Terms</h2>
                    <div className="space-y-2 text-gray-300">
                        <p>• Minimum loan amount: $100</p>
                        <p>• Maximum loan term: 30 years (360 months)</p>
                        <p>• Interest rates start from 1%</p>
                        <p>• Early repayment is allowed without penalties</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanApplication;
