import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, CheckIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const UsernameScreen: React.FC = () => {
  const { userProfile, updateProfile } = useAuth();
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  
  const currentUsername = userProfile?.username || 'None';
  const [username, setUsername] = useState(currentUsername === 'None' ? '' : currentUsername);
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    descriptionText: isDark ? 'text-gray-500' : 'text-gray-600',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    headerIcons: 'text-white',
    inputBorder: isDark ? 'border-b border-gray-600' : 'border-b-2 border-blue-500',
  };
  
  const originalUsername = useMemo(() => currentUsername === 'None' ? '' : currentUsername, [currentUsername]);
  const hasChanged = username !== originalUsername;
  const isValid = useMemo(() => username.length === 0 || /^[a-zA-Z0-9_]{5,}$/.test(username), [username]);
  
  const handleSave = () => {
      if (isValid && hasChanged) {
          updateProfile({ username });
          handleBack();
      }
  };
  
  const canSave = (username.length === 0 && hasChanged) || (isValid && hasChanged && username.length >= 5);

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center justify-between z-10`}>
        <div className="flex items-center space-x-4"><button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerIcons}`}><ArrowLeftIcon className="w-6 h-6" /></button><h1 className={`text-xl font-semibold ${colors.headerIcons}`}>Nama Pengguna</h1></div>
        <button onClick={handleSave} disabled={!canSave} className={`p-2 ${colors.headerIcons} ${!canSave ? 'opacity-50' : ''}`}><CheckIcon className="w-6 h-6" /></button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className={`${colors.sectionBg} mt-2`}><div className="px-4 py-3"><p className={`${colors.linkColor} font-semibold text-sm mb-1`}>Atur nama pengguna</p><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nama pengguna" className={`w-full bg-transparent outline-none text-base py-1 ${colors.primaryText} ${colors.inputBorder}`} /></div></div>
        <div className="px-4 py-3 text-sm">
            <p className={`${colors.descriptionText} mb-3`}>Anda dapat memilih nama pengguna. Jika ya, orang dapat menemukan Anda dengan nama pengguna ini tanpa nomor telepon Anda.</p>
            <p className={colors.descriptionText}>Gunakan a–z, 0–9, dan garis bawah. Panjang minimal 5 karakter.</p>
        </div>
      </main>
    </div>
  );
};

export default UsernameScreen;