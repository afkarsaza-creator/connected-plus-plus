import React, { useState } from 'react';
import { ArrowLeftIcon, SearchIcon, SendIcon, CheckIcon, ChatAvatar } from '../../components/icons';
import type { Message } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

interface ForwardMessageScreenProps {
  messageToForward: Message;
}

const ForwardMessageScreen: React.FC<ForwardMessageScreenProps> = ({ messageToForward }) => {
  const { chats, forwardMessage } = useChat();
  const { handleBack } = useNavigation();
  const { theme } = useSettings();

  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    fabBg: 'bg-blue-500',
    selectedCheckBg: 'bg-green-500',
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChatIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) newSet.delete(chatId);
      else newSet.add(chatId);
      return newSet;
    });
  };
  
  const handleForward = () => {
      if (selectedChatIds.size > 0 && messageToForward) {
          forwardMessage(messageToForward.content, Array.from(selectedChatIds));
          handleBack();
      }
  }

  const ChatItem: React.FC<{ chat: typeof chats[0]; isSelected: boolean; onToggle: () => void; }> = ({ chat, isSelected, onToggle }) => (
    <div onClick={onToggle} className="flex items-center space-x-4 px-2 cursor-pointer">
      <div className="relative"><ChatAvatar avatar={chat.avatar} photo={chat.photo} size="large" />{isSelected && <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${colors.selectedCheckBg} flex items-center justify-center border-2 ${isDark ? 'border-[#18222d]' : 'border-white'}`}><CheckIcon className="w-4 h-4 text-white" /></div>}</div>
      <div className={`flex-1 border-b ${colors.divider} py-3`}><p className={`font-semibold ${colors.primaryText}`}>{chat.name}</p><p className={`text-sm ${colors.secondaryText}`}>{chat.lastMessage}</p></div>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col bg-gray-100">
        <header className={`${colors.headerBg} flex items-center justify-between p-3 shadow-md z-10`}>
          <div className="flex items-center space-x-4"><button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button><div><h1 className={`text-xl font-semibold ${colors.headerText}`}>Forward</h1>{selectedChatIds.size > 0 && <p className={`text-sm ${colors.headerText}`}>{selectedChatIds.size} selected</p>}</div></div>
          <button className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
        </header>
      
      <main className={`flex-1 overflow-y-auto ${colors.screenBg}`}>
        {chats.map(chat => <ChatItem key={chat.id} chat={chat} isSelected={selectedChatIds.has(chat.id)} onToggle={() => toggleChatSelection(chat.id)} />)}
      </main>

      {selectedChatIds.size > 0 && <button onClick={handleForward} className={`absolute bottom-5 right-5 w-14 h-14 ${colors.fabBg} rounded-full flex items-center justify-center shadow-lg`}><SendIcon className="w-6 h-6 text-white" /></button>}
    </div>
  );
};
export default ForwardMessageScreen;