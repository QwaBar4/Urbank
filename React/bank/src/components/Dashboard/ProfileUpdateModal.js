import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import EmailUpdateModal from './EmailUpdateModal';  

const ProfileUpdateModal = ({ profileData, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: profileData
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [error, setError] = useState('');
  const [currentEmail, setCurrentEmail] = useState(profileData.email);

  const handleEmailUpdated = (newEmail) => {
    onSave({ ...profileData, email: newEmail });
    setCurrentEmail(newEmail);
    setShowEmailModal(false);
  };

  if (profileData.firstName === null || profileData.lastName === null || profileData.middleName === null || 
      profileData.passportSeries === null || profileData.passportNumber === null || profileData.dateOfBirth === null) {
    if (error === '') {
      setError('You should update all user details');
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-black bg-opacity-90 p-6 rounded-lg max-w-2xl w-full border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Update Profile</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {error && (
            <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSave)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">First Name</label>
                <input
                  {...register("firstName", { required: true })}
                  className={`w-full bg-white bg-opacity-10 border ${errors.firstName ? 'border-red-500' : 'border-gray-500'} rounded px-3 py-2`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">Required field</p>}
              </div>

              <div>
                <label className="block mb-2 font-medium">Middle Name</label>
                <input
                  {...register("middleName")}
                  className={`w-full bg-white bg-opacity-10 border ${errors.middleName ? 'border-red-500' : 'border-gray-500'} rounded px-3 py-2`}
                />
                {errors.middleName && <p className="text-red-500 text-sm mt-1">Required field</p>}
              </div>

              <div>
                <label className="block mb-2 font-medium">Last Name</label>
                <input
                  {...register("lastName", { required: true })}
                  className={`w-full bg-white bg-opacity-10 border ${errors.lastName ? 'border-red-500' : 'border-gray-500'} rounded px-3 py-2`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">Required field</p>}
              </div>

              <div>
                <label className="block mb-2 font-medium">Email</label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 bg-white bg-opacity-10 border border-gray-500 rounded-l px-3 py-2"
                    value={currentEmail}
                    readOnly
                  />
                  <button 
                    type="button"
                    className="bg-white bg-opacity-10 border border-l-0 border-gray-500 rounded-r px-3 hover:bg-opacity-20 transition-colors"
                    onClick={() => setShowEmailModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Passport Series</label>
                <input
                  {...register("passportSeries", { 
                    required: true,
                    pattern: /^[A-Z0-9]{4}$/
                  })}
                  className={`w-full bg-white bg-opacity-10 border ${errors.passportSeries ? 'border-red-500' : 'border-gray-500'} rounded px-3 py-2`}
                />
                {errors.passportSeries && (
                  <p className="text-red-500 text-sm mt-1">Must be 4 uppercase letters/numbers</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">Passport Number</label>
                <input
                  {...register("passportNumber", { 
                    required: true,
                    pattern: /^[A-Z0-9]{6}$/
                  })}
                  className={`w-full bg-white bg-opacity-10 border ${errors.passportNumber ? 'border-red-500' : 'border-gray-500'} rounded px-3 py-2`}
                />
                {errors.passportNumber && (
                  <p className="text-red-500 text-sm mt-1">Must be 6 uppercase letters/numbers</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">Date of Birth</label>
                <input
                  type="date"
                  {...register("dateOfBirth", { required: true })}
                  className={`w-full bg-white bg-opacity-10 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-500'} rounded px-3 py-2`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">Required field</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
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
