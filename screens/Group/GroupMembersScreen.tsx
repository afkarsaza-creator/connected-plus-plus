import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, MoreVertIcon, ChatAvatar, PersonRemoveIcon, ProfileIcon, PersonAddIcon, SearchIcon } from '../../components/icons';
import type { User } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import VirtualList from '../../components/VirtualList.tsx';

const GroupMembersScreen: React.FC = () => {
    const { handleBack, handleNavigate } = useNavigation();
    const { theme } = useSettings();
    const { userProfile: currentUser } = useAuth();
    const { setActiveUser } = useUser();
    const { activeChat, removeMemberFromGroup } = useChat();
    
    const [activeMemberMenu, setActiveMemberMenu] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const isDark = theme === 'dark';
    
    const chat = activeChat;
    if (!chat || !currentUser) return null;
    
    const isOwner = currentUser.id === chat.created_by;

    const colors = {
        screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
        headerText: 'text-white',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
        divider: isDark ? 'border-gray-700' : 'border-gray-800',
        sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
        menuBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        menuHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
    };
    
    const iconClass = `w-6 h-6 ${colors.secondaryText}`;

    const filteredMembers = useMemo(() => {
        if (!searchQuery) {
            return chat.members || [];
        }
        return (chat.members || []).filter(member =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, chat.members]);

    const handleNavigateToProfile = (user: User) => {
        setActiveUser(user);
        handleNavigate('userProfile', { isCurrentUser: user.id === currentUser.id });
    };

    const handleRemove = (memberId: string) => {
        removeMemberFromGroup(chat.id, memberId);
        setActiveMemberMenu(null);
    };
    
    const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; isDestructive?: boolean; }> = ({ icon, label, onClick, isDestructive }) => (
        <div onClick={onClick} className={`flex items-center space-x-4 p-3 cursor-pointer ${colors.menuHover} ${isDestructive ? 'text-red-500' : colors.primaryText}`}>
            {icon}<span>{label}</span>
        </div>
    );

    const renderMemberItem = (member: User) => (
         <div key={member.id} onClick={() => member.id !== currentUser.id && handleNavigateToProfile(member)} className={`flex items-center justify-between p-2 pl-4 border-b ${colors.divider} relative ${member.id !== currentUser.id ? 'cursor-pointer' : ''}`}>
            <div className="flex items-center space-x-3"><ChatAvatar avatar={member.avatar} size="large" /><div><p className={`font-semibold ${colors.primaryText}`}>{member.name}</p><p className={`text-sm ${colors.secondaryText}`}>{member.lastSeen}</p></div></div>
            <div className="flex items-center">
                {member.id === chat.created_by && <p className={`text-sm pr-4 ${colors.secondaryText}`}>Pemilik</p>}
                {member.id !== currentUser.id && isOwner && <button onClick={(e) => { e.stopPropagation(); setActiveMemberMenu(member.id); }} className={`p-2 ${colors.secondaryText}`}><MoreVertIcon className="w-6 h-6" /></button>}
            </div>
            {activeMemberMenu === member.id && <>
                <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setActiveMemberMenu(null); }}></div>
                <div className={`absolute right-2 top-14 ${colors.menuBg} rounded-lg shadow-lg py-1 z-30 w-60`}>
                    <MenuItem icon={<ProfileIcon className={iconClass} />} label="Lihat Profil" onClick={() => { setActiveMemberMenu(null); handleNavigateToProfile(member); }} />
                    {isOwner && member.id !== chat.created_by && <MenuItem icon={<PersonRemoveIcon className="w-6 h-6 text-red-500" />} label="Keluarkan dari grup" isDestructive onClick={() => handleRemove(member.id)} />}
                </div>
            </>}
        </div>
    );

    return (
        <div className={`h-full flex flex-col ${colors.screenBg} overflow-y-auto relative`}>
            <header className={`${colors.headerBg} flex items-center justify-between p-2 shadow-md sticky top-0 z-10`}>
                {isSearching ? (
                    <div className="flex items-center p-2 w-full">
                        <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className={`p-2 ${colors.headerText}`}>
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="text"
                            placeholder="Cari anggota"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 bg-transparent text-lg ${colors.headerText} placeholder-gray-300 outline-none px-2`}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-2 w-full">
                        <div className="flex items-center space-x-4 min-w-0">
                            <button onClick={handleBack} className={`p-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
                            <div className="min-w-0">
                                <h1 className={`text-xl font-semibold ${colors.headerText} truncate`}>{chat.name}</h1>
                                <p className={`text-sm ${colors.secondaryText}`}>{chat.members?.length} anggota</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isOwner && <button onClick={() => handleNavigate('addMembers')} className={`p-2 ${colors.headerText}`}><PersonAddIcon className="w-6 h-6" /></button>}
                            <button onClick={() => setIsSearching(true)} className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
                        </div>
                    </div>
                )}
            </header>

            <div className={`flex-1 mt-2 ${colors.sectionBg} border-t ${colors.divider}`}>
                 {filteredMembers.length > 0 ? (
                    <VirtualList
                        items={filteredMembers}
                        renderItem={renderMemberItem}
                        itemHeight={76} // Perkiraan tinggi untuk setiap item anggota
                    />
                 ) : (
                    <p className={`text-center p-8 ${colors.secondaryText}`}>
                        {searchQuery ? 'Tidak ada anggota yang ditemukan.' : 'Tidak ada anggota.'}
                    </p>
                 )}
            </div>
        </div>
    );
};

export default GroupMembersScreen;