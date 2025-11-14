import React from 'react';
import { ArrowLeftIcon, SearchIcon, ChatAvatar } from '../../components/icons';
import type { User } from '../../types';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useModalState } from '../../hooks/useModalState.ts';

const BlockUserSelectionScreen: React.FC = () => {
  const { allUsers, blockedUserIds, blockUser } = useUser();
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  const blockDialog = useModalState<User>();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    itemHover: isDark ? 'hover:bg-[#2a3744]' : 'hover:bg-gray-100',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    dialogBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
    dialogText: isDark ? 'text-gray-300' : 'text-gray-600',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
  };

  const availableUsersToBlock = React.useMemo(() => {
    const blockedIdsSet = new Set(blockedUserIds);
    return allUsers.filter(user => !blockedIdsSet.has(user.id));
  }, [allUsers, blockedUserIds]);

  const handleBlockConfirm = () => {
    if (blockDialog.payload) {
      blockUser(blockDialog.payload.id);
      blockDialog.close();
      handleBack();
    }
  };
  
  return (
    <div className={`h-full flex flex-col ${colors.screenBg} relative`}>
      <header className={`${colors.headerBg} p-3 flex items-center justify-between sticky top-0 z-10`}>
        <div className="flex items-center space-x-4">
          <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
          <h1 className={`text-xl font-semibold ${colors.headerText}`}>Blokir Pengguna</h1>
        </div>
        <button className={`p-2 ${colors.headerText}`}><SearchIcon className="w-6 h-6" /></button>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        {availableUsersToBlock.map(user => (
          <div key={user.id} onClick={() => blockDialog.open(user)} className={`flex items-center p-3 ${colors.itemHover} cursor-pointer`}>
            <ChatAvatar avatar={user.avatar} size="large" />
            <div className={`flex-1 ml-4 border-b ${colors.divider} pb-3`}>
              <div className="flex justify-between items-center">
                <p className={`font-semibold ${colors.primaryText}`}>{user.name}</p>
              </div>
              <p className={`text-sm ${colors.secondaryText} truncate w-11/12 mt-1`}>{user.phone || `@${user.username}`}</p>
            </div>
          </div>
        ))}
      </main>

      {blockDialog.isOpen && blockDialog.payload && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20" role="dialog" aria-modal="true" aria-labelledby="block-dialog-title">
          <div className={`${colors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm`}>
            <h2 id="block-dialog-title" className={`text-lg font-bold mb-2 ${colors.primaryText}`}>Blokir pengguna</h2>
            <p className={`${colors.dialogText} mb-6`}>Anda yakin ingin memblokir {blockDialog.payload.name}?</p>
            <div className="flex justify-end space-x-6">
              <button onClick={blockDialog.close} className={`font-semibold ${colors.linkColor}`}>BATAL</button>
              <button onClick={handleBlockConfirm} className={`font-semibold text-red-500`}>BLOKIR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default BlockUserSelectionScreen;