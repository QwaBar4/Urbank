import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SimpleCaptcha = ({ onVerify, isDisabled }) => {
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isValid, setIsValid] = useState(false);
    const canvasRef = useRef(null);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#374151';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(156, 163, 175, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        // Draw text
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < text.length; i++) {
            ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 70%)`;
            ctx.save();
            ctx.translate(30 + i * 25, canvas.height / 2);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }

        // Add noise dots
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(156, 163, 175, ${Math.random() * 0.3})`;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                2, 2
            );
        }
    };

    const refreshCaptcha = () => {
        const newText = generateCaptcha();
        setCaptchaText(newText);
        setUserInput('');
        setIsValid(false);
        onVerify(false);
    };

    useEffect(() => {
        refreshCaptcha();
    }, []);

    useEffect(() => {
        if (captchaText) {
            drawCaptcha(captchaText);
        }
    }, [captchaText]);

    useEffect(() => {
        const valid = userInput.toLowerCase() === captchaText.toLowerCase() && userInput.length > 0;
        setIsValid(valid);
        onVerify(valid);
    }, [userInput, captchaText, onVerify]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            <label className="block text-sm font-medium text-gray-300">
                Verify you're human
            </label>
            
            <div className="flex items-center space-x-3">
                <canvas
                    ref={canvasRef}
                    width={180}
                    height={60}
                    className="border border-gray-600 rounded-lg bg-gray-700"
                />
                <button
                    type="button"
                    onClick={refreshCaptcha}
                    disabled={isDisabled}
                    className="p-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh captcha"
                >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Enter the text above"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        userInput.length > 0 
                            ? isValid 
                                ? 'border-green-500 focus:ring-green-500' 
                                : 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-purple-500'
                    }`}
                />
                {userInput.length > 0 && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isValid ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {isValid ? '✓' : '✗'}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SimpleCaptcha;
