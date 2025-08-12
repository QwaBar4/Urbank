import React, { useState, useEffect } from 'react';

const StatementOptionsModal = ({ isOpen, onClose, onDownload }) => {
  const [theme, setTheme] = useState('dark');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload('light');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
      isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-gray-800 p-6 rounded-xl max-w-md w-full border border-gray-700 transition-all duration-300 ${
        isVisible && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Statement download</h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
       

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-transparent text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : 'Download Statement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatementOptionsModal;
