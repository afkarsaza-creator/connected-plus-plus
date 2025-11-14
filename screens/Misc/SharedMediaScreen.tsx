import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, FileIcon, LinkIcon } from '../../components/icons';
import type { Chat, Message } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

interface SharedMediaScreenProps {
  chat: Chat;
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

const SharedMediaScreen: React.FC<SharedMediaScreenProps> = ({ chat }) => {
  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links'>('media');
  const { messagesByChat } = useChat();
  const { handleBack } = useNavigation();
  const { theme } = useSettings();

  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    tabText: isDark ? 'text-gray-400' : 'text-gray-500',
    tabActiveText: isDark ? 'text-blue-400' : 'text-blue-500',
    tabActiveBorder: isDark ? 'bg-blue-400' : 'bg-blue-500',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    primaryText: isDark ? 'text-white' : 'text-black',
    itemBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
  };

  const messages = useMemo(() => messagesByChat[chat.id] || [], [messagesByChat, chat.id]);

  const photoMessages = useMemo(() => messages.filter(m => m.content.type === 'photo'), [messages]);
  const fileMessages = useMemo(() => messages.filter(m => m.content.type === 'file'), [messages]);
  const linkMessages = useMemo(() => {
      return messages.reduce((acc, msg) => {
          if (msg.content.type === 'text') {
              const links = msg.content.text.match(urlRegex);
              if (links) {
                  links.forEach(link => acc.push({ url: link, message: msg }));
              }
          }
          return acc;
      }, [] as { url: string, message: Message }[]);
  }, [messages]);


  const TabButton: React.FC<{ label: string; active?: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-3 px-4 text-sm font-semibold relative ${active ? colors.tabActiveText : colors.tabText}`}>
        {label}
        {active && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.tabActiveBorder}`}></div>}
    </button>
  );
  
  const FileItem: React.FC<{ message: Message }> = ({ message }) => {
    if (message.content.type !== 'file') return null;
    const { url, fileName, fileSize } = message.content;
    const sender = chat.members?.find(m => m.id === message.senderId);

    return (
        <a href={url} download={fileName} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-3 p-3 border-b ${colors.divider} ${colors.itemBg}`}>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileIcon className="w-7 h-7 text-blue-400" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className={`font-semibold truncate ${colors.primaryText}`}>{fileName}</p>
                <p className={`text-sm ${colors.secondaryText}`}>{fileSize} • {sender?.name.split(' ')[0]}</p>
            </div>
        </a>
    );
  };

  const LinkItem: React.FC<{ link: { url: string, message: Message } }> = ({ link }) => {
    const { url, message } = link;
    const sender = chat.members?.find(m => m.id === message.senderId);
    
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-start space-x-3 p-3 border-b ${colors.divider} ${colors.itemBg}`}>
            <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-7 h-7 text-gray-400" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className={`font-semibold truncate text-blue-400`}>{url}</p>
                {message.content.type === 'text' && <p className={`text-sm mt-1 ${colors.secondaryText} truncate`}>{message.content.text}</p>}
                <p className={`text-xs mt-1 ${colors.secondaryText}`}>{sender?.name.split(' ')[0]} at {message.timestamp}</p>
            </div>
        </a>
    );
  };
  
  const renderContent = () => {
      switch(activeTab) {
          case 'media':
              return photoMessages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                      {[...photoMessages].reverse().map(msg => (
                          msg.content.type === 'photo' && (
                              <img key={msg.id} src={msg.content.url} alt="Shared media" className="aspect-square object-cover w-full h-full" />
                          )
                      ))}
                  </div>
              ) : <div className="flex items-center justify-center h-full"><p className={colors.secondaryText}>No media shared yet.</p></div>;
          case 'files':
              return fileMessages.length > 0 ? (
                  <div>
                      {[...fileMessages].reverse().map(msg => <FileItem key={msg.id} message={msg} />)}
                  </div>
              ) : <div className="flex items-center justify-center h-full"><p className={colors.secondaryText}>No files shared yet.</p></div>;
          case 'links':
              return linkMessages.length > 0 ? (
                  <div>
                      {[...linkMessages].reverse().map((link, index) => <LinkItem key={`${link.message.id}-${index}`} link={link} />)}
                  </div>
              ) : <div className="flex items-center justify-center h-full"><p className={colors.secondaryText}>No links shared yet.</p></div>;
          default: return null;
      }
  }

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-2 sm:p-3 flex items-center sticky top-0 z-10 space-x-2 sm:space-x-4`}>
        <button onClick={handleBack} className={`p-2 -ml-2 sm:ml-0 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
        <div className="min-w-0">
            <h1 className={`text-xl font-semibold ${colors.headerText} truncate`}>{chat.name}</h1>
            <p className={`text-sm ${colors.headerText}`}>Shared Media</p>
        </div>
      </header>

      <div className={`flex items-center border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${isDark ? 'bg-[#222e3a]' : 'bg-white'}`}>
         <TabButton label={`Media (${photoMessages.length})`} active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
         <TabButton label={`Files (${fileMessages.length})`} active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
         <TabButton label={`Links (${linkMessages.length})`} active={activeTab === 'links'} onClick={() => setActiveTab('links')} />
      </div>
      
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default SharedMediaScreen;
