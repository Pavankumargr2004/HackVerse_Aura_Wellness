import React, { useState } from 'react';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import ForgotPassword from './auth/ForgotPassword';
import { HeartPulse } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type AuthView = 'login' | 'signup' | 'forgot';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const { t } = useLanguage();

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login onLoginSuccess={onLoginSuccess} onNavigateToSignUp={() => setView('signup')} onNavigateToForgot={() => setView('forgot')} />;
      case 'signup':
        return <SignUp onSignUpSuccess={() => setView('login')} onNavigateToLogin={() => setView('login')} />;
      case 'forgot':
        return <ForgotPassword onNavigateToLogin={() => setView('login')} />;
      default:
        return <Login onLoginSuccess={onLoginSuccess} onNavigateToSignUp={() => setView('signup')} onNavigateToForgot={() => setView('forgot')} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl shadow-violet-900/20 animate-fadeIn border border-gray-700">
        <div className="flex flex-col items-center">
          <HeartPulse className="h-12 w-12 text-violet-500" />
          <h1 className="text-3xl font-bold text-white mt-2">AURA WELLNESS</h1>
          <p className="text-gray-400 text-center">{t('auth_main_tagline')}</p>
        </div>
        {renderView()}
      </div>
    </div>
  );
};

export default AuthPage;
