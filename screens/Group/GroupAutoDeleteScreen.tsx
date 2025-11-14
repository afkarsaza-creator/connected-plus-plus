import React from 'react';
import { ArrowLeftIcon, OneDayIcon, OneWeekIcon, OneMonthIcon, TrashIcon } from '../../components/icons';
import type { AutoDeleteOption } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';

const GroupAutoDeleteScreen: React.FC = () => {
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  const { activeChat, setChatAutoDelete } = useChat();
  const currentTimer = activeChat?.autoDeleteTimer || 'off';
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    descriptionText: isDark ? 'text-gray-500' : 'text-gray-600',
    iconColor: isDark ? "text-gray-400" : "text-gray-500",
    divider: isDark ? 'border-black/20' : 'border-gray-200',
    hoverBg: isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
  };

  const handleSetTimer = (value: AutoDeleteOption) => {
    if (activeChat) {
        setChatAutoDelete(activeChat.id, value);
    }
    handleBack();
  }

  const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; isLast?: boolean; }> = ({ icon, label, onClick, isLast }) => (
    <div onClick={onClick} className={`flex items-center space-x-6 p-4 cursor-pointer ${colors.hoverBg} ${!isLast ? `border-b ${colors.divider}` : ''}`}>
      {icon}<span className={`text-base ${colors.primaryText}`}>{label}</span>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center sticky top-0 z-10 space-x-4`}>
        <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className={`text-xl font-semibold ${colors.headerText}`}>Hapus Otomatis</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto pt-2">
        <div className={colors.sectionBg}>
          <MenuItem icon={<TrashIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Mati" onClick={() => handleSetTimer('off')} />
          <MenuItem icon={<OneDayIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="1 hari" onClick={() => handleSetTimer('1d')} />
          <MenuItem icon={<OneWeekIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="1 minggu" onClick={() => handleSetTimer('1w')} />
          <MenuItem icon={<OneMonthIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="1 bulan" onClick={() => handleSetTimer('1mo')} isLast />
        </div>
        <p className={`text-sm ${colors.descriptionText} px-4 py-3`}>Hapus otomatis pesan baru yang dikirim dalam obrolan ini setelah periode waktu tertentu.</p>
      </main>
    </div>
  );
};

export default GroupAutoDeleteScreen;