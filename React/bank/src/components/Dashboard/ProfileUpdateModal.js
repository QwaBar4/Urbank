import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import EmailUpdateModal from './EmailUpdateModal';

const ProfileUpdateModal = ({ profileData, onClose, onSave }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
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
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full border border-gray-700"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">Update Profile</h3>
                            <button 
                                onClick={onClose}
                                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500 bg-opacity-20 p-3 rounded-lg border border-red-500 mb-4"
                            >
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSave)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-2 font-medium">First Name</label>
                                <input
                                    {...register("firstName", { required: true })}
                                    className={`w-full bg-gray-700 border ${errors.firstName ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">Required field</p>}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Middle Name</label>
                                <input
                                    {...register("middleName")}
                                    className={`w-full bg-gray-700 border ${errors.middleName ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                                {errors.middleName && <p className="text-red-500 text-sm mt-1">Required field</p>}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Last Name</label>
                                <input
                                    {...register("lastName", { required: true })}
                                    className={`w-full bg-gray-700 border ${errors.lastName ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">Required field</p>}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Email</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        className="flex bg-gray-700 border border-gray-600 rounded-l-lg px-4 py-2 w-60"
                                        value={currentEmail}
                                        readOnly
                                    />
                                    <button 
                                        type="button"
                                        className="bg-gray-700 border border-l-0 border-gray-600 rounded-r-lg px-1 hover:bg-gray-600 transition-colors"
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
                                    className={`w-full bg-gray-700 border ${errors.passportSeries ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
                                    className={`w-full bg-gray-700 border ${errors.passportNumber ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
                                    className={`w-full bg-gray-700 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">Required field</p>}
                            </div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex justify-end gap-2 mt-4"
                            >
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-transparent text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </motion.div>
                        </form>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

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
