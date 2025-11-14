import React from 'react';
import { ArrowLeftIcon } from '../../components/icons';
import type { AutoDeleteOption } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';
import { useChat } from '../../context/ChatContext';
import { useModalState } from '../../hooks/useModalState';
import { ConfirmationDialog } from '../Chat/components/ChatModals';

const getTimerValueText = (timer: AutoDeleteOption) => {
    switch (timer) {
        case '1d': return 'Setelah 1 hari';
        case '1w': return 'Setelah 1 minggu';
        case '1mo': return 'Setelah 1 bulan';
        default: return 'Mati';
    }
};

// FIX: Pindahkan RadioOption ke luar komponen utama.
// Ini mencegahnya didefinisikan ulang pada setiap render, yang menyebabkan masalah state.
const RadioOption: React.FC<{
  label: string;
  isSelected: boolean;
  onClick: () => void;
  isLast?: boolean;
  colors: any;
}> = ({ label, isSelected, onClick, isLast, colors }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-3.5 cursor-pointer ${!isLast ? `border-b ${colors.divider}`: ''}`}
    >
      <span className={`${colors.primaryText} text-base`}>{label}</span>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? colors.radioSelectedBorder : colors.radioBorder}`}>
        {isSelected && <div className={`w-2.5 h-2.5 ${colors.radioSelectedDot} rounded-full`}></div>}
      </div>
    </div>
  );
};

const AutoDeleteMessagesScreen: React.FC = () => {
  const { settings, setSetting, theme } = useSettings();
  const { handleBack } = useNavigation();
  const { applyGlobalAutoDeleteToChats } = useChat();
  const confirmationDialog = useModalState();
  const currentTimer = settings.globalAutoDeleteTimer;
  
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#f0f4f7]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    descriptionText: isDark ? 'text-gray-500' : 'text-gray-600',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    sectionTitleColor: isDark ? 'text-blue-400' : 'text-[#527da3]',
    divider: isDark ? 'border-black/20' : 'border-gray-200',
    radioBorder: isDark ? 'border-gray-500' : 'border-gray-400',
    radioSelectedBorder: isDark ? 'border-blue-400' : 'border-[#3390ec]',
    radioSelectedDot: isDark ? 'bg-blue-400' : 'bg-[#3390ec]',
    hoverBg: isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
  };
  
  const handleConfirmApply = () => {
    applyGlobalAutoDeleteToChats(currentTimer);
    confirmationDialog.close();
  };


  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center sticky top-0 z-10 space-x-4`}>
        <button onClick={handleBack} className="p-2 -ml-2 text-white"><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className="text-xl font-semibold text-white">Pesan Hapus Otomatis</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4">
        <div className={`${colors.sectionBg} rounded-lg shadow-sm mt-4`}>
           <h3 className={`${colors.sectionTitleColor} font-semibold px-4 pt-4 pb-2 text-sm`}>Timer Hancurkan Otomatis</h3>
           <div className="px-4">
              <RadioOption label="Mati" isSelected={currentTimer === 'off'} onClick={() => setSetting('globalAutoDeleteTimer', 'off')} colors={colors} />
              <RadioOption label="Setelah 1 hari" isSelected={currentTimer === '1d'} onClick={() => setSetting('globalAutoDeleteTimer', '1d')} colors={colors} />
              <RadioOption label="Setelah 1 minggu" isSelected={currentTimer === '1w'} onClick={() => setSetting('globalAutoDeleteTimer', '1w')} colors={colors} />
              <RadioOption label="Setelah 1 bulan" isSelected={currentTimer === '1mo'} onClick={() => setSetting('globalAutoDeleteTimer', '1mo')} isLast colors={colors}/>
           </div>
        </div>
        
        <p className={`text-sm ${colors.descriptionText} px-2 py-4`}>
            Jika diaktifkan, semua pesan baru di obrolan yang Anda mulai akan dihapus secara otomatis untuk semua orang setelah beberapa waktu setelah dikirim. Anda juga dapat{' '}
            <span onClick={confirmationDialog.open} className={`${colors.linkColor} cursor-pointer`}>menerapkan pengaturan ini untuk obrolan yang ada</span>.
        </p>
      </main>

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title="Terapkan ke Obrolan Lama?"
        message={`Ini akan menerapkan timer '${getTimerValueText(currentTimer)}' ke semua obrolan pribadi Anda yang sudah ada.`}
        confirmText="TERAPKAN"
        onCancel={confirmationDialog.close}
        onConfirm={handleConfirmApply}
      />
    </div>
  );
};

export default AutoDeleteMessagesScreen;