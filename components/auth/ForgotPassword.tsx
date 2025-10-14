import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setError('');
      console.log('Password reset requested for:', email);
      setSubmitted(true);
    } else {
        setError(t('auth_forgot_error_no_email'));
    }
  };

  if (submitted) {
    return (
      <div className="text-center animate-fadeIn space-y-4">
        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-200">{t('auth_forgot_success_title')}</h2>
        <p className="text-gray-400">
          {t('auth_forgot_success_description')}{' '}
          <span className="font-medium text-white">{email}</span>.
        </p>
        <button type="button" onClick={onNavigateToLogin} className="font-medium text-violet-400 hover:text-violet-300">
          &larr; {t('auth_forgot_back_to_login')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold text-center text-gray-200 mb-2">{t('auth_forgot_title')}</h2>
      <p className="text-gray-400 text-center mb-6 text-sm">{t('auth_forgot_description')}</p>
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
        <button type="submit" className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors">
          {t('auth_forgot_button')}
        </button>
        <div className="text-sm text-center">
          <button type="button" onClick={onNavigateToLogin} className="font-medium text-violet-400 hover:text-violet-300">
            &larr; {t('auth_forgot_back_to_login')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
