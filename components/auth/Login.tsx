import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
}

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-3">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.449-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToSignUp, onNavigateToForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setError('');
      console.log('Login successful with:', { email, password });
      onLoginSuccess();
    } else {
      setError(t('auth_login_error'));
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google login success for the demo
    console.log('Google login successful');
    onLoginSuccess();
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold text-center text-gray-200 mb-6">{t('auth_login_welcome')}</h2>
      {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/50 p-3 rounded-lg border border-red-500/50">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-400">{t('auth_login_email_label')}</label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-500" />
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth_login_email_placeholder')}
              className="w-full py-2 pl-10 pr-4 text-sm bg-gray-900 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow border border-gray-700"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="password"className="text-sm font-medium text-gray-400">{t('auth_login_password_label')}</label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-500" />
            </span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth_login_password_placeholder')}
              className="w-full py-2 pl-10 pr-4 text-sm bg-gray-900 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow border border-gray-700"
              required
            />
          </div>
        </div>
        <div className="text-right text-sm">
          <button type="button" onClick={onNavigateToForgot} className="font-medium text-violet-400 hover:text-violet-300">
            {t('auth_login_forgot')}
          </button>
        </div>
        <button type="submit" className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors">
          {t('auth_login_button')}
        </button>
      </form>
      
      <div className="relative my-6 flex items-center">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">{t('auth_login_or')}</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>
      
      <button 
        type="button" 
        onClick={handleGoogleLogin} 
        className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors border border-gray-600"
      >
        <GoogleIcon />
        {t('auth_login_google')}
      </button>

      <div className="text-sm text-center text-gray-400 mt-4">
          <p>{t('auth_login_no_account')}{' '}
            <button type="button" onClick={onNavigateToSignUp} className="font-medium text-violet-400 hover:text-violet-300">
              {t('auth_login_signup_link')}
            </button>
          </p>
      </div>
    </div>
  );
};

export default Login;
