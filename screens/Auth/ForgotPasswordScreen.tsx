import React, { useState } from 'react';
import { AppLogo, ArrowLeftIcon } from '../../components/icons';
import type { Screen } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface ForgotPasswordScreenProps {
  onReset: (email: string) => void;
  onNavigate: (screen: Screen) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onReset, onNavigate }) => {
  const [email, setEmail] = useState('');
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReset(email);
  };

  return (
    <div className={`h-full w-full flex items-center justify-center ${colors.screenBg} p-4 overflow-y-auto`}>
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-lg shadow-lg ${colors.formBg} relative`}>
        <button onClick={() => onNavigate('login')} className={`absolute top-4 left-4 p-2 ${colors.secondaryText}`}>
            <ArrowLeftIcon className="w-6 h-6"/>
        </button>
        <div className="flex justify-center mb-8">
          <AppLogo className="h-16 w-auto" />
        </div>
        <h2 className={`text-2xl font-bold text-center mb-2 ${colors.primaryText}`}>Lupa Kata Sandi?</h2>
        <p className={`text-center mb-6 ${colors.secondaryText}`}>Masukkan alamat email Anda untuk mengatur ulang kata sandi Anda.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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
          <button type="submit" className={`w-full text-white py-2 rounded-md font-semibold transition-colors ${colors.buttonBg}`}>
            Kirim Kode Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;