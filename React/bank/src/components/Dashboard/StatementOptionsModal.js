import React from 'react';

const StatementOptionsModal = ({ isOpen, onClose, onDownload }) => {
  const [theme, setTheme] = React.useState('dark');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-md w-full border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Statement Options</h3>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select Theme</label>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded border ${
                theme === 'dark' 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white border-gray-500 hover:border-white'
              }`}
              onClick={() => setTheme('dark')}
            >
              Dark Theme
            </button>
            <button
              className={`px-4 py-2 rounded border ${
                theme === 'light' 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white border-gray-500 hover:border-white'
              }`}
              onClick={() => setTheme('light')}
            >
              Light Theme
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 font-medium"
            onClick={() => onDownload(theme)}
          >
            Download Statement
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatementOptionsModal;
