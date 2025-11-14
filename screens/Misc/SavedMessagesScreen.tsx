import React, { useState } from 'react';
import type { SavedMessage, User } from '../../types';
import { ArrowLeftIcon, ChatAvatar, MoreVertIcon, PlayIcon, TrashIcon, SavedIcon } from '../../components/icons';
import { useSavedMessages } from '../../context/SavedMessagesContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const SavedMessagesScreen: React.FC = () => {
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  const { userProfile: currentUser } = useAuth();
  const { savedMessages, deleteSavedMessage } = useSavedMessages();
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const isDark = theme === 'dark';

  if (!currentUser) return null;

  const colors = {
    screenBg: isDark ? 'bg-[#0E1621]' : 'bg-[#C8D7E8]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    bubbleBg: isDark ? 'bg-[#182533]' : 'bg-white',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    menuBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
    menuHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
  };

  const SavedMessageItem: React.FC<{ savedMessage: SavedMessage }> = ({ savedMessage }) => {
    const { originalMessage, fromName, fromAvatar, id } = savedMessage;
    const { content, timestamp } = originalMessage;

    return (
      <div className="flex items-start space-x-3 my-2">
        <ChatAvatar avatar={currentUser.avatar} size="small" />
        <div className={`p-2 rounded-lg max-w-[80%] ${colors.bubbleBg} shadow-sm relative`}>
          <div className="flex items-center space-x-2 border-l-2 border-blue-400 pl-2">
            <ChatAvatar avatar={fromAvatar} size="small" />
            <div><p className={`font-semibold text-sm ${colors.linkColor}`}>{fromName}</p><p className={`text-xs ${colors.secondaryText}`}>Pesan Diteruskan</p></div>
          </div>
          <div className="mt-2 min-w-[200px]">
            {content.type === 'text' && <p className={`text-sm ${colors.primaryText}`}>{content.text}</p>}
            {content.type === 'photo' && <div><img src={content.url} alt="saved" className="rounded-lg max-w-full h-auto" />{content.caption && <p className={`mt-1 text-sm ${colors.primaryText}`}>{content.caption}</p>}</div>}
            {content.type === 'voice' && <div className="flex items-center space-x-2 cursor-pointer" onClick={() => new Audio(content.url).play()}><button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"><PlayIcon className="w-5 h-5" /></button><div className="flex-1 h-1 bg-gray-500/50 rounded-full"><div className="w-1/4 h-full bg-blue-500 rounded-full"></div></div><span className={`text-xs ${colors.secondaryText}`}>{content.duration}</span></div>}
          </div>
          <div className="flex justify-end mt-1"><span className={`text-xs ${colors.secondaryText}`}>{timestamp}</span></div>
          <button onClick={() => setActiveMenuId(id === activeMenuId ? null : id)} className={`absolute top-1 right-1 p-1 rounded-full ${colors.secondaryText} hover:bg-black/10`}><MoreVertIcon className="w-5 h-5" /></button>
          {activeMenuId === id && <div className={`absolute right-2 top-8 ${colors.menuBg} rounded-md shadow-lg py-1 z-20 w-36`}><button onClick={() => { deleteSavedMessage(id); setActiveMenuId(null); }} className={`w-full text-left flex items-center px-4 py-2 text-sm text-red-500 ${colors.menuHover}`}><TrashIcon className="w-5 h-5 mr-3" /><span>Hapus</span></button></div>}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center p-3 shadow-md z-10`}><button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button><div className="ml-4"><h1 className={`text-xl font-semibold ${colors.headerText}`}>Pesan Tersimpan</h1></div></header>
      <main className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {savedMessages.length === 0 ? <div className="text-center text-gray-400 m-auto"><div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-blue-100'}`}><SavedIcon className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-blue-500'}`} /></div><p>Tidak ada pesan tersimpan.</p><p className="text-sm">Teruskan pesan ke sini untuk menyimpannya.</p></div>
        : savedMessages.map(msg => <SavedMessageItem key={msg.id} savedMessage={msg} />)}
      </main>
      {activeMenuId && <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />}
    </div>
  );
};

export default SavedMessagesScreen;