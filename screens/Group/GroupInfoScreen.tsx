import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckIcon, CameraIcon, ChatAvatar, GalleryIcon } from '../../components/icons';
import { useChat } from '../../context/ChatContext';
import { useStorage } from '../../context/StorageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const GroupInfoScreen: React.FC = () => {
  const { newGroupMembers, createGroup } = useChat();
  const { uploadFile } = useStorage();
  const { handleBack, handleNavigate } = useNavigation();
  const { theme } = useSettings();

  const [groupName, setGroupName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPhotoSheetOpen, setPhotoSheetOpen] = useState(false);
  const isDark = theme === 'dark';
  
  useEffect(() => {
    if (photoFile) {
        const objectUrl = URL.createObjectURL(photoFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(null);
  }, [photoFile]);

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    fabBg: 'bg-blue-500',
    inputBorder: isDark ? 'border-gray-600' : 'border-blue-500',
    placeholderText: isDark ? 'placeholder-gray-500' : 'placeholder-gray-400',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    gapBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
  };
  
  const handleCreate = () => {
      if (groupName.trim()) {
          createGroup(groupName, photoFile);
      }
  };
  
  const handleFileSelect = (file: File) => {
    setPhotoFile(file);
    setPhotoSheetOpen(false);
  };
  
  const onPhotoTaken = (photoBlob: Blob) => {
    if (photoBlob) {
        const file = new File([photoBlob], "group-photo.jpg", { type: "image/jpeg" });
        handleFileSelect(file);
    }
  };

  const handleCameraClick = () => {
    setPhotoSheetOpen(false);
    handleNavigate('camera', { onPhotoTaken: onPhotoTaken });
  };

  const handleGalleryClick = () => {
    setPhotoSheetOpen(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) handleFileSelect(target.files[0]);
    };
    input.click();
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center p-3 shadow-md z-10 space-x-4`}>
        <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button>
        <h1 className={`text-xl font-semibold ${colors.headerText}`}>Grup Baru</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className={`p-4 flex items-center space-x-4 ${colors.sectionBg}`}>
          <button onClick={() => setPhotoSheetOpen(true)} className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            {previewUrl ? <img src={previewUrl} alt="Group" className="w-16 h-16 rounded-full object-cover" /> : <CameraIcon className="w-8 h-8 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Nama grup" className={`w-full bg-transparent outline-none text-lg border-b-2 py-1 ${colors.inputBorder} ${colors.primaryText} ${colors.placeholderText}`} />
            <p className={`text-sm ${colors.secondaryText} mt-1 truncate`}>{newGroupMembers.map(m => m.name.split(' ')[0]).join(', ')}</p>
          </div>
        </div>
        <div className={`${colors.gapBg} h-2`}></div>
        <div>
            <h2 className={`px-4 py-2 font-semibold ${colors.secondaryText}`}>{newGroupMembers.length} anggota</h2>
            <div className={colors.sectionBg}>
                {newGroupMembers.map((member, index) => (
                    <div key={member.id} className={`flex items-center space-x-4 px-2 ${index > 0 ? `border-t ${colors.divider}` : ''}`}>
                      <ChatAvatar avatar={member.avatar} size="large" />
                      <div className="py-3"><p className={`font-semibold ${colors.primaryText}`}>{member.name}</p><p className={`text-sm ${colors.secondaryText}`}>{member.lastSeen}</p></div>
                    </div>
                ))}
            </div>
        </div>
      </main>

       <button onClick={handleCreate} disabled={!groupName.trim()} className={`absolute bottom-5 right-5 w-14 h-14 ${colors.fabBg} rounded-full flex items-center justify-center shadow-lg disabled:opacity-50`}>
          <CheckIcon className="w-7 h-7 text-white" />
       </button>

      {isPhotoSheetOpen && <>
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setPhotoSheetOpen(false)}></div>
        <div className={`fixed bottom-0 left-0 right-0 ${colors.sectionBg} rounded-t-2xl p-4 z-50`}>
            <div className="w-10 h-1 bg-gray-400 rounded-full mx-auto mb-4"></div>
            <h2 className={`font-semibold text-lg mb-4 text-center ${colors.primaryText}`}>Atur Foto Grup</h2>
            <ul className="space-y-2">
                <li onClick={handleCameraClick} className={`flex items-center p-3 space-x-4 cursor-pointer rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><CameraIcon className={`w-6 h-6 ${colors.secondaryText}`} /><span className={colors.primaryText}>Ambil Foto</span></li>
                <li onClick={handleGalleryClick} className={`flex items-center p-3 space-x-4 cursor-pointer rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><GalleryIcon className={`w-6 h-6 ${colors.secondaryText}`} /><span className={colors.primaryText}>Pilih dari Galeri</span></li>
            </ul>
        </div>
      </>}
    </div>
  );
};

export default GroupInfoScreen;