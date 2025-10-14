import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onNavigateToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth_signup_error_all_fields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth_signup_error_password_match'));
      return;
    }
    if (password.length < 8) {
        setError(t('auth_signup_error_password_length'));
        return;
    }
    
    console.log('Sign up successful with:', { name, email });
    alert('Account created successfully! Please log in.');
    onSignUpSuccess();
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold text-center text-gray-200 mb-6">{t('auth_signup_title')}</h2>
      {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/50 p-3 rounded-lg border border-red-500/50">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-400">{t('auth_signup_name_label')}</label>
          <div className="relative mt-1">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3"><User className="h-5 w-5 text-gray-500" /></span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth_signup_name_placeholder')} className="w-full py-2 pl-10 pr-4 text-sm bg-gray-900 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow border border-gray-700" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-400">{t('auth_login_email_label')}</label>
          <div className="relative mt-1">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-5 w-5 text-gray-500" /></span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth_login_email_placeholder')} className="w-full py-2 pl-10 pr-4 text-sm bg-gray-900 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow border border-gray-700" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-400">{t('auth_login_password_label')}</label>
          <div className="relative mt-1">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-500" /></span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth_login_password_placeholder')} className="w-full py-2 pl-10 pr-4 text-sm bg-gray-900 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow border border-gray-700" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-400">{t('auth_signup_confirm_password_label')}</label>
          <div className="relative mt-1">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-500" /></span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth_signup_confirm_password_placeholder')} className="w-full py-2 pl-10 pr-4 text-sm bg-gray-900 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow border border-gray-700" required />
          </div>
        </div>
        <button type="submit" className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors">
          {t('auth_signup_button')}
        </button>
        <div className="text-sm text-center text-gray-400">
          <p>{t('auth_signup_have_account')}{' '}
            <button type="button" onClick={onNavigateToLogin} className="font-medium text-violet-400 hover:text-violet-300">
              {t('auth_signup_login_link')}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
