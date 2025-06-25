import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Mail, Key, Loader2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { BrowserProvider } from 'ethers';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [currentOTP, setCurrentOTP] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual public key
  }, []);

  const sendOTP = async (email: string, otp: string) => {
    try {
      const templateParams = {
        to_email: email,
        otp: otp,
        // Add any other template variables you have in your EmailJS template
      };

      const response = await emailjs.send(
        "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
        "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
        templateParams
      );

      if (response.status !== 200) {
        throw new Error('Failed to send OTP email');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      throw new Error('Failed to send OTP email. Please try again.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentOTP(generatedOTP);
      
      await sendOTP(email, generatedOTP);
      setShowOtpInput(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
      setShowOtpInput(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (otp === currentOTP) {
        navigate('/dashboard');
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        // Open MetaMask website in a new tab
        window.open('https://metamask.io/download/', '_blank');
        throw new Error('Please install MetaMask to continue. A new tab has been opened for you to download it.');
      }

      // Request account access
      const provider = new BrowserProvider(window.ethereum);
      
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (!accounts || accounts.length === 0) {
          throw new Error('Please connect your wallet to continue.');
        }

        const address = accounts[0];
        setWalletAddress(address);
        
        // Navigate to dashboard after successful connection
        navigate('/dashboard');
      } catch (err: any) {
        // Handle user rejection
        if (err.code === 4001) {
          throw new Error('Please connect your wallet to continue.');
        }
        throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Choose your preferred login method</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleWalletLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Wallet className="h-5 w-5" />
                  {typeof window.ethereum === 'undefined' ? 'Install MetaMask' : 'Connect Ethereum Wallet'}
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
              </div>
            </div>

            {!showOtpInput ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 focus:border-blue-500 rounded-lg outline-none transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      Send OTP
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 focus:border-blue-500 rounded-lg outline-none transition-colors"
                      placeholder="Enter OTP sent to your email"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Key className="h-5 w-5" />
                      Verify OTP
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have a wallet?{' '}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create one now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;