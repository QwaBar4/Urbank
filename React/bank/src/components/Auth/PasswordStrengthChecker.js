import React from 'react';
import { motion } from 'framer-motion';

const PasswordStrengthChecker = ({ password }) => {
    const checks = [
        {
            label: 'At least 8 characters',
            test: (pwd) => pwd.length >= 8,
            id: 'length'
        },
        {
            label: 'Contains uppercase letter',
            test: (pwd) => /[A-Z]/.test(pwd),
            id: 'uppercase'
        },
        {
            label: 'Contains lowercase letter',
            test: (pwd) => /[a-z]/.test(pwd),
            id: 'lowercase'
        },
        {
            label: 'Contains number',
            test: (pwd) => /\d/.test(pwd),
            id: 'number'
        },
        {
            label: 'Contains special character',
            test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
            id: 'special'
        },
        {
            label: 'No common patterns',
            test: (pwd) => {
                const common = ['123456', 'password', 'qwerty', 'abc123', '111111'];
                return !common.some(pattern => pwd.toLowerCase().includes(pattern));
            },
            id: 'common'
        }
    ];

    const passedChecks = checks.filter(check => check.test(password));
    const strength = passedChecks.length;

    const getStrengthColor = () => {
        if (strength <= 2) return 'text-red-500';
        if (strength <= 4) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getStrengthText = () => {
        if (strength <= 2) return 'Weak';
        if (strength <= 4) return 'Medium';
        return 'Strong';
    };

    const getStrengthWidth = () => {
        return `${(strength / checks.length) * 100}%`;
    };

    if (!password) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-gray-700 rounded-lg border border-gray-600"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Password Strength:</span>
                <span className={`text-sm font-medium ${getStrengthColor()}`}>
                    {getStrengthText()}
                </span>
            </div>
            
            <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: getStrengthWidth() }}
                    transition={{ duration: 0.3 }}
                    className={`h-2 rounded-full ${
                        strength <= 2 ? 'bg-red-500' : 
                        strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                />
            </div>

            <div className="space-y-1">
                {checks.map((check) => (
                    <div key={check.id} className="flex items-center text-xs">
                        <span className={`mr-2 ${
                            check.test(password) ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {check.test(password) ? '✓' : '✗'}
                        </span>
                        <span className={`${
                            check.test(password) ? 'text-green-400' : 'text-gray-400'
                        }`}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default PasswordStrengthChecker;
