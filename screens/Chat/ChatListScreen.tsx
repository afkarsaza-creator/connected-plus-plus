import React from 'react';
import type { Chat } from '../../types';
import { MenuIcon, SearchIcon, AppLogo, MessageStatusIcon, ChatAvatar, NotificationsOffIcon } from '../../components/icons';
import { useSettings } from '../../context/SettingsContext';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import VirtualList from '../../components/VirtualList.tsx';

interface ChatItemProps {
  chat: Chat;
  onClick: (chat: Chat) => void;
  theme: 'dark' | 'light';
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onClick, theme }) => {
  const isDark = theme === 'dark';

  const colors = {
    itemHover: isDark ? 'hover:bg-[#2a3744]' : 'hover:bg-gray-100',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
  };

  return (
    <div onClick={() => onClick(chat)} className={`flex items-center p-3 cursor-pointer ${colors.itemHover}`}>
      <div className="w-14 h-14 flex-shrink-0">
         <ChatAvatar avatar={chat.avatar} photo={chat.photo} size="large" />
      </div>
      <div className={`flex-1 ml-4 border-b ${colors.divider} pb-3`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
              <p className={`font-semibold ${chat.isScam ? 'text-red-500' : colors.primaryText}`}>{chat.name}</p>
          </div>
          <div className="flex items-center space-x-1 text-xs">
             {chat.messageStatus && <MessageStatusIcon status={chat.messageStatus} className={`w-4 h-4 ${chat.messageStatus === 'read' ? 'text-green-400' : colors.secondaryText}`} />}
             <span className={colors.secondaryText}>{chat.timestamp}</span>
          </div>
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className={`text-sm ${colors.secondaryText} truncate w-10/12`}>{chat.lastMessage}</p>
          <div className="flex items-center space-x-1.5">
            {chat.isMuted && <NotificationsOffIcon className={`w-4 h-4 ${colors.secondaryText}`} />}
            {chat.unreadCount && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoizedChatItem = React.memo(ChatItem);

const ChatListScreen: React.FC = () => {
  const { theme } = useSettings();
  const { chats, navigateToChat } = useChat();
  const { handleNavigate, openSidebar } = useNavigation();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
  };

  const renderChatItem = (chat: Chat) => (
    <MemoizedChatItem key={chat.id} chat={chat} onClick={navigateToChat} theme={theme} />
  );

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center p-2 sm:p-3 shadow-md z-10`}>
        <button onClick={openSidebar} className={`p-2 -ml-2 ${colors.headerText} md:hidden`}>
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="cursor-pointer flex-1 ml-2 sm:ml-4 md:ml-2">
            <AppLogo className="h-8 w-auto" />
        </div>
        <button onClick={() => handleNavigate('search')} className={`p-2 ${colors.headerText}`}>
          <SearchIcon className="w-6 h-6" />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
           <VirtualList
            items={chats}
            renderItem={renderChatItem}
            itemHeight={80} // Perkiraan tinggi untuk setiap ChatItem
          />
        ) : (
          <div className={`text-center p-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tidak ada obrolan untuk ditampilkan.
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatListScreen;