import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, SearchIcon, ArrowRightIcon, CheckIcon, ChatAvatar } from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const NewGroupScreen: React.FC = () => {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const { users } = useUser();
  const { setNewGroupMembers } = useChat();
  const { handleBack, handleNavigate } = useNavigation();
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    fabBg: 'bg-blue-500',
    selectedChipBg: isDark ? 'bg-gray-700' : 'bg-gray-200',
    selectedCheckBg: 'bg-green-500',
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return newSet;
    });
  };
  
  const selectedUsers = useMemo(() => {
    return Array.from(selectedUserIds).map(id => users.find(user => user.id === id)).filter(Boolean) as User[];
  }, [selectedUserIds, users]);
  
  const handleNext = () => {
      if (selectedUsers.length > 0) {
          setNewGroupMembers(selectedUsers);
          handleNavigate('groupInfo');
      }
  }

  const UserItem: React.FC<{ user: User; isSelected: boolean; onToggle: () => void; }> = ({ user, isSelected, onToggle }) => (
    <div onClick={onToggle} className="flex items-center space-x-4 px-2 cursor-pointer">
      <div className="relative">
        <ChatAvatar avatar={user.avatar} size="large" />
        {isSelected && (
          <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full ${colors.selectedCheckBg} flex items-center justify-center border-2 ${isDark ? 'border-[#18222d]' : 'border-white'}`}>
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <div className={`flex-1 border-b ${colors.divider} py-3`}>
        <p className={`font-semibold ${colors.primaryText}`}>{user.name}</p>
        <p className={`text-sm ${colors.secondaryText}`}>{user.lastSeen}</p>
      </div>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col bg-gray-100">
        <header className={`${colors.headerBg} flex flex-col pt-3 shadow-md z-10`}>
          <div className="flex items-center justify-between w-full px-3">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
              <div>
                <h1 className={`text-xl font-semibold ${colors.headerText}`}>Grup Baru</h1>
                {selectedUsers.length > 0 && <p className={`text-sm ${colors.headerText}`}>{selectedUsers.length} anggota</p>}
              </div>
            </div>
            <button className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
          </div>
        </header>
      
      <main className={`flex-1 overflow-y-auto ${colors.screenBg}`}>
        {users.map(user => (
          <UserItem key={user.id} user={user} isSelected={selectedUserIds.has(user.id)} onToggle={() => toggleUserSelection(user.id)} />
        ))}
      </main>

      {selectedUsers.length > 0 && (
          <button onClick={handleNext} className={`absolute bottom-5 right-5 w-14 h-14 ${colors.fabBg} rounded-full flex items-center justify-center shadow-lg`}>
            <ArrowRightIcon className="w-6 h-6 text-white" />
          </button>
      )}
    </div>
  );
};
export default NewGroupScreen;