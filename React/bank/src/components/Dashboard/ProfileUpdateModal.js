import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import EmailUpdateModal from './EmailUpdateModal';

const ProfileUpdateModal = ({ profileData, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: profileData
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(profileData.email);

  const handleEmailUpdated = (newEmail) => {
    onSave({ ...profileData, email: newEmail });
    setCurrentEmail(newEmail);
    setShowEmailModal(false);
  };

  return (
    <>
      <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Profile</h5>
            </div>
            <form onSubmit={handleSubmit(onSave)}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">First Name: </label>
                  <input
                    {...register("firstName", { required: true })}
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  />
                  {errors.firstName && <div className="invalid-feedback">Required field</div>}
                </div>
				<p></p>
                <div className="mb-3">
                  <label className="form-label">Middle Name: </label>
                  <input
                    {...register("middleName")}
                    className={`form-control ${errors.middleName ? 'is-invalid' : ''}`}
                  />
                  {errors.middleName && <div className="invalid-feedback">Required field</div>}
                </div>
				<p></p>
                <div className="mb-3">
                  <label className="form-label">Last Name: </label>
                  <input
                    {...register("lastName", { required: true })}
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  />
                  {errors.lastName && <div className="invalid-feedback">Required field</div>}
                </div>
				<p></p>
				<div className="mb-3">
				  <label className="form-label">Email: </label>
				  <div className="input-group">
				    <input
				      type="text"
				      className="form-control"
				      value={currentEmail}
				      readOnly
				    />
				    <button 
				      type="button"
				      className="btn btn-outline-secondary border w-40 h-7 me-2 border-black me-2"
				      onClick={() => setShowEmailModal(true)}
				    >
				      Change Email
				    </button>
				  </div>
				</div>
				<p></p>
                <div className="mb-3">
                  <label className="form-label">Passport Series: </label>
                  <input
                    {...register("passportSeries", { 
                      required: true,
                      pattern: /^[A-Z0-9]{4}$/
                    })}
                    className={`form-control ${errors.passportSeries ? 'is-invalid' : ''}`}
                  />
                  {errors.passportSeries && (
                    <div className="invalid-feedback">
                      Must be 4 uppercase letters/numbers
                    </div>
                  )}
                </div>
				<p></p>
                <div className="mb-3">
                  <label className="form-label">Passport Number: </label>
                  <input
                    {...register("passportNumber", { 
                      required: true,
                      pattern: /^[A-Z0-9]{6}$/
                    })}
                    className={`form-control ${errors.passportNumber ? 'is-invalid' : ''}`}
                  />
                  {errors.passportNumber && (
                    <div className="invalid-feedback">
                      Must be 6 uppercase letters/numbers
                    </div>
                  )}
                </div>
				<p></p>
                <div className="mb-3">
                  <label className="form-label">Date of Birth: </label>
                  <input
                    type="date"
                    {...register("dateOfBirth", { required: true })}
                    className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                  />
                  {errors.dateOfBirth && <div className="invalid-feedback">Required field</div>}
                </div>
              </div>
			  <p></p>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary border w-20 h-7 me-2 border-black me-2" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary border w-40 h-7 me-2 border-black me-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <EmailUpdateModal
          currentEmail={currentEmail}
          onClose={() => setShowEmailModal(false)}
          onEmailUpdated={handleEmailUpdated}
        />
      )}
    </>
  );
};

export default ProfileUpdateModal;
