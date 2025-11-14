import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, CheckIcon, CameraIcon, GalleryIcon, TrashIcon } from '../../components/icons';
import { useChat } from '../../context/ChatContext';
import { useStorage } from '../../context/StorageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const EditGroupScreen: React.FC = () => {
  const { activeChat: chat, editGroup, reportError } = useChat();
  const { uploadFile, deleteAvatar } = useStorage();
  const { handleBack, handleNavigate } = useNavigation();
  const { theme } = useSettings();

  const [groupName, setGroupName] = useState(chat?.name || '');
  const [groupDescription, setGroupDescription] = useState(chat?.description || '');
  const [pendingPhoto, setPendingPhoto] = useState<File | 'remove' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(chat?.photo || null);
  const [isPhotoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const isDark = theme === 'dark';
  
  useEffect(() => {
    if (!chat) return;
    if (pendingPhoto === 'remove') setPreviewUrl(null);
    else if (pendingPhoto instanceof File) {
        const objectUrl = URL.createObjectURL(pendingPhoto);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    } else setPreviewUrl(chat.photo || null);
  }, [pendingPhoto, chat]);

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    inputBorder: isDark ? 'border-gray-600' : 'border-blue-500',
  };

  const hasChanged = useMemo(() => {
    if (!chat) return false;
    return groupName !== chat.name || pendingPhoto !== null || groupDescription !== (chat.description || '');
  }, [groupName, pendingPhoto, groupDescription, chat]);

  const handleSave = async () => {
    if (!hasChanged || isSaving || !chat) return;
    setIsSaving(true);
    let finalPhotoUrl = chat.photo || null;
    const oldPhotoUrl = chat.photo;

    try {
        if (pendingPhoto === 'remove') {
            finalPhotoUrl = null;
            if (oldPhotoUrl) await deleteAvatar(oldPhotoUrl);
        } else if (pendingPhoto instanceof File) {
            const newUrl = await uploadFile(pendingPhoto, 'group-avatars', chat.id);
            if (newUrl) {
                finalPhotoUrl = newUrl;
                if (oldPhotoUrl) await deleteAvatar(oldPhotoUrl);
            }
            else { 
                reportError("Upload failed to return a URL.");
                setIsSaving(false); 
                return; 
            }
        }
        await editGroup(chat.id, groupName, finalPhotoUrl, groupDescription);
        handleBack();
    } catch (error: any) {
        console.error("Error saving group:", error);
        reportError(`Failed to save group changes: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handlePhotoFromCamera = (photoBlob: Blob) => { if (photoBlob) setPendingPhoto(new File([photoBlob], "group-photo.jpg", { type: "image/jpeg" })); };
  const handleCameraClick = () => { setPhotoSheetOpen(false); handleNavigate('camera', { onPhotoTaken: handlePhotoFromCamera }); };
  const handleGalleryClick = () => {
    setPhotoSheetOpen(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) setPendingPhoto(target.files[0]);
    };
    input.click();
  };
  const handleRemovePhoto = () => { setPhotoSheetOpen(false); setPendingPhoto('remove'); };
  
  if (!chat) return null; // Handle case where chat is not available

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center justify-between p-3 shadow-md z-10`}>
        <div className="flex items-center space-x-4"><button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}><ArrowLeftIcon className="w-6 h-6" /></button><h1 className={`text-xl font-semibold ${colors.headerText}`}>Ubah</h1></div>
        <button onClick={handleSave} disabled={!hasChanged || isSaving} className={`p-2 ${colors.headerText} ${(!hasChanged || isSaving) ? 'opacity-50' : ''}`}><CheckIcon className="w-6 h-6" /></button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center">
            <button onClick={() => setPhotoSheetOpen(true)} className="relative w-24 h-24 mb-6 group">
                {previewUrl ? <img src={previewUrl} alt="Group" className="w-24 h-24 rounded-full object-cover" />
                : <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">{groupName ? groupName.charAt(0).toUpperCase() : ''}</div>}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><CameraIcon className="w-8 h-8 text-white" /></div>
            </button>
            <div className={`w-full ${colors.sectionBg} p-4 rounded-lg shadow-sm`}>
                <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className={`w-full bg-transparent outline-none text-lg border-b-2 py-1 ${colors.inputBorder} ${colors.primaryText} focus:${colors.inputBorder}`} />
                <textarea value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} placeholder="Deskripsi (opsional)" className={`w-full bg-transparent outline-none text-base mt-2 py-1 border-b-2 ${colors.inputBorder} ${colors.primaryText} focus:${colors.inputBorder} resize-none`} rows={2} />
                <p className={`text-sm ${colors.linkColor} mt-3 cursor-pointer`} onClick={() => handleNavigate('groupMembers')}>{chat.members?.length} anggota</p>
            </div>
        </div>
      </main>

      {isPhotoSheetOpen && <>
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setPhotoSheetOpen(false)}></div>
        <div className={`fixed bottom-0 left-0 right-0 ${colors.sectionBg} rounded-t-2xl p-4 z-50`}>
            <h2 className={`font-semibold text-lg mb-4 text-center ${colors.primaryText}`}>Atur Foto Grup</h2>
            <ul className="space-y-2">
                <li onClick={handleCameraClick} className={`flex items-center p-3 space-x-4 cursor-pointer rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><CameraIcon className="w-6 h-6" /><span className={colors.primaryText}>Ambil Foto</span></li>
                <li onClick={handleGalleryClick} className={`flex items-center p-3 space-x-4 cursor-pointer rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><GalleryIcon className="w-6 h-6" /><span className={colors.primaryText}>Pilih dari Galeri</span></li>
                {previewUrl && <li onClick={handleRemovePhoto} className={`flex items-center p-3 space-x-4 cursor-pointer rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}><TrashIcon className="w-6 h-6 text-red-500" /><span className="text-red-500">Hapus Foto</span></li>}
            </ul>
        </div>
      </>}
    </div>
  );
};

export default EditGroupScreen;