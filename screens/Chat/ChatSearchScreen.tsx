import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, ChatAvatar } from '../../components/icons';
import type { Message } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';

const ChatSearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const { activeChat, messagesByChat } = useChat();
  const { theme } = useSettings();
  const { handleBack, setHighlightedMessageId } = useNavigation();

  const chat = activeChat;
  // FIX: Tentukan messages sebelum useMemo untuk memastikan hook tidak dipanggil secara kondisional.
  const messages = chat ? messagesByChat[chat.id] || [] : [];

  const filteredMessages = useMemo(() => {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    return messages.filter(msg =>
      msg.content.type === 'text' && msg.content.text.toLowerCase().includes(lowerCaseQuery)
    );
  }, [query, messages]);

  // Sekarang return lebih awal aman.
  if (!chat) return null;

  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    placeholder: isDark ? 'placeholder-gray-400' : 'placeholder-gray-200',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-600',
    itemHover: isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
  };
  
  const handleMessageSelect = (messageId: string) => {
    handleBack(); 
    setHighlightedMessageId(messageId);
    setTimeout(() => setHighlightedMessageId(null), 2500);
  };

  const SearchResultItem: React.FC<{ message: Message }> = ({ message }) => {
    const sender = chat.members?.find(m => m.id === message.senderId);
    if (!sender || message.content.type !== 'text') return null;

    return (
      <li onClick={() => handleMessageSelect(message.id)} className={`flex items-start space-x-3 p-3 cursor-pointer ${colors.itemHover}`}>
        <ChatAvatar avatar={sender.avatar} size="small" />
        <div className={`flex-1 border-b ${colors.divider} pb-2`}>
            <div className="flex justify-between items-center">
                <p className={`font-semibold ${colors.primaryText}`}>{sender.name}</p>
                <p className={`text-xs ${colors.secondaryText}`}>{message.timestamp}</p>
            </div>
            <p className={`mt-1 text-sm ${colors.secondaryText} break-words`}>{message.content.text}</p>
        </div>
      </li>
    );
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center p-2 shadow-md z-10`}>
        <button onClick={handleBack} className={`p-2 ${colors.headerText}`}>
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <input
          type="text"
          placeholder={`Cari di "${chat.name}"`}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`flex-1 bg-transparent text-lg ${colors.headerText} ${colors.placeholder} outline-none px-2`}
        />
      </header>
      <main className="flex-1 overflow-y-auto">
        {query && filteredMessages.length > 0 ? (
          <ul>
            {filteredMessages.map(msg => <SearchResultItem key={msg.id} message={msg} />)}
          </ul>
        ) : query ? (
          <p className={`text-center p-8 ${colors.secondaryText}`}>Tidak ada pesan yang ditemukan</p>
        ) : (
          <p className={`text-center p-8 ${colors.secondaryText}`}>Cari pesan di obrolan ini.</p>
        )}
      </main>
    </div>
  );
};

export default ChatSearchScreen;