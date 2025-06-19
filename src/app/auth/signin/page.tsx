'use client';

import { getProviders, signIn, getSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebar';
import DarkModeWrapper from '@/components/DarkModeWrapper';

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

function SignInContent() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');
  const { isDarkMode } = useSidebarStore();

  useEffect(() => {
    const setUpProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    setUpProviders();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [callbackUrl, router]);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { callbackUrl });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn('credentials', {
        email,
        password,
        callbackUrl
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error occurred during sign-in. Please try again.';
      case 'OAuthCallback':
        return 'Error occurred during callback. Please try again.';
      case 'OAuthCreateAccount':
        return 'Could not create account. Please try again.';
      case 'EmailCreateAccount':
        return 'Could not create account with email. Please try again.';
      case 'Callback':
        return 'Error occurred during callback. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'This account is not linked. Please use a different method.';
      case 'EmailSignin':
        return 'Check your email for the sign-in link.';
      case 'CredentialsSignin':
        return 'Invalid credentials. Please check your details and try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  };

  return (
    <>
      <DarkModeWrapper />
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1b1e]' : 'bg-gray-50'} flex items-center justify-center p-4`}>
        <div className="max-w-lg w-full">
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold" style={{ color: isDarkMode ? '#ffffff' : '#004A84' }}>AI Legal</h1>
          </div>

          {/* Sign In Card */}
          <div className={`${isDarkMode ? 'bg-[#25262b] border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-10`}>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-red-900/20 border border-red-800' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm text-center ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {getErrorMessage(error)}
              </p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-[#1a1b1e] border border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'border border-gray-300 text-gray-900 placeholder-gray-600'
                }`}
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-[#1a1b1e] border border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'border border-gray-300 text-gray-900 placeholder-gray-600'
                }`}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-center">
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
                    else (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(209, 209, 209, 0.1)';
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

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className={`flex-1 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
            <span className={`px-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>or</span>
            <div className={`flex-1 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          </div>

          {/* Google Sign In */}
          <div className="space-y-4">
            {providers &&
              Object.values(providers).filter(provider => provider.name === 'Google').map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleSignIn(provider.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isDarkMode ? 'transparent' : '#C7A562',
                    border: isDarkMode ? '2px solid #d1d1d1' : 'none',
                    color: isDarkMode ? '#d1d1d1' : '#004A84'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#B59552';
                      else (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(209, 209, 209, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#C7A562';
                      else (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-semibold">
                        Sign in with Google
                      </span>
                    </div>
                  )}
                </button>
              ))}
          </div>

          {/* Guest Access */}
          <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => router.push(callbackUrl)}
              className="w-full px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              style={{
                backgroundColor: isDarkMode ? 'transparent' : '#E1C88E',
                border: isDarkMode ? '2px solid #9CA3AF' : 'none',
                color: isDarkMode ? '#9CA3AF' : '#004A84'
              }}
              onMouseEnter={(e) => {
                if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#D4B67D';
                else (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(156, 163, 175, 0.1)';
              }}
              onMouseLeave={(e) => {
                if (!isDarkMode) (e.target as HTMLButtonElement).style.backgroundColor = '#E1C88E';
                else (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              Continue without signing in
            </button>
          </div>
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