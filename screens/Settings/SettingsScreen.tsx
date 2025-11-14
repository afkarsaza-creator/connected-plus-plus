import React from 'react';
import { 
    ArrowLeftIcon, SearchIcon, MoreVertIcon, ChatBubbleIcon, LockIcon, 
    NotificationsIcon, SunIcon, MoonIcon, ChatAvatar
} from '../../components/icons';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen: React.FC = () => {
    const { userProfile } = useAuth();
    const { theme, toggleTheme } = useSettings();
    const { handleBack, handleNavigate } = useNavigation();
    const isDark = theme === 'dark';

    const colors = {
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
        screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
        sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
        onlineStatusText: isDark ? 'text-gray-400' : 'text-gray-200',
        linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
        iconColor: isDark ? "text-gray-400" : "text-gray-500",
        headerIcons: 'text-white',
        divider: isDark ? 'border-black/20' : 'border-gray-200',
        hoverBg: isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50',
        gapBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    };
    
    const iconClass = `w-6 h-6 ${colors.iconColor}`;
    
    interface SettingsItemProps {
        icon: React.ReactNode;
        title: string;
        value: string;
        onClick: () => void;
        isFirst?: boolean;
    }
    
    const SettingsItem: React.FC<SettingsItemProps> = ({ icon, title, value, onClick, isFirst }) => (
        <div onClick={onClick} className={`flex items-center space-x-4 p-3 cursor-pointer ${colors.hoverBg} ${!isFirst ? `border-t ${colors.divider}` : ''}`}>
            {icon}
            <div>
                <p className={colors.primaryText}>{title}</p>
                <p className={`text-sm ${colors.secondaryText}`}>{value}</p>
            </div>
        </div>
    );
    
    if (!userProfile) return null;

    return (
        <div className={`h-full flex flex-col ${colors.screenBg} overflow-y-auto relative`}>
            <header className={`${colors.headerBg} p-3 flex items-center justify-between sticky top-0 z-10`}>
                <div className="flex items-center space-x-4">
                    <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerIcons}`}><ArrowLeftIcon className="w-6 h-6" /></button>
                    <h1 className={`text-xl font-semibold ${colors.headerIcons}`}>Pengaturan</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={toggleTheme} className={`p-2 ${colors.headerIcons}`}>
                        {isDark ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={() => handleNavigate('search')} className={`p-2 ${colors.headerIcons}`}><SearchIcon className="w-6 h-6" /></button>
                    <button className={`p-2 ${colors.headerIcons}`}><MoreVertIcon className="w-6 h-6" /></button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                 <div onClick={() => handleNavigate('profileInfo')} className="p-4 flex items-center space-x-4 cursor-pointer">
                    <ChatAvatar avatar={userProfile.avatar} size="x-large" className="w-20 h-20" />
                    <div>
                        <p className={`text-xl font-semibold ${colors.primaryText}`}>{userProfile.name}</p>
                        <p className={`${colors.onlineStatusText}`}>daring</p>
                    </div>
                </div>

                <div className={`${colors.gapBg} h-2`}></div>

                <div className={colors.sectionBg}>
                    <SettingsItem icon={<></>} title={userProfile.phone || ''} value="Nomor Telepon" onClick={() => handleNavigate('changeNumber')} isFirst />
                    <SettingsItem icon={<></>} title={userProfile.username || 'None'} value="Nama Pengguna" onClick={() => handleNavigate('username')} />
                    <SettingsItem icon={<></>} title={userProfile.bio || 'Belum diatur'} value="Bio" onClick={() => handleNavigate('profileInfo')} />
                </div>

                <div className={`${colors.gapBg} h-2`}></div>
                
                <div className={colors.sectionBg}>
                    <SettingsItem icon={<ChatBubbleIcon className={iconClass} />} title="Pengaturan Obrolan" value="Tema, Wallpaper, Stiker" onClick={() => handleNavigate('chatSettings')} isFirst />
                    <SettingsItem icon={<LockIcon className={iconClass} />} title="Privasi dan Keamanan" value="Pengguna diblokir, kode sandi" onClick={() => handleNavigate('privacyAndSecurity')} />
                    <SettingsItem icon={<NotificationsIcon className={iconClass} />} title="Notifikasi dan Suara" value="Nada pesan, grup, dan panggilan" onClick={() => handleNavigate('notificationsAndSounds')} />
                </div>
            </main>
        </div>
    );
};

export default SettingsScreen;