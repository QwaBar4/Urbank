import React from 'react';

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getAmountDisplay = () => {
    const amount = Math.abs(transaction.amount).toFixed(2);
    const isOutgoing = transaction.sourceAccountNumber === transaction.userAccountNumber;
    
    if (transaction.type === 'DEPOSIT') {
      return <span className="text-success">+{amount}$</span>;
    } else if (transaction.type === 'WITHDRAWAL') {
      return <span className="text-danger">-{amount}$</span>;
    } else if (isOutgoing) {
      return <span className="text-danger">-{amount}$</span>;
    } else {
      return <span className="text-success">+{amount}$</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Transaction Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-medium">{transaction.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-medium">
                {formatDate(transaction.timestamp)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{transaction.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-medium ${
                transaction.status === 'COMPLETED' ? 'text-green-600' : 
                transaction.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {transaction.status}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-xl font-bold">
              {getAmountDisplay()}
            </p>
          </div>
          
          {transaction.type === 'TRANSFER' && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Transfer Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">From Account</p>
                  <p className="font-medium">
                    {transaction.sourceAccountOwner} ({transaction.sourceAccountNumber})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To Account</p>
                  <p className="font-medium">
                    {transaction.targetAccountOwner} ({transaction.targetAccountNumber})
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {transaction.description && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{transaction.description}</p>
            </div>
          )}
          
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Reference Number</p>
            <p className="font-mono text-sm">{transaction.reference}</p>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
