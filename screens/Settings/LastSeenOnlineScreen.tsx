import React from 'react';
import { ArrowLeftIcon } from '../../components/icons';
import type { PrivacyOption } from '../../types';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

type OnlineStatusOption = 'everybody' | 'myContacts';

const LastSeenOnlineScreen: React.FC = () => {
  const { handleBack } = useNavigation();
  const { userProfile, updateProfile } = useAuth();
  const { theme } = useSettings();
  const lastSeenValue = userProfile?.lastSeenPrivacy || 'everybody';
  const onlineStatusValue = userProfile?.onlineStatusPrivacy || 'everybody';

  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#f0f4f7]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    descriptionText: isDark ? 'text-gray-500' : 'text-gray-600',
    sectionTitleColor: isDark ? 'text-blue-400' : 'text-[#527da3]',
    divider: isDark ? 'border-black/20' : 'border-gray-200',
    radioBorder: isDark ? 'border-gray-500' : 'border-gray-400',
    radioSelectedBorder: isDark ? 'border-blue-400' : 'border-[#3390ec]',
    radioSelectedDot: isDark ? 'bg-blue-400' : 'bg-[#3390ec]',
  };

  const handleUpdate = (key: 'lastSeenPrivacy' | 'onlineStatusPrivacy', value: PrivacyOption | OnlineStatusOption) => {
    updateProfile({ [key]: value });
  };

  const RadioOption: React.FC<{
    label: string;
    value: PrivacyOption | OnlineStatusOption;
    currentValue: PrivacyOption | OnlineStatusOption;
    onChange: (value: any) => void;
    isLast?: boolean;
  }> = ({ label, value, currentValue, onChange, isLast }) => {
    const isSelected = value === currentValue;
    return (
      <div
        onClick={() => onChange(value)}
        className={`flex items-center justify-between py-3.5 cursor-pointer ${!isLast ? `border-b ${colors.divider}`: ''}`}
      >
        <span className={`${colors.primaryText} text-base`}>{label}</span>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? colors.radioSelectedBorder : colors.radioBorder}`}>
          {isSelected && <div className={`w-2.5 h-2.5 ${colors.radioSelectedDot} rounded-full`}></div>}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center sticky top-0 z-10 space-x-4`}>
        <button onClick={handleBack} className="p-2 -ml-2 text-white"><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className="text-xl font-semibold text-white">Terakhir Dilihat & Daring</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4">
        <div className={`${colors.sectionBg} rounded-lg shadow-sm mt-4`}>
           <h3 className={`${colors.sectionTitleColor} font-semibold px-4 pt-4 pb-2 text-sm`}>Siapa yang dapat melihat waktu Terakhir Dilihat saya</h3>
           <div className="px-4">
              <RadioOption label="Semua Orang" value="everybody" currentValue={lastSeenValue} onChange={(v) => handleUpdate('lastSeenPrivacy', v)} />
              <RadioOption label="Kontak Saya" value="myContacts" currentValue={lastSeenValue} onChange={(v) => handleUpdate('lastSeenPrivacy', v)} />
              <RadioOption label="Tidak Ada" value="nobody" currentValue={lastSeenValue} onChange={(v) => handleUpdate('lastSeenPrivacy', v)} isLast/>
           </div>
        </div>
        <p className={`text-sm ${colors.descriptionText} px-2 py-4`}>
          Jika Anda tidak membagikan waktu Terakhir Dilihat Anda, Anda tidak akan dapat melihat informasi ini dari pengguna lain. Perkiraan waktu terakhir terlihat akan ditampilkan.
        </p>
        
        <div className={`${colors.sectionBg} rounded-lg shadow-sm mt-2`}>
           <h3 className={`${colors.sectionTitleColor} font-semibold px-4 pt-4 pb-2 text-sm`}>Siapa yang dapat melihat saya saat Daring</h3>
           <div className="px-4">
              <RadioOption label="Semua Orang" value="everybody" currentValue={onlineStatusValue} onChange={(v) => handleUpdate('onlineStatusPrivacy', v)} />
              <RadioOption label="Kontak Saya" value="myContacts" currentValue={onlineStatusValue} onChange={(v) => handleUpdate('onlineStatusPrivacy', v)} isLast/>
           </div>
        </div>
        <p className={`text-sm ${colors.descriptionText} px-2 py-4`}>
            Pengaturan Terakhir Dilihat Anda berlaku untuk status Daring Anda juga. Jika 'Kontak Saya' dipilih dan Anda tidak membagikan Terakhir Dilihat dengan seseorang, mereka juga tidak akan melihat status Daring Anda.
        </p>

      </main>
    </div>
  );
};

export default LastSeenOnlineScreen;