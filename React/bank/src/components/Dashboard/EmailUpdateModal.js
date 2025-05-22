import React, { useState } from 'react';
import { getJwtToken } from '../../utils/auth'

const EmailUpdateModal = ({ currentEmail, onClose, onEmailUpdated }) => {
  const [step, setStep] = useState(1);
  const [oldEmailCode, setOldEmailCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmailCode, setNewEmailCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOldEmailCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/auth/email-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail }),
      });

      if (!response.ok) throw new Error('Failed to send verification code');
      setStep(2);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOldEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail, code: oldEmailCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      setStep(3);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNewEmailCode = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) throw new Error('Failed to send verification code');
      setStep(4);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

	const handleVerifyNewEmail = async () => {
	  setIsLoading(true);
	  try {
		const token = getJwtToken();
		if (!token) {
		  throw new Error('Authentication token not found. Please log in again.');
		}

		const verifyResponse = await fetch('/auth/verify-code', {
		  method: 'POST',
		  headers: { 
		    'Content-Type': 'application/json',
		    'Authorization': `Bearer ${token}`
		  },
		  body: JSON.stringify({ 
		    email: newEmail, 
		    code: newEmailCode 
		  }),
		});

		if (!verifyResponse.ok) {
		  const errorData = await verifyResponse.json();
		  throw new Error(errorData.message || 'Verification failed');
		}

      const updateResponse = await fetch('/api/user/update-email', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getJwtToken()}`
        },
        body: JSON.stringify({ 
          oldEmail: currentEmail,
          newEmail: newEmail,
          verificationCode: newEmailCode 
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Failed to update email');
      }

      onEmailUpdated(newEmail);
      onClose();
	  } catch (error) {
		setError(error.message);
	  } finally {
		setIsLoading(false);
	  }
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Email Address</h5>
          </div>
          
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="modal-body">
            {step === 1 && (
              <>
                <p>We'll send a verification code to your current email: <strong>{currentEmail}</strong></p>
                <button 
                  onClick={handleSendOldEmailCode} 
                  className="btn btn-primary mt-2 border w-60 h-7 me-2 border-black me-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p>Enter the 6-digit code sent to {currentEmail}</p>
                <input
                  type="text"
                  value={oldEmailCode}
                  onChange={(e) => setOldEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-control mb-3"
                  placeholder="Verification code"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleVerifyOldEmail} 
                  className="btn btn-primary mt-2 border w-40 h-7 me-2 border-black me-2"
                  disabled={oldEmailCode.length !== 6 || isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <p>Enter your new email address:</p>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-control mb-3"
                  placeholder="New email address"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSendNewEmailCode} 
                  className="btn btn-primary mt-2 border w-80 h-7 me-2 border-black me-2"
                  disabled={!newEmail || isLoading}
                >
                  {isLoading ? 'Sending code...' : 'Validate email'}
                </button>
              </>
            )}

            {step === 4 && (
              <>
                <p>Enter the 6-digit code sent to <strong>{newEmail}</strong></p>
                <input
                  type="text"
                  value={newEmailCode}
                  onChange={(e) => setNewEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-control mb-3"
                  placeholder="Verification code"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleVerifyNewEmail} 
                  className="btn btn-primary mt-2 border w-80 h-7 me-2 border-black me-2"
                  disabled={newEmailCode.length !== 6 || isLoading}
                >
                  {isLoading ? 'Updating...' : 'Verify and Update Email'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailUpdateModal;
