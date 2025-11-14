import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, ChatAvatar } from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const SearchScreen: React.FC = () => {
    const [query, setQuery] = useState('');
    const { allUsers, setActiveUser } = useUser();
    const { handleBack, handleNavigate } = useNavigation();
    const { theme } = useSettings();
    const { userProfile: currentUser } = useAuth();
    
    const isDark = theme === 'dark';

    const colors = {
        screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
        headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
        headerText: 'text-white',
        placeholder: isDark ? 'placeholder-gray-400' : 'placeholder-gray-200',
        divider: isDark ? 'border-gray-700' : 'border-gray-200',
        itemHover: isDark ? 'hover:bg-[#2a3744]' : 'hover:bg-gray-100',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-600',
        linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    };

    const handleUserClick = (user: User) => {
        if (currentUser) {
            setActiveUser(user);
            handleNavigate('userProfile', { isCurrentUser: user.id === currentUser.id });
        }
    };

    const SearchResultItem: React.FC<{ user: User }> = ({ user }) => (
        <li onClick={() => handleUserClick(user)} className={`flex items-center space-x-4 py-2 cursor-pointer ${colors.itemHover} rounded-lg p-2`}>
             <ChatAvatar avatar={user.avatar} size="large" />
             <div>
                <p className={`font-semibold ${colors.primaryText}`}>{user.name}</p>
                <p className={`text-sm ${colors.secondaryText}`}>{user.username ? `@${user.username}` : user.phone}</p>
             </div>
        </li>
    );

    const filteredUsers = useMemo(() => {
        if (!query) return [];
        const lowerCaseQuery = query.toLowerCase();
        return allUsers.filter(user =>
            user.name.toLowerCase().includes(lowerCaseQuery) ||
            (user.username && user.username.toLowerCase().includes(lowerCaseQuery))
        );
    }, [query, allUsers]);
    
    const renderContent = () => {
        if (query) {
            if (filteredUsers.length > 0) {
                return (
                    <div>
                        <h2 className={`font-semibold ${colors.linkColor} mb-2`}>Hasil Pencarian Global</h2>
                        <ul>
                            {filteredUsers.map(user => <SearchResultItem key={user.id} user={user} />)}
                        </ul>
                    </div>
                );
            }
            return <p className={`${colors.secondaryText} text-center mt-8`}>Tidak ada pengguna ditemukan untuk "{query}"</p>;
        }
        
        return <p className={`${colors.secondaryText} text-center mt-8`}>Cari pengguna secara global berdasarkan nama atau nama pengguna.</p>;
    };

    return (
        <div className={`h-full flex flex-col ${colors.screenBg}`}>
            <header className={`${colors.headerBg} flex items-center p-2 shadow-md z-10`}>
                <button onClick={handleBack} className={`p-2 ${colors.headerText}`}>
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <input
                    type="text"
                    placeholder="Cari (Global)"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`flex-1 bg-transparent text-lg ${colors.headerText} ${colors.placeholder} outline-none px-2`}
                />
            </header>

            <div className="p-4 flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default SearchScreen;