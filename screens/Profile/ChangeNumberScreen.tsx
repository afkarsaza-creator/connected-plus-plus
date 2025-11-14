import React, { useState } from 'react';
import { ArrowLeftIcon, CheckIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const ChangeNumberScreen: React.FC = () => {
  const { userProfile, updateProfile } = useAuth();
  const { handleBack } = useNavigation();
  const { theme } = useSettings();

  const currentPhoneNumber = userProfile?.phone || '';
  const [number, setNumber] = useState(currentPhoneNumber);
  const isDark = theme === 'dark';
  const hasChanged = number !== currentPhoneNumber;

  const handleSave = () => {
    if (hasChanged) {
      updateProfile({ phone: number });
      handleBack();
    }
  };

  const colors = {
    screenBg: isDark ? 'bg-[#0e1621]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-300' : 'text-gray-500',
    buttonBg: 'bg-blue-500',
    buttonText: 'text-white',
    inputBg: 'transparent',
    inputBorder: isDark ? 'border-gray-600' : 'border-gray-300',
    inputText: isDark ? 'text-blue-400' : 'text-blue-500',
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center justify-between z-10`}>
        <button onClick={handleBack} className="p-2 -ml-2 text-white"><ArrowLeftIcon className="w-6 h-6" /></button>
        <button onClick={handleSave} disabled={!hasChanged} className={`p-2 text-white ${!hasChanged ? 'opacity-50' : ''}`}><CheckIcon className="w-6 h-6" /></button>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center text-center p-6">
        <h1 className={`text-3xl font-bold mb-4 ${colors.primaryText}`}>Ganti Nomor</h1>
        <p className={`max-w-md mb-8 ${colors.secondaryText}`}>Akun dan data Anda akan dipindahkan ke nomor baru.</p>
        <div className="w-full max-w-sm">
            <div className="relative w-full mb-4">
              <input type="tel" value={number} onChange={(e) => setNumber(e.target.value)} className={`w-full py-2.5 px-4 rounded-lg font-semibold text-base text-center ${colors.inputBg} ${colors.inputText} border ${colors.inputBorder}`} placeholder="Nomor Telepon" />
            </div>
            <button onClick={handleSave} disabled={!hasChanged} className={`w-full py-3 rounded-lg font-semibold text-lg ${colors.buttonBg} ${colors.buttonText} ${!hasChanged ? 'opacity-50' : ''}`}>Ganti</button>
        </div>
      </main>
    </div>
  );
};

export default ChangeNumberScreen;