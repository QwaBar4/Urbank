import React from 'react';
import { formatAccountNumber } from '../../services/api';

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getAmountDisplay = () => {
    const amount = Math.abs(transaction.amount).toFixed(2);
    
    if (transaction.type === 'TRANSFER') {
      if (transaction.targetAccountOwner === transaction.sourceAccountOwner) {
        return <span className="text-green-500 font-bold">{amount}$</span>;
      } else if (transaction.sourceAccountOwner !== transaction.targetAccountOwner) {
        return <span className="text-red-500 font-bold">-{amount}$</span>;
      } else {
        return <span className="text-green-500 font-bold">+{amount}$</span>;
      }
    } else {
      return <span className="text-green-500 font-bold">{amount}$</span>;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 overflow-y-auto">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h3 className="text-xl font-bold">Transaction Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Transaction ID</p>
              <p className="font-medium">{transaction.id}</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Date & Time</p>
              <p className="font-medium">
                {formatDate(transaction.timestamp)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Type</p>
              <p className="font-medium">{transaction.type}</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <p className={`font-medium ${
                transaction.status === 'COMPLETED' ? 'text-green-500' : 
                transaction.status === 'FAILED' ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {transaction.status}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Amount</p>
            <p className="text-xl">
              {getAmountDisplay()}
            </p>
          </div>
          
          {transaction.type === 'TRANSFER' && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-medium text-gray-300 mb-3">Transfer Details</h4>
              <div className="space-y-4">
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">From Account</p>
                  <p className="font-medium">
                    {transaction.sourceAccountOwner === 'Unknown' ? 'Anonymous' : transaction.targetAccountOwner} ({formatAccountNumber(transaction.targetAccountNumber)})
                  </p>
                  {transaction.sourceAccountOwner === 'Unknown' && 
                    <p className="text-xs text-red-500 mt-1">This account was deleted</p>
                  }
                </div>
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">To Account</p>
                  <p className="font-medium">
                    {transaction.targetAccountOwner === 'Unknown' ? 'Anonymous' : transaction.targetAccountOwner} ({formatAccountNumber(transaction.targetAccountNumber)})
                  </p>
                  {transaction.targetAccountOwner === 'Unknown' && 
                    <p className="text-xs text-red-500 mt-1">This account was deleted</p>
                  }
                </div>
              </div>
            </div>
          )}
          
          {transaction.description && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-1">Description</p>
              <p className="font-medium">{transaction.description}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
