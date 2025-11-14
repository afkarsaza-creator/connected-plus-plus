import React, { useState } from 'react';
import { 
    ArrowLeftIcon, PencilIcon, MoreVertIcon, ChatAvatar, NotificationsIcon, LeaveIcon, 
    AutoDeleteIcon, SearchIcon, PersonRemoveIcon, ProfileIcon, GalleryIcon, CameraIcon, TrashIcon, NotificationsOffIcon, PersonAddIcon
} from '../../components/icons';
import type { User } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useStorage } from '../../context/StorageContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useModalState } from '../../hooks/useModalState.ts';

const GroupDetailsScreen: React.FC = () => {
    const { userProfile: currentUser } = useAuth();
    const { activeChat: chat, toggleMute, leaveGroup, removeMemberFromGroup, editGroup, reportError } = useChat();
    const { uploadFile, deleteAvatar } = useStorage();
    const { handleBack, handleNavigate } = useNavigation();
    const { theme } = useSettings();
    const { setActiveUser } = useUser();

    const leaveConfirmDialog = useModalState();
    const mainMenu = useModalState();
    const photoSheet = useModalState();
    
    const [activeMemberMenu, setActiveMemberMenu] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    if (!chat || !currentUser) return null;

    const isDark = theme === 'dark';
    const isOwner = currentUser.id === chat.created_by;

    const colors = {
        screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
        headerText: 'text-white',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
        divider: isDark ? 'border-gray-700' : 'border-gray-800',
        sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
        actionButtonText: isDark ? 'text-blue-400' : 'text-[#527da3]',
        dialogBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        dialogText: isDark ? 'text-gray-300' : 'text-gray-600',
        menuBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        menuHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
    };
    
    const iconClass = `w-6 h-6 ${colors.secondaryText}`;

    const handleNavigateToProfile = (user: User) => {
        setActiveUser(user);
        handleNavigate('userProfile', { isCurrentUser: user.id === currentUser.id });
    };

    const handleLeave = () => { leaveGroup(chat.id); leaveConfirmDialog.close(); handleBack(); };
    const handleRemove = (memberId: string) => { removeMemberFromGroup(chat.id, memberId); setActiveMemberMenu(null); }
    
    const handleFileSelect = async (file: File) => {
        photoSheet.close();
        setIsUploading(true);
        try {
            const publicUrl = await uploadFile(file, 'group-avatars', chat.id);
            if (publicUrl) {
                const oldPhotoUrl = chat.photo;
                if(oldPhotoUrl) {
                   await deleteAvatar(oldPhotoUrl);
                }
                await editGroup(chat.id, chat.name, publicUrl, chat.description || '');
            } else {
                reportError("Gagal mengunggah foto grup. URL tidak valid.");
            }
        } catch (error: any) {
            console.error("Error changing group photo:", error);
            reportError(`Gagal mengubah foto grup: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const onPhotoTaken = async (photoBlob: Blob) => {
        if (photoBlob) await handleFileSelect(new File([photoBlob], "group-photo.jpg", { type: "image/jpeg" }));
    };

    const handleCameraClick = () => { photoSheet.close(); handleNavigate('camera', { onPhotoTaken }); };
    const handleGalleryClick = () => {
        photoSheet.close();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files?.[0]) handleFileSelect(target.files[0]);
        };
        input.click();
    };

    const handleRemovePhoto = async () => {
        photoSheet.close();
        setIsUploading(true);
        try {
            const oldPhotoUrl = chat.photo;
            if(oldPhotoUrl) {
                await deleteAvatar(oldPhotoUrl);
            }
            await editGroup(chat.id, chat.name, null, chat.description || '');
        } catch (error: any) {
             console.error("Error removing group photo:", error);
             reportError(`Gagal menghapus foto grup: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };
    
    const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; isDestructive?: boolean; }> = ({ icon, label, onClick, isDestructive }) => (
        <div onClick={onClick} className={`flex items-center space-x-4 p-3 cursor-pointer ${colors.menuHover} ${isDestructive ? 'text-red-500' : colors.primaryText}`}>
            {icon}<span>{label}</span>
        </div>
    );

    return (
        <div className={`h-full flex flex-col ${colors.screenBg} overflow-y-auto relative`}>
            <header className={`${colors.headerBg} flex items-center justify-between p-2 shadow-md sticky top-0 z-10`}>
                <button onClick={handleBack} className={`p-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
                <div className="flex items-center space-x-2">
                    <button onClick={mainMenu.open} className={`p-2 ${colors.headerText}`}><MoreVertIcon className="w-6 h-6" /></button>
                </div>
            </header>

            {mainMenu.isOpen && <>
                <div className="fixed inset-0 z-20" onClick={mainMenu.close}></div>
                <div className={`absolute right-2 top-14 ${colors.menuBg} rounded-lg shadow-lg py-1 z-30 w-64`}>
                    {isOwner && <MenuItem icon={<PencilIcon className={iconClass} />} label="Edit" onClick={() => { mainMenu.close(); handleNavigate('editGroup'); }} />}
                    <MenuItem icon={<SearchIcon className={iconClass} />} label="Cari" onClick={() => { mainMenu.close(); handleNavigate('chatSearch'); }} />
                    <MenuItem icon={<LeaveIcon className={`w-6 h-6 text-red-500`} />} label={isOwner ? "Hapus dan Keluar" : "Keluar Grup"} isDestructive onClick={() => { mainMenu.close(); leaveConfirmDialog.open(); }} />
                </div>
            </>}

            <main className="flex-1 overflow-y-auto">
                <div className={`flex flex-col items-center p-4 ${colors.sectionBg} border-b ${colors.divider}`}>
                    <button onClick={() => isOwner && photoSheet.open()} className="relative group w-24 h-24 mb-4">
                        {isUploading ? (
                            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center"><div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div></div>
                        ) : (
                            <ChatAvatar avatar={chat.avatar} photo={chat.photo} size="x-large" />
                        )}
                        {isOwner && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </button>
                    <h1 className={`text-2xl font-bold ${colors.primaryText}`}>{chat.name}</h1>
                    <p className={`text-sm ${colors.secondaryText}`}>{chat.members?.length} anggota</p>
                </div>
                
                <div className="mt-2">
                    {chat.description && (
                        <div className={`${colors.sectionBg} p-4`}>
                            <p className={colors.primaryText}>{chat.description}</p>
                            <p className={`text-sm ${colors.secondaryText} mt-1`}>Deskripsi</p>
                        </div>
                    )}
                    <div className={`mt-2 ${colors.sectionBg}`}>
                        <div className={`flex items-center justify-between p-3`}>
                            <div className="flex items-center space-x-4">
                                {chat.isMuted ? <NotificationsOffIcon className={iconClass} /> : <NotificationsIcon className={iconClass} />}
                                <span className={colors.primaryText}>Notifikasi</span>
                            </div>
                            <ToggleSwitch isOn={!chat.isMuted} onToggle={() => toggleMute(chat.id)} />
                        </div>
                        <div onClick={() => handleNavigate('groupAutoDelete')} className={`flex items-center justify-between p-3 cursor-pointer`}>
                            <div className="flex items-center space-x-4">
                                <AutoDeleteIcon className={iconClass} />
                                <span className={colors.primaryText}>Hapus Otomatis</span>
                            </div>
                            <span className={`${colors.secondaryText} text-lg`}>{chat.autoDeleteTimer === 'off' ? 'Mati' : chat.autoDeleteTimer} ›</span>
                        </div>
                        <div onClick={() => handleNavigate('sharedMedia', { chat })} className={`flex items-center justify-between p-3 cursor-pointer`}>
                            <div className="flex items-center space-x-4">
                                <GalleryIcon className={iconClass} />
                                <span className={colors.primaryText}>Media Bersama</span>
                            </div>
                            <span className={`${colors.secondaryText} text-lg`}>›</span>
                        </div>
                    </div>
                    <div className="mt-2">
                        <h3 className={`font-semibold px-4 pt-2 pb-2 text-sm ${colors.actionButtonText}`}>{chat.members?.length} Anggota</h3>
                        <div className={colors.sectionBg}>
                            {isOwner && (
                                <div onClick={() => handleNavigate('addMembers')} className="flex items-center space-x-3 p-3 cursor-pointer">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/20`}>
                                        <PersonAddIcon className={`w-7 h-7 ${colors.actionButtonText}`} />
                                    </div>
                                    <span className={`font-semibold ${colors.actionButtonText}`}>Tambah Anggota</span>
                                </div>
                            )}
                            {chat.members?.map(member => (
                                <div key={member.id} className="relative">
                                    <div onClick={() => handleNavigateToProfile(member)} className="flex items-center p-2 cursor-pointer">
                                        <ChatAvatar avatar={member.avatar} size="large" />
                                        <div className="flex-1 ml-3">
                                            <p className={`font-semibold ${colors.primaryText}`}>{member.name}</p>
                                            {member.id === chat.created_by && <p className={`text-sm ${colors.actionButtonText}`}>Pemilik</p>}
                                        </div>
                                        {isOwner && member.id !== currentUser.id && (
                                            <button onClick={(e) => { e.stopPropagation(); setActiveMemberMenu(member.id); }} className={`p-2 ${colors.secondaryText}`}>
                                                <MoreVertIcon className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                    {activeMemberMenu === member.id && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setActiveMemberMenu(null)}></div>
                                            <div className={`absolute right-4 top-12 ${colors.menuBg} rounded-lg shadow-lg py-1 z-30 w-60`}>
                                                <MenuItem icon={<ProfileIcon className={iconClass} />} label="Lihat Profil" onClick={() => { setActiveMemberMenu(null); handleNavigateToProfile(member); }} />
                                                <MenuItem icon={<PersonRemoveIcon className={`w-6 h-6 text-red-500`} />} label="Keluarkan dari grup" isDestructive onClick={() => handleRemove(member.id)} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`mt-2 ${colors.sectionBg}`}>
                        <div onClick={leaveConfirmDialog.open} className="p-3">
                            <div className="flex items-center space-x-4">
                                <LeaveIcon className="w-6 h-6 text-red-500" />
                                <span className="text-red-500 font-semibold">{isOwner ? "Hapus dan Keluar Grup" : "Keluar Grup"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {leaveConfirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
                    <div className={`${colors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm text-left`}>
                        <h2 className={`text-lg font-bold mb-2 ${colors.primaryText}`}>{isOwner ? "Hapus dan Keluar" : "Keluar Grup"}</h2>
                        <p className={`${colors.dialogText} mb-6`}>{isOwner ? "Anda yakin ingin menghapus grup ini? Tindakan ini tidak dapat diurungkan." : "Anda yakin ingin keluar dari grup ini?"}</p>
                        <div className="flex justify-end space-x-6">
                            <button onClick={leaveConfirmDialog.close} className={`font-semibold ${colors.actionButtonText}`}>BATAL</button>
                            <button onClick={handleLeave} className={`font-semibold text-red-500`}>{isOwner ? "HAPUS" : "KELUAR"}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {photoSheet.isOpen && isOwner && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-20" onClick={photoSheet.close}></div>
                    <div className={`fixed bottom-0 left-0 right-0 ${colors.menuBg} rounded-t-2xl p-4 z-30`}>
                        <h2 className={`font-semibold text-lg mb-4 text-center ${colors.primaryText}`}>Foto Grup</h2>
                        <ul className="space-y-2">
                            <MenuItem icon={<CameraIcon className={iconClass} />} label="Ambil Foto" onClick={handleCameraClick} />
                            <MenuItem icon={<GalleryIcon className={iconClass} />} label="Pilih dari Galeri" onClick={handleGalleryClick} />
                            {chat.photo && <MenuItem icon={<TrashIcon className="w-6 h-6 text-red-500" />} label="Hapus Foto" onClick={handleRemovePhoto} isDestructive />}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default GroupDetailsScreen;
