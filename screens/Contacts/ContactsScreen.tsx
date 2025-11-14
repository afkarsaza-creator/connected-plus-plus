import React from 'react';
import { ArrowLeftIcon, SearchIcon, ChatAvatar } from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import VirtualList from '../../components/VirtualList.tsx';

const ContactsScreen: React.FC = () => {
  const { userProfile } = useAuth();
  const { users, setActiveUser } = useUser();
  const { handleBack, handleNavigate } = useNavigation();
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#17212b]' : 'bg-white',
    headerBg: isDark ? 'bg-[#212d3b]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    divider: isDark ? 'border-gray-800' : 'border-gray-200',
  };
  
  const handleContactClick = (user: User) => {
    setActiveUser(user);
    handleNavigate('userProfile', { isCurrentUser: user.id === userProfile?.id });
  };

  const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));

  const renderContactItem = (user: User, index: number) => (
      <div key={user.id} onClick={() => handleContactClick(user)} className={`flex items-center space-x-4 px-3 cursor-pointer ${isDark ? 'hover:bg-[#212d3b]' : 'hover:bg-gray-50'}`}>
        <ChatAvatar avatar={user.avatar} size="large" />
        <div className={`flex-1 ${index < sortedUsers.length -1 ? `border-b ${colors.divider}` : ''} py-3`}>
          <p className={`font-semibold ${colors.primaryText}`}>{user.name}</p>
          <p className={`text-sm ${colors.secondaryText}`}>{user.lastSeen}</p>
        </div>
      </div>
  );

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center justify-between p-3 shadow-md z-10`}>
        <div className="flex items-center space-x-4">
          <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
          <h1 className={`text-xl font-semibold ${colors.headerText} cursor-pointer`}>Kontak</h1>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => handleNavigate('contactSearch')} className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {sortedUsers.length > 0 ? (
          <VirtualList
            items={sortedUsers}
            renderItem={renderContactItem}
            itemHeight={84} // Perkiraan tinggi untuk setiap item kontak
          />
        ) : (
          <div className="text-center p-8">
            <p className={colors.secondaryText}>Anda belum memiliki kontak.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ContactsScreen;