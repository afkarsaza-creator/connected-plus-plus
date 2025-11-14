import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, MoreVertIcon, ChatAvatar, BlockUserIcon } from '../../components/icons';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const BlockedUsersScreen: React.FC = () => {
  const { handleBack, handleNavigate } = useNavigation();
  const { theme } = useSettings();
  const { allUsers, blockedUserIds, unblockUser } = useUser();

  const [showUnblockFor, setShowUnblockFor] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    descriptionText: isDark ? 'text-gray-500' : 'text-gray-600',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    headerIcons: 'text-white',
    divider: isDark ? 'border-black/20' : 'border-gray-200',
    hoverBg: isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50',
    menuBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
    menuHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
  };

  const blockedUsers = useMemo(() => {
    const blockedIdsSet = new Set(blockedUserIds);
    return allUsers.filter(user => blockedIdsSet.has(user.id));
  }, [allUsers, blockedUserIds]);

  const handleUnblock = (userId: string) => {
    unblockUser(userId);
    setShowUnblockFor(null);
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center sticky top-0 z-10 space-x-4`}>
        <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerIcons}`}><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className={`text-xl font-semibold ${colors.headerIcons}`}>Pengguna Diblokir</h1>
      </header>

      <div className={`${colors.sectionBg} mt-2`}>
        <div 
          onClick={() => handleNavigate('blockUserSelection')}
          className={`flex items-center space-x-6 px-4 py-3 cursor-pointer ${colors.hoverBg}`}
        >
          <BlockUserIcon className={`w-6 h-6 ${colors.linkColor}`} />
          <span className={`text-base ${colors.linkColor}`}>Blokir pengguna</span>
        </div>
      </div>
      <p className={`text-sm ${colors.descriptionText} px-4 py-3`}>
        Pengguna yang diblokir tidak dapat mengirimi Anda pesan atau menambahkan Anda ke grup. Mereka tidak akan melihat foto profil, cerita, status daring, dan terakhir dilihat Anda.
      </p>

      {blockedUsers.length > 0 && (
        <>
          <h3 className={`${colors.linkColor} font-semibold px-4 pt-2 pb-2 text-sm`}>
            {blockedUsers.length} pengguna diblokir
          </h3>
          <div className={colors.sectionBg}>
            {blockedUsers.map((user, index) => (
              <div key={user.id} className="relative">
                <div className={`flex items-center px-4 py-2.5 ${index > 0 ? `border-t ${colors.divider}` : ''}`}>
                  <ChatAvatar avatar={user.avatar} size="large" />
                  <div className="flex-1 ml-4">
                    <p className={`font-semibold ${colors.primaryText}`}>{user.name}</p>
                    <p className={`text-sm ${colors.secondaryText}`}>{user.phone || `@${user.username}`}</p>
                  </div>
                  <button onClick={() => setShowUnblockFor(user.id)} className={`p-2 ${colors.secondaryText}`}>
                    <MoreVertIcon className="w-6 h-6" />
                  </button>
                </div>
                {showUnblockFor === user.id && (
                  <div className={`absolute right-4 top-12 ${colors.menuBg} rounded-md shadow-lg py-1 z-20 w-36`}>
                    <button 
                      onClick={() => handleUnblock(user.id)}
                      className={`block w-full text-left px-4 py-2 text-red-500 ${colors.menuHover}`}
                    >
                      Buka Blokir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
           {showUnblockFor && <div className="fixed inset-0 z-10" onClick={() => setShowUnblockFor(null)} />}
        </>
      )}
    </div>
  );
};

export default BlockedUsersScreen;