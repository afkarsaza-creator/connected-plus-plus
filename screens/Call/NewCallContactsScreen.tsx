import React from 'react';
import { ArrowLeftIcon, SearchIcon, ChatAvatar } from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const NewCallContactsScreen: React.FC = () => {
  const { users } = useUser();
  const { navigateToChat } = useChat();
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
  };

  const UserItem: React.FC<{ user: User }> = ({ user }) => (
    <div onClick={() => navigateToChat(user)} className="flex items-center space-x-4 px-2 cursor-pointer">
      <ChatAvatar avatar={user.avatar} size="large" />
      <div className={`flex-1 border-b ${colors.divider} py-3`}>
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
          <h1 className={`text-xl font-semibold ${colors.headerText}`}>Panggilan Baru</h1>
        </div>
        <button className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        {users.map(user => (
          <UserItem key={user.id} user={user} />
        ))}
      </main>
    </div>
  );
};

export default NewCallContactsScreen;