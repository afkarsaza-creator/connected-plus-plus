import React, { useMemo } from 'react';
import { ArrowLeftIcon, NewCallIcon, MoreVertIcon, TrashIcon, CallIncomingIcon, CallIcon, ChatAvatar, VideoIcon } from '../../components/icons';
import type { Call } from '../../types';
import { useUser } from '../../context/UserContext';
import { useCall } from '../../context/CallContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useModalState } from '../../hooks/useModalState.ts';
import VirtualList from '../../components/VirtualList.tsx';

const CallsScreen: React.FC = () => {
  const { handleBack, handleNavigate } = useNavigation();
  const { theme } = useSettings();
  const { users } = useUser();
  const { calls, deleteAllCalls, startCall } = useCall();
  
  const menu = useModalState();
  const deleteConfirmDialog = useModalState();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-white',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    linkColor: isDark ? 'text-blue-400' : 'text-[#527da3]',
    fabBg: 'bg-blue-500',
    fabIcon: 'text-white',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    menuBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
    menuHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
    dialogBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
    dialogText: isDark ? 'text-gray-300' : 'text-gray-600',
  };
  
  const callData = useMemo(() => calls.map(call => ({ ...call, user: users.find(u => u.id === call.userId) })).filter(call => call.user), [calls, users]);
  
  const handleDeleteConfirm = () => { deleteAllCalls(); deleteConfirmDialog.close(); }

  const renderCallItem = (call: (typeof callData)[0]) => {
    if (!call.user) return null;
    return (
      <li key={call.id} onClick={() => startCall(call.user!.id, call.callType)} className={`flex items-center space-x-4 p-2 cursor-pointer ${isDark ? 'hover:bg-[#2a3744]' : 'hover:bg-gray-100'}`}>
        <ChatAvatar avatar={call.user.avatar} size="large" />
        <div className={`flex-1 flex items-center justify-between border-b ${colors.divider} pb-2`}>
          <div>
            <p className={`font-semibold ${colors.primaryText}`}>{call.user.name}</p>
            <div className="flex items-center space-x-1 mt-1">
              <CallIncomingIcon className={`w-4 h-4 ${call.type === 'missed' ? 'text-red-500' : 'text-green-500'}`} />
              <p className={`text-sm ${colors.secondaryText}`}>{call.timestamp}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); startCall(call.user!.id, call.callType); }} className={`p-2 ${colors.linkColor}`}>
            {call.callType === 'video' ? <VideoIcon className="w-6 h-6" /> : <CallIcon className="w-6 h-6" />}
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center justify-between p-3 shadow-md z-10`}>
        <div className="flex items-center"><button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button><h1 className={`text-xl font-semibold ml-4 ${colors.headerText}`}>Panggilan</h1></div>
        {calls.length > 0 && <div className="relative">
            <button onClick={menu.toggle} className={`p-2 ${colors.headerText}`}><MoreVertIcon className="w-6 h-6" /></button>
            {menu.isOpen && <>
                <div className="fixed inset-0 z-20" onClick={menu.close}></div>
                <div className={`absolute right-0 mt-2 w-56 ${colors.menuBg} rounded-md shadow-lg py-1 z-30`}>
                    <button onClick={() => { menu.close(); deleteConfirmDialog.open(); }} className={`w-full text-left flex items-center px-4 py-2 text-sm text-red-500 ${colors.menuHover}`}><TrashIcon className="w-5 h-5 mr-3" /><span>Hapus Semua</span></button>
                </div>
            </>}
        </div>}
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <div onClick={() => handleNavigate('newCallContacts')} className={`flex items-center space-x-4 p-4 cursor-pointer border-b ${colors.divider} ${isDark ? 'hover:bg-[#2a3744]' : 'hover:bg-gray-100'}`}><NewCallIcon className={`w-7 h-7 ${colors.linkColor}`} /><span className={`text-base font-semibold ${colors.linkColor}`}>Mulai Panggilan Baru</span></div>
        {callData.length > 0 && 
            <VirtualList
                items={callData}
                renderItem={renderCallItem}
                itemHeight={80} // Perkiraan tinggi untuk setiap item panggilan
                className="pt-2"
            />
        }
      </main>
      <button onClick={() => handleNavigate('newCallContacts')} className={`absolute bottom-5 right-5 w-14 h-14 ${colors.fabBg} rounded-full flex items-center justify-center shadow-lg`}><NewCallIcon className={`w-7 h-7 ${colors.fabIcon}`} /></button>
      {deleteConfirmDialog.isOpen && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40"><div className={`${colors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm text-left`}><h2 className={`text-lg font-bold mb-2 ${colors.primaryText}`}>Hapus riwayat</h2><p className={`${colors.dialogText} mb-6`}>Yakin ingin hapus?</p><div className="flex justify-end space-x-6"><button onClick={deleteConfirmDialog.close} className={`font-semibold ${colors.linkColor}`}>BATAL</button><button onClick={handleDeleteConfirm} className={`font-semibold text-red-500`}>HAPUS</button></div></div></div>}
    </div>
  );
};

export default CallsScreen;