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
        <div className="bg-black bg-opacity-70 p-6 rounded-lg border border-gray-700">
            <div className="mb-6">
                <div className="flex space-x-1 mb-2">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-2 h-px bg-gray-400"></div>
                    ))}
                </div>
                
                <h2 className="text-xl font-bold mb-4">Account Balance</h2>
                
                <div className="mb-6">
                    <small className="text-gray-400 block mb-1">Account Number</small>
                    <h3 className="text-2xl font-mono">
                        {accountNumber ? formatAccountNumber(accountNumber) : '•••• ••••'}
                    </h3>
                </div>
                
                <div className="mb-8">
                    <small className="text-gray-400 block mb-1">Available Balance</small>
                    <h3 className="text-3xl font-bold">
                        ${balance !== undefined ? balance.toFixed(2) : '0.00'}
                    </h3>
                </div>
                
                <div className="flex space-x-1 mt-2">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-2 h-px bg-gray-400"></div>
                    ))}
                </div>
            </div>
            
			<div className="flex flex-col space-y-4">
				<button 
					onClick={handleDeposit}
					className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
				>
					Deposit Funds
				</button>
				<button 
					onClick={handleWithdraw}
					className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
				>
					Withdraw Funds
				</button>
				<button 
					onClick={refreshBalance}
					className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
				>
					Refresh Balance
				</button>
			</div>
        </div>
    );
};

export default BalanceCard;
