import { useNavigate } from 'react-router-dom';
import { formatAccountNumber } from '../../services/api';

const BalanceCard = ({ accountNumber, balance, refreshBalance }) => {
    const navigate = useNavigate();

    const handleDeposit = () => {
        navigate('/deposit');
    };

    const handleWithdraw = () => {
        navigate('/withdraw');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Balance</h2>
            
            <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Account Number</p>
                <p className="text-xl font-mono text-gray-800">
                    {accountNumber ? formatAccountNumber(accountNumber) : '•••• ••••'}
                </p>
            </div>
            
            <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-gray-800">
                    ${balance !== undefined ? balance.toFixed(2) : '0.00'}
                </p>
            </div>
            
            <div className="space-y-3">
                <button 
                    onClick={handleDeposit}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Deposit Funds
                </button>
                <button 
                    onClick={handleWithdraw}
                    className="w-full py-2 px-4 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                    Withdraw Funds
                </button>
                <button 
                    onClick={refreshBalance}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                >
                    Refresh Balance
                </button>
            </div>
        </div>
    );
};

export default BalanceCard;
