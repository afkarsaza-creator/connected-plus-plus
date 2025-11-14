import React, { useCallback } from 'react';
import type { User } from '../types';
import {
  ProfileIcon, GroupIcon, ContactsIcon, CallIcon, SavedIcon, SettingsIcon, InviteIcon, HelpIcon, SunIcon, MoonIcon, LeaveIcon, ChatAvatar
} from './icons';
import { useSettings } from '../context/SettingsContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  fullName: string;
  avatar: User['avatar'];
  onLogout: () => void;
}

const isValidHttpUrl = (string: string) => {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, phoneNumber, fullName, avatar, onLogout }) => {
  const { theme, toggleTheme } = useSettings();
  const { handleNavigate } = useNavigation();
  const { userProfile, setAlert } = useAuth();
  const { setActiveUser } = useUser();
  const isDark = theme === 'dark';

  const handleNavigateToMyProfile = useCallback(() => {
    if (userProfile) {
        setActiveUser(userProfile);
        handleNavigate('userProfile');
    }
  }, [userProfile, setActiveUser, handleNavigate]);

  const handleInvite = async () => {
    const shareUrl = isValidHttpUrl(window.location.href) 
        ? window.location.href 
        : 'https://aistudio.google.com/';

    const inviteData = {
        title: 'Gabung di cONnected+',
        text: 'Ayo gabung dengan saya di cONnected+! Aplikasi perpesanan yang cepat dan aman.',
        url: shareUrl
    };
    try {
        if (navigator.share) {
            await navigator.share(inviteData);
        } else {
            // Fallback for browsers that don't support Web Share API
            await navigator.clipboard.writeText(inviteData.url);
            setAlert({ message: 'Tautan undangan telah disalin ke clipboard!', type: 'success' });
        }
    } catch (error) {
        console.error('Error sharing:', error);
        setAlert({ message: 'Gagal membagikan undangan.', type: 'error' });
    }
  };


  const colors = {
    bg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    headerBg: isDark ? 'bg-[#2a3744]' : 'bg-[#527da3]',
    text: isDark ? 'text-white' : 'text-black',
    headerText: 'text-white',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-200',
    iconColor: isDark ? 'text-gray-300' : 'text-gray-600',
    hoverBg: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
    sunIconColor: 'text-white',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
  };

  const SidebarMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <li onClick={() => { onClick(); onClose(); }} className={`flex items-center space-x-6 p-3 rounded-lg ${colors.hoverBg} cursor-pointer`}>
      {icon}
      <span className={`text-base font-medium ${colors.text}`}>{label}</span>
    </li>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-30 md:hidden ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`
          ${colors.bg} ${colors.text} flex flex-col h-full z-40
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-80 md:flex-shrink-0 md:border-r ${colors.divider}
          fixed w-4/5 max-w-xs
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className={`${colors.headerBg} p-4`}>
          <div className="flex justify-between items-start">
            <ChatAvatar avatar={avatar} size="large" />
            <button onClick={toggleTheme} className="p-2">
              {isDark ? (
                <SunIcon className={`w-6 h-6 ${colors.sunIconColor}`} />
              ) : (
                <MoonIcon className={`w-6 h-6 ${colors.sunIconColor}`} />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div>
              <p className={`font-semibold ${colors.headerText}`}>{fullName}</p>
              <p className={`text-sm ${colors.secondaryText}`}>{phoneNumber}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul>
            <SidebarMenuItem icon={<ProfileIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Profil Saya" onClick={handleNavigateToMyProfile} />
            <SidebarMenuItem icon={<GroupIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Grup Baru" onClick={() => handleNavigate('newGroup')} />
            <SidebarMenuItem icon={<ContactsIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Kontak" onClick={() => handleNavigate('contacts')} />
            <SidebarMenuItem icon={<CallIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Panggilan" onClick={() => handleNavigate('calls')} />
            <SidebarMenuItem icon={<SavedIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Pesan Tersimpan" onClick={() => handleNavigate('savedMessages')} />
            <SidebarMenuItem icon={<SettingsIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Pengaturan" onClick={() => handleNavigate('settings')} />
            <SidebarMenuItem icon={<InviteIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="Undang Teman" onClick={handleInvite} />
            <SidebarMenuItem icon={<HelpIcon className={`w-6 h-6 ${colors.iconColor}`} />} label="FAQ cONnected+" onClick={() => handleNavigate('features')} />
          </ul>
        </nav>
        <div className={`p-2 border-t ${colors.divider}`}>
            <div onClick={() => { onLogout(); onClose(); }} className={`flex items-center space-x-6 p-3 rounded-lg ${colors.hoverBg} cursor-pointer`}>
                <LeaveIcon className="w-6 h-6 text-red-500" />
                <span className={`text-base font-medium ${colors.text}`}>Keluar</span>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;