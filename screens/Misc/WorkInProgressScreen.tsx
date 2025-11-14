import React from 'react';
import { ArrowLeftIcon } from '../../components/icons';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

interface WorkInProgressScreenProps {
  title: string;
}

const WorkInProgressScreen: React.FC<WorkInProgressScreenProps> = ({ title }) => {
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  const isDark = theme === 'dark';
  
  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center p-3 shadow-md z-10`}>
        <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}>
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className={`text-xl font-semibold ml-4 ${colors.headerText}`}>{title}</h1>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className={`text-center ${colors.secondaryText}`}>
          <p className="text-lg">Segera Hadir!</p>
          <p>Fitur ini belum diimplementasikan.</p>
        </div>
      </main>
    </div>
  );
};

export default WorkInProgressScreen;