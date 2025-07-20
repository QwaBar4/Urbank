import { useNavigate } from 'react-router-dom';
import { formatAccountNumber } from '../../services/api';

const BalanceCard = ({ accountNumber, balance, refreshBalance }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold">Account Balance</h3>
                <button 
                    onClick={refreshBalance}
                    className="text-purple-400 hover:text-purple-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
            
            <div className="mb-8">
                <p className="text-sm text-gray-400 mb-1">Account Number</p>
                <p className="text-xl font-mono text-white">
                    {accountNumber ? formatAccountNumber(accountNumber) : '•••• ••••'}
                </p>
            </div>
            
            <div className="mb-8">
                <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-white">
                    ${balance !== undefined ? balance.toFixed(2) : '0.00'}
                </p>
            </div>
           
        </div>
    );
};

export default BalanceCard;
