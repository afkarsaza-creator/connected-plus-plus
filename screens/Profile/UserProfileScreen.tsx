import React, { useState, useMemo } from 'react';
import { 
    ArrowLeftIcon, MoreVertIcon, ChatBubbleIcon, NotificationsIcon, CallIcon, VideoIcon, ChatAvatar,
    ShareIcon, BlockIcon, PersonRemoveIcon, PersonAddIcon, PencilIcon, GalleryIcon, AutoDeleteIcon, NotificationsOffIcon
} from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import { useCall } from '../../context/CallContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useModalState } from '../../hooks/useModalState.ts';

const UserProfileScreen: React.FC = () => {
    const { userProfile: currentUser, setAlert } = useAuth();
    const { activeUser: user, blockedUserIds, blockUser, unblockUser, deleteContact, contactIds, addContact } = useUser();
    const { chats, toggleMute, navigateToChat } = useChat();
    const { handleNavigate, handleBack } = useNavigation();
    const { startCall } = useCall();
    const { theme } = useSettings();

    const menu = useModalState();
    const blockConfirmDialog = useModalState();
    const deleteConfirmDialog = useModalState();
    
    const [isProcessing, setIsProcessing] = useState(false);
    
    const isCurrentUser = useMemo(() => currentUser?.id === user?.id, [currentUser, user]);
    const associatedChat = useMemo(() => {
        if (!user) return null;
        return chats.find(c => !c.is_group && c.members?.some(m => m.id === user.id));
    }, [chats, user]);

    if (!user || !currentUser) return null;
    
    const isDark = theme === 'dark';
    const isBlocked = blockedUserIds.includes(user.id);
    const isContact = contactIds.has(user.id);

    const colors = {
        screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
        headerText: 'text-white',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
        sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
        actionButtonText: isDark ? 'text-blue-400' : 'text-[#527da3]',
        divider: isDark ? 'border-gray-800' : 'border-gray-200',
        groupTitleText: isDark ? 'text-blue-400' : 'text-gray-600',
        menuBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        menuHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
        dialogBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        dialogText: isDark ? 'text-gray-300' : 'text-gray-600',
    };
    
    const commonGroups = chats.filter(c => c.is_group && c.members?.some(m => m.id === currentUser.id) && c.members.some(m => m.id === user.id));

    const handleShareContact = async () => {
        if (!user) return;
        menu.close();
    
        const shareUrl = window.location.origin || 'https://aistudio.google.com/app';
        const shareText = `Lihat profil ${user.name} di cONnected+! Gabung di ${shareUrl}`;
    
        const shareData = {
            title: `Kontak cONnected+: ${user.name}`,
            text: shareText,
            url: shareUrl,
        };
    
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareText);
                setAlert({ message: 'Tautan undangan kontak disalin ke clipboard!', type: 'success' });
            }
        } catch (error) {
            console.error('Error sharing contact:', error);
            if (error instanceof DOMException && error.name === 'AbortError') {
                return; // Pengguna membatalkan dialog bagikan, abaikan error.
            }
            setAlert({ message: 'Gagal membagikan kontak.', type: 'error' });
        }
    };

    const handleBlockConfirm = async () => {
        setIsProcessing(true);
        if (isBlocked) await unblockUser(user.id);
        else await blockUser(user.id);
        setIsProcessing(false);
        blockConfirmDialog.close();
        menu.close();
    };

    const handleDeleteConfirm = async () => {
        setIsProcessing(true);
        await deleteContact(user.id);
        setIsProcessing(false);
        deleteConfirmDialog.close();
        menu.close();
    };
    
    const handleAddContact = async () => {
        setIsProcessing(true);
        await addContact(user.id);
        setIsProcessing(false);
    };

    const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; }> = ({ icon, label, onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled} className="flex flex-col items-center space-y-1 p-2 disabled:opacity-50"><div className='text-white'>{icon}</div><p className="text-sm font-semibold text-white">{label}</p></button>
    );
    
    const MenuItem: React.FC<{icon: React.ReactNode, label: string, onClick: () => void, isDestructive?: boolean}> = ({ icon, label, onClick, isDestructive }) => (
        <li onClick={onClick} className={`flex items-center space-x-4 p-3 cursor-pointer ${colors.menuHover} rounded-lg`}><div className={isDestructive ? 'text-red-500' : colors.secondaryText}>{icon}</div><span className={isDestructive ? 'text-red-500' : colors.primaryText}>{label}</span></li>
    );

    return (
        <div className={`h-full overflow-y-auto flex flex-col ${colors.screenBg}`}>
            <div className={colors.headerBg}>
                <div className="flex items-center justify-between p-2">
                    <button onClick={handleBack} className={`p-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
                    {isCurrentUser ? <button onClick={() => handleNavigate('profileInfo')} className={`p-2 ${colors.headerText}`}><PencilIcon className="w-6 h-6" /></button>
                    : <button onClick={menu.open} className={`p-2 ${colors.headerText}`}><MoreVertIcon className="w-6 h-6" /></button>}
                </div>
                <div className="flex flex-col items-center p-4 pt-0"><ChatAvatar avatar={user.avatar} size="x-large" /><h1 className={`text-2xl font-bold ${colors.headerText} mt-4`}>{user.name}</h1><p className={`text-sm ${user.lastSeen === 'online' ? 'text-blue-300' : (isDark ? 'text-gray-300' : 'text-gray-200')} mt-1`}>{user.lastSeen}</p></div>
                {!isCurrentUser && <div className="grid grid-cols-4 py-2">
                    <ActionButton icon={<ChatBubbleIcon className="w-6 h-6" />} label="Pesan" onClick={() => navigateToChat(user)} />
                    <ActionButton icon={associatedChat?.isMuted ? <NotificationsIcon className="w-6 h-6" /> : <NotificationsOffIcon className="w-6 h-6" />} label={associatedChat?.isMuted ? "Suara" : "Bisukan"} onClick={() => associatedChat && toggleMute(associatedChat.id)} disabled={!associatedChat} />
                    <ActionButton icon={<CallIcon className="w-6 h-6" />} label="Panggil" onClick={() => startCall(user.id, 'voice')} />
                    <ActionButton icon={<VideoIcon className="w-6 h-6" />} label="Video" onClick={() => startCall(user.id, 'video')} />
                </div>}
            </div>
            
            <div className="mt-2">
                {(user.phone || user.username || user.bio) && <div className={colors.sectionBg}>
                    {user.phone && <div className={`p-4 border-b ${colors.divider}`}><p className={colors.primaryText}>{user.phone}</p><p className={`text-sm ${colors.secondaryText}`}>Mobile</p></div>}
                    {user.username && <div className={`p-4 ${user.bio ? `border-b ${colors.divider}` : ''}`}><p className={colors.primaryText}>@{user.username}</p><p className={`text-sm ${colors.secondaryText}`}>Nama Pengguna</p></div>}
                    {user.bio && <div className="p-4"><p className={colors.primaryText}>{user.bio}</p><p className={`text-sm ${colors.secondaryText}`}>Bio</p></div>}
                </div>}
                
                <div className={`mt-2 ${colors.sectionBg}`}><div onClick={() => associatedChat && handleNavigate('sharedMedia', { chat: associatedChat })} className={`flex items-center justify-between p-3 cursor-pointer ${!associatedChat ? 'opacity-50' : ''}`}><div className="flex items-center space-x-4"><GalleryIcon className={`w-6 h-6 ${colors.secondaryText}`} /><span className={colors.primaryText}>Media Bersama</span></div><span className={`${colors.secondaryText} text-lg`}>›</span></div></div>

                {!isContact && !isCurrentUser && <div className={`mt-2 ${colors.sectionBg}`}><div onClick={handleAddContact} className={`flex items-center space-x-4 px-4 py-3 cursor-pointer ${isProcessing ? 'opacity-50' : ''}`}><PersonAddIcon className={`w-6 h-6 ${colors.actionButtonText}`} /><span className={`text-base font-semibold ${colors.actionButtonText}`}>{isProcessing ? 'Menambahkan...' : 'Tambah ke kontak'}</span></div></div>}

                {commonGroups.length > 0 && <div className="mt-2"><h3 className={`font-semibold px-4 pt-2 pb-2 text-sm ${colors.groupTitleText}`}>Grup</h3><div className={colors.sectionBg}>{commonGroups.map((chat, i) => <div key={chat.id} onClick={() => navigateToChat(chat)} className="flex items-center p-3 cursor-pointer"><ChatAvatar avatar={chat.avatar} photo={chat.photo} size="large" /><div className={`flex-1 ml-4 ${i < commonGroups.length - 1 ? `border-b ${colors.divider}` : ''} py-3`}><p className={`font-semibold ${colors.primaryText}`}>{chat.name}</p><p className={`text-sm ${colors.secondaryText}`}>{chat.members?.length} anggota</p></div></div>)}</div></div>}
            </div>

            {menu.isOpen && !isCurrentUser && <>
                <div className="fixed inset-0 bg-black/60 z-20" onClick={menu.close}></div>
                <div className={`absolute right-4 top-4 ${colors.menuBg} rounded-lg shadow-xl p-2 w-72 z-30`}><ul>
                    {associatedChat && <MenuItem icon={<AutoDeleteIcon className="w-6 h-6" />} label="Hapus Otomatis" onClick={() => { menu.close(); handleNavigate('groupAutoDelete'); }} />}
                    <MenuItem icon={<ShareIcon className="w-6 h-6" />} label="Bagikan Kontak" onClick={handleShareContact} />
                    <MenuItem icon={<BlockIcon className="w-6 h-6" />} label={isBlocked ? "Buka Blokir" : "Blokir"} onClick={() => { menu.close(); blockConfirmDialog.open(); }} />
                    {isContact && <MenuItem icon={<PersonRemoveIcon className="w-6 h-6" />} label="Hapus Kontak" onClick={() => { menu.close(); deleteConfirmDialog.open(); }} isDestructive />}
                </ul></div>
            </>}

            {blockConfirmDialog.isOpen && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40"><div className={`${colors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm text-left`}><h2 className={`text-lg font-bold mb-2 ${colors.primaryText}`}>{isBlocked ? 'Buka blokir' : 'Blokir'}</h2><p className={`${colors.dialogText} mb-6`}>Yakin ingin {isBlocked ? 'buka blokir' : 'blokir'} {user.name}?</p><div className="flex justify-end space-x-6"><button onClick={blockConfirmDialog.close} className={`font-semibold ${colors.actionButtonText}`}>BATAL</button><button onClick={handleBlockConfirm} disabled={isProcessing} className={`font-semibold ${isBlocked ? colors.actionButtonText : 'text-red-500'} disabled:opacity-50`}>{isProcessing ? 'Memproses...' : (isBlocked ? 'BUKA BLOKIR' : 'BLOKIR')}</button></div></div></div>}
            {deleteConfirmDialog.isOpen && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40"><div className={`${colors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm text-left`}><h2 className={`text-lg font-bold mb-2 ${colors.primaryText}`}>Hapus Kontak</h2><p className={`${colors.dialogText} mb-6`}>Yakin ingin hapus?</p><div className="flex justify-end space-x-6"><button onClick={deleteConfirmDialog.close} className={`font-semibold ${colors.actionButtonText}`}>BATAL</button><button onClick={handleDeleteConfirm} disabled={isProcessing} className="font-semibold text-red-500 disabled:opacity-50">{isProcessing ? 'Menghapus...' : 'HAPUS'}</button></div></div></div>}
        </div>
    );
};

export default UserProfileScreen;