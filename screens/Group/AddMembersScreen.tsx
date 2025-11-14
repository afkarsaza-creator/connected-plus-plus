import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, SearchIcon, CheckIcon, ChatAvatar, LinkIcon } from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import VirtualList from '../../components/VirtualList.tsx';

const AddMembersScreen: React.FC = () => {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const { users } = useUser();
  const { activeChat, addMembersToGroup } = useChat();
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  
  const isDark = theme === 'dark';

  const chat = activeChat;

  const availableUsers = useMemo(() => {
    if (!chat) return [];
    const memberIds = new Set(chat.members?.map(m => m.id));
    return users.filter(u => !memberIds.has(u.id));
  }, [users, chat]);

  if (!chat) return null;

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    fabBg: 'bg-blue-500',
    selectedCheckBg: 'bg-green-500',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
  };
  

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return newSet;
    });
  };
  
  const handleAdd = () => {
    if (selectedUserIds.size > 0) {
      addMembersToGroup(chat.id, Array.from(selectedUserIds));
      handleBack();
    }
  };

  const renderUserItem = (user: User) => (
    <div key={user.id} onClick={() => toggleUserSelection(user.id)} className="flex items-center space-x-4 px-2 cursor-pointer">
      <div className="relative"><ChatAvatar avatar={user.avatar} size="large" />{selectedUserIds.has(user.id) && 
              <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${colors.selectedCheckBg} flex items-center justify-center border-2 ${isDark ? 'border-[#18222d]' : 'border-white'}`}>
                  <CheckIcon className="w-4 h-4 text-white" />
              </div>
          }</div>
      <div className={`flex-1 border-b ${colors.divider} py-3`}><p className={`font-semibold ${colors.primaryText}`}>{user.name}</p><p className={`text-sm ${colors.secondaryText}`}>{user.lastSeen}</p></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-100">
        <header className={`${colors.headerBg} flex items-center justify-between p-3 shadow-md z-10`}>
            <div className="flex items-center space-x-4"><button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button><h1 className={`text-xl font-semibold ${colors.headerText}`}>Tambah Anggota</h1></div>
            <button className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
        </header>
      
      <main className={`flex-1 flex flex-col ${colors.screenBg}`}>
        <div className={`flex items-center space-x-6 px-4 py-3 cursor-pointer border-b ${colors.divider}`}><LinkIcon className={`w-6 h-6 ${colors.linkColor}`} /><span className={`text-base ${colors.linkColor}`}>Undang ke Grup via Tautan</span></div>
        <div className="flex-1 overflow-y-auto">
            {availableUsers.length > 0 ? (
                <VirtualList
                    items={availableUsers}
                    renderItem={renderUserItem}
                    itemHeight={84} // Perkiraan tinggi untuk setiap item pengguna
                />
            ) : (
                <p className={`text-center p-8 ${colors.secondaryText}`}>Tidak ada pengguna untuk ditambahkan.</p>
            )}
        </div>
      </main>

      {selectedUserIds.size > 0 && <button onClick={handleAdd} className={`absolute bottom-5 right-5 w-14 h-14 ${colors.fabBg} rounded-full flex items-center justify-center shadow-lg`}><CheckIcon className="w-7 h-7 text-white" /></button>}
    </div>
  );
};

export default AddMembersScreen;