import React, { useState } from 'react';
import { AppLogo, EyeIcon, EyeOffIcon } from '../../components/icons';
import type { Screen } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => void;
  onNavigate: (screen: Screen) => void;
  alert: { message: string; type: 'success' | 'error' } | null;
  setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigate, alert, setAlert }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-gray-100',
    formBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-600',
    inputBg: isDark ? 'bg-[#2a3744]' : 'bg-gray-100',
    inputBorder: isDark ? 'border-gray-600' : 'border-gray-300',
    inputFocusBorder: isDark ? 'focus:border-blue-400' : 'focus:border-blue-500',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-600',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };
  
  const AlertComponent = () => {
    if (!alert) return null;

    const isSuccess = alert.type === 'success';
    const alertColors = {
      bg: isSuccess ? 'bg-green-100' : 'bg-red-100',
      border: isSuccess ? 'border-green-400' : 'border-red-400',
      text: isSuccess ? 'text-green-700' : 'text-red-700',
      darkBg: isSuccess ? 'bg-green-900/50' : 'bg-red-900/50',
      darkBorder: isSuccess ? 'border-green-500' : 'border-red-500',
      darkText: isSuccess ? 'text-green-200' : 'text-red-200',
      darkClose: isSuccess ? 'text-green-200' : 'text-red-200',
      lightClose: isSuccess ? 'text-green-600' : 'text-red-600',
    };
    
    const currentAlertColors = isDark ? {
        bg: alertColors.darkBg,
        border: alertColors.darkBorder,
        text: alertColors.darkText,
        close: alertColors.darkClose
    } : {
        bg: alertColors.bg,
        border: alertColors.border,
        text: alertColors.text,
        close: alertColors.lightClose
    };

    return (
      <div className={`border-l-4 ${currentAlertColors.border} ${currentAlertColors.bg} p-4 mb-6 rounded-r-lg relative`} role="alert">
        <p className={`font-bold ${currentAlertColors.text}`}>{isSuccess ? 'Berhasil' : 'Error'}</p>
        <p className={currentAlertColors.text}>{alert.message}</p>
        <button onClick={() => setAlert(null)} className={`absolute top-1 right-2 text-xl font-bold ${currentAlertColors.close}`} aria-label="Close">
          &times;
        </button>
      </div>
    );
  };

  return (
    <div className={`h-full w-full flex items-center justify-center ${colors.screenBg} p-4 overflow-y-auto`}>
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-lg shadow-lg ${colors.formBg}`}>
        <AlertComponent />
        <div className="flex justify-center mb-8">
          <AppLogo className="h-16 w-auto" />
        </div>
        <h2 className={`text-2xl font-bold text-center mb-6 ${colors.primaryText}`}>Masuk ke cONnected+</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Alamat Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none`}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
                  <EyeOffIcon className={`h-5 w-5 ${colors.secondaryText}`} />
                ) : (
                  <EyeIcon className={`h-5 w-5 ${colors.secondaryText}`} />
                )}
              </button>
            </div>
          </div>
          <button type="submit" className={`w-full text-white py-2 rounded-md font-semibold transition-colors ${colors.buttonBg}`}>
            Masuk
          </button>
        </form>
        <div className="text-center mt-4">
          <button onClick={() => onNavigate('forgotPassword')} className={`text-sm ${colors.linkColor}`}>
            Lupa Kata Sandi?
          </button>
        </div>
        <div className="text-center mt-6">
          <p className={colors.secondaryText}>
            Belum punya akun?{' '}
            <button onClick={() => onNavigate('signup')} className={`font-semibold ${colors.linkColor}`}>
              Daftar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;