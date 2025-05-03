import React from 'react';
import { useForm } from 'react-hook-form';

const ProfileModal = ({ user, onClose }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            await api.updateProfile(data);
            onClose();
        } catch (error) {
            console.error('Profile update failed:', error);
        }
    };

    return (
        <div className="modal">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">
                    {/* First Name */}
                    <div className="mb-3">
                        <label>First Name</label>
                        <input
                            {...register("firstName", { required: true })}
                            defaultValue={user?.firstName}
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="mb-3">
                        <label>Last Name</label>
                        <input
                            {...register("lastName", { required: true })}
                            defaultValue={user?.lastName}
                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        />
                    </div>

                    {/* Passport Data */}
                    <div className="row">
                        <div className="col-md-6">
                            <label>Passport Series</label>
                            <input
                                {...register("passportSeries", { 
                                    required: true,
                                    pattern: /^\d{4}$/
                                })}
                                type="password"
                                className={`form-control ${errors.passportSeries ? 'is-invalid' : ''}`}
                            />
                        </div>
                        <div className="col-md-6">
                            <label>Passport Number</label>
                            <input
                                {...register("passportNumber", { 
                                    required: true,
                                    pattern: /^\d{6}$/
                                })}
                                type="password"
                                className={`form-control ${errors.passportNumber ? 'is-invalid' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="mb-3">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            {...register("dateOfBirth", { required: true })}
                            className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    );
};
