import React, { useState } from 'react';
import { 
    ArrowLeftIcon, TwoStepVerificationIcon, LockIcon, ChevronDownIcon
} from '../../components/icons';
import type { AutoDeleteOption, PrivacyOption } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../context/NavigationContext';
import { useModalState } from '../../hooks/useModalState.ts';
import { useAuth } from '../../context/AuthContext';

const getTimerValueText = (timer: AutoDeleteOption) => {
    switch (timer) {
        case '1d': return 'Setelah 1 hari';
        case '1w': return 'Setelah 1 minggu';
        // FIX: Changed '1m' to '1mo' to match the AutoDeleteOption type.
        case '1mo': return 'Setelah 1 bulan';
        default: return 'Mati';
    }
};

const getPrivacyOptionText = (value: PrivacyOption | undefined) => {
    switch (value) {
        case 'myContacts': return 'Kontak Saya';
        case 'nobody': return 'Tidak Ada';
        case 'everybody': return 'Semua Orang';
        default: return 'Tidak diatur';
    }
};

const AccordionSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colors: any;
}> = ({ title, icon, summary, isOpen, onToggle, children, colors }) => {
  return (
    <div className={colors.sectionBg}>
      <div
        onClick={onToggle}
        className={`flex items-center justify-between p-4 cursor-pointer ${colors.hoverBg}`}
      >
        <div className="flex items-center space-x-4">
          {icon}
          <div>
            <h3 className={`font-semibold text-base ${colors.primaryText}`}>{title}</h3>
            <p className={`text-sm ${colors.secondaryText} truncate`}>{summary}</p>
          </div>
        </div>
        <ChevronDownIcon
          className={`w-6 h-6 ${colors.secondaryText} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="px-4 pb-2">{children}</div>
      </div>
    </div>
  );
};


const PrivacyAndSecurityScreen: React.FC = () => {
    const { settings, theme } = useSettings();
    const { userProfile } = useAuth();
    const { blockedUserIds } = useUser();
    const { handleBack, handleNavigate } = useNavigation();
    const { globalAutoDeleteTimer } = settings;
    const { lastSeenPrivacy, phoneNumberPrivacy, profilePhotoPrivacy, forwardedMessagesPrivacy, callsPrivacy } = userProfile || {};
    const twoFactorEmail = "qol***@gma**.com";

    const emailModal = useModalState();
    const [openSection, setOpenSection] = useState<'security' | 'privacy' | null>(null);
    const isDark = theme === 'dark';

    const colors = {
        screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
        sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
        linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
        iconColor: isDark ? "text-gray-400" : "text-gray-500",
        headerIcons: 'text-white',
        divider: isDark ? 'border-black/20' : 'border-gray-200',
        hoverBg: isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50',
        dialogBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        dialogText: isDark ? 'text-gray-300' : 'text-gray-600',
    };
    
    const iconClass = `w-6 h-6 ${colors.iconColor}`;

    const toggleSection = (section: 'security' | 'privacy') => {
        setOpenSection(prev => (prev === section ? null : section));
    };
    
    const PrivacyItem: React.FC<{
        title: string;
        value: string;
        isFirst?: boolean;
        onClick: () => void;
    }> = ({ title, value, isFirst, onClick }) => (
        <div onClick={onClick} className={`${!isFirst ? `border-t ${colors.divider}` : ''} cursor-pointer ${colors.hoverBg}`}>
            <div className="flex items-center justify-between py-3 w-full">
                <span className={`text-base ${colors.primaryText}`}>{title}</span>
                <span className={colors.secondaryText}>{value}</span>
            </div>
        </div>
    );
    
    const privacySummary = `Terakhir dilihat: ${getPrivacyOptionText(lastSeenPrivacy)}, Telepon: ${getPrivacyOptionText(phoneNumberPrivacy)}, ...`;

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
        <header className={`${colors.headerBg} p-3 flex items-center sticky top-0 z-10 space-x-4`}>
            <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerIcons}`}><ArrowLeftIcon className="w-6 h-6" /></button>
            <h1 className={`text-xl font-semibold ${colors.headerIcons}`}>Privasi dan Keamanan</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto pt-2 space-y-2">
            <AccordionSection
                title="Keamanan"
                icon={<TwoStepVerificationIcon className={iconClass} />}
                summary="Pengguna diblokir, email, hapus otomatis"
                isOpen={openSection === 'security'}
                onToggle={() => toggleSection('security')}
                colors={colors}
            >
                <PrivacyItem 
                    title="Pengguna Diblokir"
                    value={blockedUserIds.length > 0 ? `${blockedUserIds.length}` : "Tidak ada"}
                    onClick={() => handleNavigate('blockedUsers')}
                    isFirst
                />
                 <PrivacyItem 
                    title="Email Login"
                    value={twoFactorEmail}
                    onClick={emailModal.open}
                />
                 <PrivacyItem 
                    title="Pesan Hapus Otomatis"
                    value={getTimerValueText(globalAutoDeleteTimer)}
                    onClick={() => handleNavigate('autoDeleteMessages')}
                />
            </AccordionSection>

             <AccordionSection
                title="Privasi"
                icon={<LockIcon className={iconClass} />}
                summary={privacySummary}
                isOpen={openSection === 'privacy'}
                onToggle={() => toggleSection('privacy')}
                colors={colors}
            >
                <PrivacyItem 
                    title="Nomor Telepon"
                    value={getPrivacyOptionText(phoneNumberPrivacy)}
                    isFirst
                    onClick={() => handleNavigate('phoneNumber')}
                />
                <PrivacyItem 
                    title="Terakhir Dilihat & Daring"
                    value={getPrivacyOptionText(lastSeenPrivacy)}
                    onClick={() => handleNavigate('lastSeenOnline')}
                />
                <PrivacyItem 
                    title="Foto Profil"
                    value={getPrivacyOptionText(profilePhotoPrivacy)}
                    onClick={() => handleNavigate('profilePhotos')}
                />
                 <PrivacyItem 
                    title="Pesan yang Diteruskan"
                    value={getPrivacyOptionText(forwardedMessagesPrivacy)}
                    onClick={() => handleNavigate('forwardedMessages')}
                />
                 <PrivacyItem 
                    title="Panggilan"
                    value={getPrivacyOptionText(callsPrivacy)}
                    onClick={() => handleNavigate('callsPrivacy')}
                />
            </AccordionSection>
        </div>

        {emailModal.isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20" role="dialog" aria-modal="true" aria-labelledby="email-dialog-title">
              <div className={`${colors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm text-left`}>
                <h2 id="email-dialog-title" className={`text-lg font-bold mb-2 ${colors.primaryText}`}>{twoFactorEmail}</h2>
                <p className={`${colors.dialogText} mb-6 text-sm`}>Alamat email ini akan digunakan setiap kali Anda masuk ke akun cONnected+ Anda dari perangkat baru.</p>
                <div className="flex justify-end space-x-6">
                  <button onClick={emailModal.close} className={`font-semibold ${colors.linkColor}`}>BATAL</button>
                  <button onClick={() => { emailModal.close(); handleNavigate('enterNewEmail'); }} className={`font-semibold ${colors.linkColor}`}>UBAH EMAIL</button>
                </div>
              </div>
            </div>
        )}
    </div>
  );
};

export default PrivacyAndSecurityScreen;