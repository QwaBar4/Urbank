import React from 'react';
import { useForm } from 'react-hook-form';

const ProfileUpdateModal = ({ profileData, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: profileData
  });

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Profile</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit(onSave)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <input
                  {...register("firstName", { required: true })}
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                />
                {errors.firstName && <div className="invalid-feedback">Required field</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input
                  {...register("lastName", { required: true })}
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                />
                {errors.lastName && <div className="invalid-feedback">Required field</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Passport Series</label>
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

              <div className="mb-3">
                <label className="form-label">Passport Number</label>
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

              <div className="mb-3">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  {...register("dateOfBirth", { required: true })}
                  className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                />
                {errors.dateOfBirth && <div className="invalid-feedback">Required field</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateModal;
