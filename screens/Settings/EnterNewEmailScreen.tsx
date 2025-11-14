import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, MailboxIcon, GoogleIcon, SpinnerIcon } from '../../components/icons';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

const EnterNewEmailScreen: React.FC = () => {
  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { theme } = useSettings();
  const { handleBack } = useNavigation();
  const { setAlert, updateAuthUser } = useAuth();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    inputBorder: isDark ? 'border-blue-400' : 'border-[#3390ec]',
    inputLabel: isDark ? 'text-blue-400' : 'text-[#3390ec]',
    inputBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    orText: isDark ? 'text-gray-500' : 'text-gray-400',
    fabBg: isDark ? 'bg-blue-400' : 'bg-[#527da3]'
  };
  
  const handleSubmit = async () => {
    if (!newEmail || !newEmail.includes('@') || !newEmail.includes('.') || isSaving) {
      setAlert({ message: 'Silakan masukkan alamat email yang valid.', type: 'error' });
      return;
    }
    
    setIsSaving(true);
    const { error } = await updateAuthUser({ email: newEmail });
    setIsSaving(false);

    if (error) {
      setAlert({ message: `Gagal mengubah email: ${error.message}`, type: 'error' });
    } else {
      setAlert({ message: `Email konfirmasi telah dikirim ke alamat email lama dan baru Anda.`, type: 'success' });
      handleBack();
    }
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center sticky top-0 z-10 space-x-4`}>
        <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className={`text-xl font-semibold ${colors.headerText}`}>Email Login</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-6">
        <div className="flex flex-col items-center w-full max-w-sm">
            <MailboxIcon className="w-24 h-24 mb-6"/>
            <h2 className={`text-2xl font-semibold mb-2 ${colors.primaryText}`}>Masukkan Email Baru</h2>
            <p className={`text-center mb-8 ${colors.secondaryText}`}>
                Anda akan menerima kode login cONnected+ melalui email dan bukan SMS. Silakan masukkan alamat email yang dapat Anda akses.
            </p>

            <div className="relative w-full">
                <input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full p-3 pt-6 border-2 ${colors.inputBorder} rounded-lg outline-none transition-colors duration-200 ${colors.inputBg} ${colors.primaryText}`}
                    placeholder=" "
                />
                <label 
                    htmlFor="new-email"
                    className={`absolute top-1 left-3.5 text-xs transition-all duration-200 ${colors.inputLabel}`}
                >
                    Email baru Anda
                </label>
            </div>
        </div>
        
        <div className="flex flex-col items-center w-full max-w-sm">
          <p className={`text-sm my-4 ${colors.orText}`}>ATAU</p>
          <button className={`flex items-center space-x-2 p-3 rounded-lg`}>
            <GoogleIcon className="w-6 h-6" />
            <span className={`font-semibold ${colors.inputLabel}`}>Masuk dengan Google</span>
          </button>
        </div>
        
        <div className="w-full flex justify-end">
            <button onClick={handleSubmit} disabled={isSaving} className={`w-14 h-14 ${colors.fabBg} rounded-full flex items-center justify-center shadow-lg disabled:opacity-50`}>
                {isSaving ? <SpinnerIcon className="w-6 h-6 text-white" /> : <ArrowRightIcon className="w-6 h-6 text-white" />}
            </button>
        </div>
      </main>
    </div>
  );
};

export default EnterNewEmailScreen;