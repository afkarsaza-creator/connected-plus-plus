import React, { useState } from 'react';
import { AppLogo, ArrowLeftIcon, EyeIcon, EyeOffIcon } from '../../components/icons';
import type { Screen } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface SignUpScreenProps {
  onSignUp: (firstName: string, lastName: string, email: string, phone: string, pass: string) => void;
  onNavigate: (screen: Screen) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigate }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
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

  const validatePasswords = (pass: string, confirmPass: string) => {
    if (pass.length > 0 && pass.length < 6) {
      setPasswordError("Kata sandi minimal harus 6 karakter.");
      return false;
    }
    if (pass !== confirmPass && confirmPass.length > 0) {
      setPasswordError("Kata sandi tidak cocok.");
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswords(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validatePasswords(password, newConfirmPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasswords(password, confirmPassword) && password.length >= 6) {
      onSignUp(firstName, lastName, email, phone, password);
    } else {
        if (password.length < 6) {
            setPasswordError("Kata sandi minimal harus 6 karakter.");
        } else if (password !== confirmPassword) {
            setPasswordError("Kata sandi tidak cocok.");
        }
    }
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
        <h2 className={`text-2xl font-bold text-center mb-6 ${colors.primaryText}`}>Buat Akun Anda</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
                <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Nama Depan</label>
                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none`} required />
            </div>
            <div className="w-1/2">
                <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Nama Belakang</label>
                <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none`} />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Alamat Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none`} required />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Nomor Telepon</label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none`} required />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Kata Sandi</label>
            <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={handlePasswordChange} className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none pr-10`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
                    {showPassword ? <EyeOffIcon className={`h-5 w-5 ${colors.secondaryText}`} /> : <EyeIcon className={`h-5 w-5 ${colors.secondaryText}`} />}
                </button>
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>Konfirmasi Kata Sandi</label>
            <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" value={confirmPassword} onChange={handleConfirmPasswordChange} className={`w-full px-4 py-2 rounded-md ${colors.inputBg} ${colors.primaryText} border ${colors.inputBorder} ${colors.inputFocusBorder} focus:outline-none pr-10`} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
                    {showConfirmPassword ? <EyeOffIcon className={`h-5 w-5 ${colors.secondaryText}`} /> : <EyeIcon className={`h-5 w-5 ${colors.secondaryText}`} />}
                </button>
            </div>
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>
          <button type="submit" className={`w-full text-white py-2 rounded-md font-semibold transition-colors ${colors.buttonBg}`}>
            Daftar
          </button>
        </form>
        <div className="text-center mt-6">
          <p className={colors.secondaryText}>
            Sudah punya akun?{' '}
            <button onClick={() => onNavigate('login')} className={`font-semibold ${colors.linkColor}`}>
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;