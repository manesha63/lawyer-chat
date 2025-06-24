'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebar';
import DarkModeWrapper from '@/components/DarkModeWrapper';

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const urlError = searchParams.get('error');
  const { isDarkMode } = useSidebarStore();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [callbackUrl, router]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email domain
    if (!email.endsWith('@reichmanjorgensen.com')) {
      setError('Only Reichman Jorgensen firm employees can sign in. Please use your @reichmanjorgensen.com email address.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please check your details and try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <>
      <DarkModeWrapper />
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1b1e]' : 'bg-gray-50'} flex items-center justify-center p-4`}>
        <div className="max-w-lg w-full">
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <img 
              src="/logo.png" 
              alt="AI Legal Logo" 
              className="mx-auto mb-4 h-20 w-20 object-contain"
            />
            <h1 className="text-4xl font-bold" style={{ color: isDarkMode ? '#ffffff' : '#004A84' }}>AI Legal</h1>
          </div>

          {/* Sign In Card */}
          <div className={`${isDarkMode ? 'bg-[#25262b] border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-10`}>
            <h2 className={`text-2xl font-semibold text-center mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Sign In
            </h2>

            {/* Error Message */}
            {(error || urlError) && (
              <div className={`mb-6 p-4 rounded-lg ${
                isDarkMode 
                  ? 'bg-red-900/20 border border-red-800' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm text-center ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {error || getErrorMessage(urlError)}
                </p>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jsmith@reichmanjorgensen.com"
                  required
                  autoComplete="email"
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-[#1a1b1e] border border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 text-gray-900 placeholder-gray-600'
                  }`}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-[#1a1b1e] border border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'border border-gray-300 text-gray-900 placeholder-gray-600'
                  }`}
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  style={{
                    backgroundColor: isDarkMode ? 'transparent' : '#C7A562',
                    border: isDarkMode ? '2px solid #d1d1d1' : 'none',
                    color: isDarkMode ? '#d1d1d1' : '#004A84'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#B59552';
                      else (e.target as HTMLButtonElement).style.backgroundColor = '#404147';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#C7A562';
                      else (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

          </div>

          {/* Guest Access */}
          <div className="mt-6">
            <button
              onClick={() => router.push(callbackUrl)}
              className="w-full px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              style={{
                backgroundColor: isDarkMode ? 'transparent' : '#E1C88E',
                border: isDarkMode ? '2px solid #9CA3AF' : 'none',
                color: isDarkMode ? '#9CA3AF' : '#004A84'
              }}
              onMouseEnter={(e) => {
                if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#C8A665';
                else (e.target as HTMLButtonElement).style.backgroundColor = '#404147';
              }}
              onMouseLeave={(e) => {
                if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#E1C88E';
                else (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              Continue Without Signing In
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignIn() {
  const { isDarkMode } = useSidebarStore();
  
  return (
    <>
      <DarkModeWrapper />
      <Suspense fallback={
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1b1e]' : 'bg-gray-50'} flex items-center justify-center`}>
          <div className={`w-8 h-8 border-2 ${isDarkMode ? 'border-gray-400' : 'border-blue-600'} border-t-transparent rounded-full animate-spin`}></div>
        </div>
      }>
        <SignInContent />
      </Suspense>
    </>
  );
}