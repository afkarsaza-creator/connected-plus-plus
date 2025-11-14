import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, MoreVertIcon, CallIcon, SearchIcon, AutoDeleteTimerIcon, NotificationsIcon, TrashIcon, LeaveIcon, NotificationsOffIcon, VideoIcon, BlockIcon, PersonRemoveIcon } from '../../../components/icons';
import { ChatAvatar } from '../../../components/icons';
import type { Chat, User, Screen } from '../../../types';
import { useSettings } from '../../../context/SettingsContext';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '../../../context/NavigationContext';

interface ChatHeaderProps {
  chat: Chat;
  otherUser: User | null;
  typingStatus: { [chatId: string]: string[] };
  allUsers: User[];
  onBack: () => void;
  onNavigateToDetails: () => void;
  onNavigateToChatSearch: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onShowMenu: () => void;
  onBlockUser: () => void;
  onDeleteContact: () => void;
  isBlocked: boolean;
  isContact: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
    chat, otherUser, typingStatus, allUsers, onBack, onNavigateToDetails, 
    onNavigateToChatSearch, onStartCall, onShowMenu,
    onBlockUser, onDeleteContact, isBlocked, isContact
}) => {
    const { theme } = useSettings();
    const { toggleMute, clearHistory } = useChat();
    const { userProfile: currentUser } = useAuth();
    const { handleNavigate } = useNavigation();
    const [isMenuOpen, setMenuOpen] = useState(false);

    const isDark = theme === 'dark';
    
    const typingIndicatorText = useMemo(() => {
        if (!currentUser) return null;

        const typingUserIds = (typingStatus[chat.id] || []).filter(id => id !== currentUser.id);
        
        if (typingUserIds.length === 0) return null;

        if (chat.is_group) {
            const names = allUsers
                .filter(u => typingUserIds.includes(u.id))
                .map(u => u.name.split(' ')[0]);

            if (names.length === 0) return null;
            if (names.length === 1) return `${names[0]} sedang mengetik...`;
            if (names.length === 2) return `${names[0]} dan ${names[1]} sedang mengetik...`;
            return 'beberapa orang sedang mengetik...';
        } else {
            return 'sedang mengetik...';
        }
    }, [typingStatus, chat.id, chat.is_group, allUsers, currentUser]);

    const getVisibleStatus = () => {
        if (!otherUser) return `${chat.members?.length} anggota`;
        // Add privacy logic here if needed
        return otherUser.lastSeen;
    };
    
    const headerTitle = chat.is_group ? chat.name : (otherUser?.name || chat.name);
    const headerSubtitle = typingIndicatorText || getVisibleStatus();
    const headerAvatar = otherUser ? otherUser.avatar : chat.avatar;

    const colors = {
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
        headerText: isDark ? 'text-white' : 'text-black',
        headerSubtitleText: isDark ? 'text-gray-300' : 'text-gray-500',
        onlineColor: isDark ? 'text-blue-400' : 'text-blue-500',
        headerDivider: isDark ? '' : 'border-b border-gray-200',
        menuBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        menuHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
        primaryText: isDark ? 'text-white' : 'text-black',
    };
    
    const ChatMenuItem: React.FC<{icon: React.ReactNode, label: string, isDestructive?: boolean, onClick?: () => void}> = ({icon, label, isDestructive, onClick}) => (
      <button onClick={onClick} className={`w-full text-left flex items-center px-4 py-2 text-sm ${isDestructive ? 'text-red-500' : colors.primaryText} ${colors.menuHover}`}>
        <div className="w-8 h-8 mr-2 flex items-center justify-center">{icon}</div><span>{label}</span>
      </button>
    );

    return (
        <header className={`${colors.headerBg} flex items-center justify-between p-2 shadow-sm z-10 ${colors.headerDivider}`}>
            <div className="flex items-center min-w-0">
                <button onClick={onBack} className={`p-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
                <div onClick={onNavigateToDetails} className="flex items-center space-x-3 cursor-pointer min-w-0">
                     <ChatAvatar avatar={headerAvatar} size="small" />
                    <div className="min-w-0">
                        <h1 className={`text-lg font-semibold ${colors.headerText} truncate`}>{headerTitle}</h1>
                        <p className={`text-sm ${typingIndicatorText || headerSubtitle === 'daring' ? colors.onlineColor : colors.headerSubtitleText} truncate`}>{headerSubtitle}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                {!chat.is_group && otherUser && <button onClick={() => onStartCall('voice')} className={`p-2 ${colors.headerText}`}><CallIcon className="w-6 h-6" /></button>}
                <button onClick={onNavigateToChatSearch} className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
                <div className="relative">
                    <button onClick={() => setMenuOpen(true)} className={`p-2 ${colors.headerText}`}><MoreVertIcon className="w-6 h-6" /></button>
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)}></div>
                            <div className={`absolute right-0 mt-2 w-60 ${colors.menuBg} rounded-md shadow-lg py-1 z-30`}>
                                {!chat.is_group && otherUser && <ChatMenuItem onClick={() => { setMenuOpen(false); onStartCall('video'); }} icon={<VideoIcon className="w-5 h-5" />} label="Panggilan Video" />}
                                <ChatMenuItem onClick={() => { setMenuOpen(false); handleNavigate(chat.is_group ? 'groupAutoDelete' : 'chatAutoDelete'); }} icon={<AutoDeleteTimerIcon className="w-5 h-5" />} label="Hapus Otomatis" />
                                <ChatMenuItem onClick={() => { setMenuOpen(false); toggleMute(chat.id); }} icon={chat.isMuted ? <NotificationsIcon className="w-5 h-5" /> : <NotificationsOffIcon className="w-5 h-5" />} label={chat.isMuted ? "Suarakan" : "Bisukan"} />
                                <ChatMenuItem onClick={() => { setMenuOpen(false); clearHistory(chat.id); }} icon={<TrashIcon className="w-5 h-5" />} label="Bersihkan Riwayat" />
                                {!chat.is_group && otherUser && (
                                    <>
                                        <ChatMenuItem 
                                            onClick={() => { setMenuOpen(false); onBlockUser(); }} 
                                            icon={<BlockIcon className="w-5 h-5" />} 
                                            label={isBlocked ? "Buka Blokir" : "Blokir Pengguna"}
                                        />
                                        {isContact && (
                                            <ChatMenuItem 
                                                onClick={() => { setMenuOpen(false); onDeleteContact(); }}
                                                icon={<PersonRemoveIcon className="w-5 h-5 text-red-500" />}
                                                label="Hapus Kontak"
                                                isDestructive
                                            />
                                        )}
                                    </>
                                )}
                                {chat.is_group && <ChatMenuItem onClick={() => { setMenuOpen(false); onShowMenu(); }} icon={<LeaveIcon className="w-5 h-5 text-red-500" />} label="Keluar Grup" isDestructive />}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ChatHeader;