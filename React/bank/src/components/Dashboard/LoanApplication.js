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
		        // No accountId needed
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
        <div className="relative flex flex-col min-h-screen bg-black text-white p-4">
            <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10 z-0"
                style={{ backgroundImage: `url(${logotype})` }}
            />

            <div className="relative z-10 max-w-2xl mx-auto w-full">
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
                                Loan Application
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
                        onClick={() => navigate('/dashboard')} 
                        className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-black bg-opacity-70 p-6 rounded-lg mb-6">
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
                                    className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-white"
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
                                    className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-white"
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
                                    className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-white"
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
                                    className="w-full bg-black bg-opacity-50 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-white"
                                    min="1"
                                    max="360"
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Apply for Loan'}
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

                <div className="bg-black bg-opacity-70 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Loan Terms</h2>
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
