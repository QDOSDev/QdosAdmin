import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Animation from './Animation';
import { Button, message } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function OtpVerification() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const clientEmail = queryParams.get('clientEmail');
    const expire = queryParams.get('expire');

    const [timer, setTimer] = useState(120);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return; 

        const newOtp = [...otp];
        newOtp[index] = value;

        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            // change from 3 to 5
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();

        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs.current[5]?.focus(); 
        }
    };

    const resendOtp = async () => {
        setIsLoading(true);
        try {
            // Implement your resend OTP logic here
            // const response = await axios.post(...)

            // Reset timer
            setTimer(120);
            setError('');
        } catch (error) {
            console.error('Error resending OTP:', error);
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        if (!clientEmail) {
            setError('Missing email information. Please login again.');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = import.meta.env.VITE_API_LIVEHOST;

            const response = await axios.post(`${endpoint}/v1/auth/verification`, {
                email: clientEmail,
                verificationCode: otpValue,
            });

            if (response.data.success === 1) {
                message.success('OTP verified successfully!');

                Cookies.set('token', response.data.token, { expires: 7 });
                 localStorage.setItem('userRole', response.data.user.role);
                 localStorage.setItem('userId', response.data.user.userId)
                const { role } = response.data.user;

                if (role === 'admin') {
                    navigate('/companylist');
                } else if (role === 'gym_owner') {
                    navigate('/gym_ownerGym');
                } else {
                    navigate('/');
                }
            } else {
                setError(response.data.message || 'Verification failed');
                message.error(response.data.message || 'Invalid OTP');
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            setError('Verification failed. Please try again.');
            message.error('Something went wrong. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#1a2332] px-4 py-6 sm:px-8 overflow-hidden">
            <Animation />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E2AD17]"></div>
                </div>
            )}

            <div className="relative w-full max-w-[480px] h-auto mx-2 sm:mx-4 rounded-xl overflow-hidden shadow-lg">
                <div className="relative flex flex-col justify-center rounded-xl bg-black/80 backdrop-blur-sm px-6 py-8 sm:w-full h-full mx-auto shadow-2xl z-10">
                    <div className="mx-auto w-full max-w-[380px] sm:max-w-[420px]">
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <img src="/assets/images/qdos-mark.svg" alt="Qdos" className="h-14 w-14 rounded-full" />
                            </div>
                            <h1 className="text-2xl font-extrabold uppercase !leading-snug text-white md:text-3xl">
                                OTP <span className="text-[#E2AD17]">VERIFICATION</span>
                            </h1>
                            <p className="text-sm font-bold leading-normal text-gray-300">Enter the 6-digit code sent to your email</p>
                        </div>

                        <form className="space-y-5 text-white" onSubmit={verifyOtp}>
                            {error && <p className="text-red-500 text-sm mt-2 text-center bg-black/50 p-2 rounded-md">{error}</p>}

                            <div className="mb-6">
                                <label className="text-sm font-medium block mb-3 text-center">Verification Code</label>
                                <div className="flex justify-center gap-3 sm:gap-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold border border-gray-700 rounded-md bg-gray-900/80 focus:border-red-600 focus:ring-red-600 transition-all"
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-400 mb-4">
                                    Time remaining: <span className="font-bold text-red-500">{formatTime(timer)}</span>
                                </p>
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    disabled={isLoading || timer > 0}
                                    className={`text-sm ${timer > 0 ? 'text-gray-500' : 'text-red-500 hover:text-red-400'} font-bold underline transition`}
                                >
                                    {timer > 0 ? 'Resend OTP' : 'Resend OTP'}
                                </button>
                            </div>

                            <Button
                                disabled={isLoading || otp.join('').length !== 6}
                                type="text"
                                onClick={verifyOtp}
                                style={{ color: 'white' }}
                                className="!mt-6 w-full border-0 uppercase shadow-xl bg-gradient-to-r from-red-700 to-red-500 text-white hover:from-red-600 hover:to-red-400 active:from-red-800 active:to-red-600 transition-all font-bold py-6 h-auto"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        VERIFYING...
                                    </div>
                                ) : (
                                    'VERIFY OTP'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <p className="text-xs text-center text-gray-400">💪 Train hard. Recover smart. Repeat. 💪</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
