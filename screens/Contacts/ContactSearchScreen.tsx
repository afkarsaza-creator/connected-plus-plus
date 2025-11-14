import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, ChatAvatar } from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const ContactSearchScreen: React.FC = () => {
    const [query, setQuery] = useState('');
    const { userProfile } = useAuth();
    const { users, setActiveUser } = useUser();
    const { handleBack, handleNavigate } = useNavigation();
    const { theme } = useSettings();
    const isDark = theme === 'dark';

    const colors = {
        screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
        headerText: 'text-white',
        placeholder: isDark ? 'placeholder-gray-400' : 'placeholder-gray-200',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-600',
        itemHover: isDark ? 'hover:bg-[#2a3744]' : 'hover:bg-gray-100',
        divider: isDark ? 'border-gray-700' : 'border-gray-200',
    };
    
    const handleContactClick = (user: User) => {
        setActiveUser(user);
        handleNavigate('userProfile', { isCurrentUser: user.id === userProfile?.id });
    };

    const filteredUsers = useMemo(() => {
        if (!query) {
            return [];
        }
        const sortedUsers = [...users].sort((a,b) => a.name.localeCompare(b.name));
        return sortedUsers.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, users]);

    const SearchResultItem: React.FC<{ user: User, isLast: boolean }> = ({ user, isLast }) => (
        <li onClick={() => handleContactClick(user)} className={`flex items-center space-x-4 px-3 cursor-pointer ${colors.itemHover}`}>
            <ChatAvatar avatar={user.avatar} size="large" />
            <div className={`flex-1 ${!isLast ? `border-b ${colors.divider}` : ''} py-3`}>
                <p className={`font-semibold ${colors.primaryText}`}>{user.name}</p>
                <p className={`text-sm ${colors.secondaryText}`}>{user.lastSeen}</p>
            </div>
        </li>
    );

    const renderContent = () => {
        if (query && filteredUsers.length === 0) {
            return <p className={`${colors.secondaryText} text-center mt-8`}>Tidak ada kontak yang ditemukan.</p>;
        }
        
        if (filteredUsers.length > 0) {
            return (
                <ul>
                    {filteredUsers.map((user, index) => <SearchResultItem key={user.id} user={user} isLast={index === filteredUsers.length - 1} />)}
                </ul>
            );
        }

        return <p className={`${colors.secondaryText} text-center mt-8`}>Cari kontak berdasarkan nama.</p>;
    };

    return (
        <div className={`h-full flex flex-col ${colors.screenBg}`}>
            <header className={`${colors.headerBg} flex items-center p-2 shadow-md z-10`}>
                <button onClick={handleBack} className={`p-2 ${colors.headerText}`}>
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <input
                    type="text"
                    placeholder="Cari kontak Anda"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`flex-1 bg-transparent text-lg ${colors.headerText} ${colors.placeholder} outline-none px-2`}
                />
            </header>

            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default ContactSearchScreen;