import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, CheckIcon, CameraIcon, GalleryIcon, TrashIcon, SpinnerIcon } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useModalState } from '../../hooks/useModalState.ts';

interface ProfileInfoScreenProps {}

const getValidDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
};

const ProfileInfoScreen: React.FC<ProfileInfoScreenProps> = () => {
  const { userProfile, updateProfile, setAlert } = useAuth();
  const { uploadFile, deleteAvatar } = useStorage();
  const { handleBack, handleNavigate } = useNavigation();
  const { theme } = useSettings();
  const photoSheet = useModalState();

  // Inisialisasi state sebagai kosong, akan diisi oleh useEffect
  const [currentFirstName, setCurrentFirstName] = useState('');
  const [currentLastName, setCurrentLastName] = useState('');
  const [currentBio, setCurrentBio] = useState('');
  const [currentBirthday, setCurrentBirthday] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoJustChanged, setPhotoJustChanged] = useState(false);

  // Efek untuk menyinkronkan semua state lokal dari konteks userProfile
  useEffect(() => {
    if (userProfile) {
      setCurrentFirstName(userProfile.name.split(' ')[0] || '');
      setCurrentLastName(userProfile.name.split(' ').slice(1).join(' ') || '');
      setCurrentBio(userProfile.bio || '');
      setCurrentBirthday(getValidDate(userProfile.birthday));
      
      // Hanya perbarui URL pratinjau jika kita tidak sedang mengunggah
      // untuk menghindari menimpa URL blob lokal dengan URL avatar lama dari konteks.
      if (!isUploading) {
        setPreviewUrl((typeof userProfile.avatar === 'object' && userProfile.avatar.photo) || null);
      }
    }
  }, [userProfile]);
  
  const isDark = theme === 'dark';

  const hasUnsavedChanges = useMemo(() => {
    if (!userProfile) return false;
    const nameParts = userProfile.name.split(' ');
    const originalFirstName = nameParts[0] || '';
    const originalLastName = nameParts.slice(1).join(' ') || '';

    const textChanged = currentFirstName !== originalFirstName || 
           currentLastName !== originalLastName || 
           currentBio !== (userProfile.bio || '') ||
           currentBirthday !== getValidDate(userProfile.birthday);
    return textChanged || photoJustChanged;
  }, [currentFirstName, currentLastName, currentBio, currentBirthday, userProfile, photoJustChanged]);
  
  const handlePhotoUpdate = async (photoAction: File | 'remove') => {
      if (isUploading || !userProfile) return;
      
      setIsUploading(true);
      photoSheet.close();

      const originalAvatarUrl = (typeof userProfile.avatar === 'object' && userProfile.avatar.photo) || null;

      try {
          let newAvatarUrl: string | null = originalAvatarUrl;

          if (photoAction === 'remove') {
              newAvatarUrl = null;
              if (originalAvatarUrl) await deleteAvatar(originalAvatarUrl);
          } else if (photoAction instanceof File) {
              const localUrl = URL.createObjectURL(photoAction);
              setPreviewUrl(localUrl);

              const uploadedUrl = await uploadFile(photoAction, 'profile-avatars', userProfile.id);
              if (uploadedUrl) {
                  newAvatarUrl = uploadedUrl;
                  if (originalAvatarUrl && uploadedUrl !== originalAvatarUrl) {
                    await deleteAvatar(originalAvatarUrl);
                  }
              } else {
                  throw new Error("Upload failed to return a URL.");
              }
          }

          if (newAvatarUrl !== originalAvatarUrl) {
              setPhotoJustChanged(true); // <-- FIX: Atur state SEBELUM panggilan async
              await updateProfile({ avatar_url: newAvatarUrl });
              setAlert({ message: 'Foto profil berhasil diperbarui.', type: 'success' });
          }
      } catch (error: any) {
          console.error("Error updating profile photo:", error);
          setAlert({ message: `Gagal memperbarui foto: ${error.message}`, type: 'error' });
          setPreviewUrl(originalAvatarUrl); // Kembalikan jika gagal
          setPhotoJustChanged(false); // Kembalikan state jika gagal
      } finally {
          setIsUploading(false);
      }
  };


  const handleSave = async () => {
    if (!hasUnsavedChanges || isSaving || !userProfile) return;
    
    setIsSaving(true);
    try {
        // Hanya kirim pembaruan teks jika memang ada perubahan
        const nameParts = userProfile.name.split(' ');
        const originalFirstName = nameParts[0] || '';
        const originalLastName = nameParts.slice(1).join(' ') || '';
        const textChanged = currentFirstName !== originalFirstName || 
                            currentLastName !== originalLastName || 
                            currentBio !== (userProfile.bio || '') ||
                            currentBirthday !== getValidDate(userProfile.birthday);

        if (textChanged) {
            const dbUpdates: { [key: string]: any } = {
                first_name: currentFirstName,
                last_name: currentLastName,
                bio: currentBio,
                birth_date: currentBirthday || null,
            };
            await updateProfile(dbUpdates);
        }
        
        // Selalu kembali setelah menyimpan, baik hanya foto maupun teks yang berubah
        handleBack();
        
    } catch (error: any) {
        console.error("Error saving profile:", error);
        setAlert({ message: `Gagal menyimpan profil: ${error.message}`, type: 'error' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handlePhotoFromCamera = (blob: Blob) => { 
      if (blob) handlePhotoUpdate(new File([blob], "profile.jpg", { type: "image/jpeg" })); 
  };
  const handleCameraClick = () => { photoSheet.close(); handleNavigate('camera', { onPhotoTaken: handlePhotoFromCamera }); };
  const handleGalleryClick = () => {
    photoSheet.close();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) handlePhotoUpdate(target.files[0]);
    };
    input.click();
  };
  const handleRemovePhoto = () => { 
      photoSheet.close(); 
      handlePhotoUpdate('remove');
  };

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    descriptionText: isDark ? 'text-gray-500' : 'text-gray-600',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    headerIcons: 'text-white',
    inputBorder: isDark ? 'border-gray-600' : 'border-blue-500',
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center justify-between z-10`}>
        <div className="flex items-center space-x-4"><button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerIcons}`}><ArrowLeftIcon className="w-6 h-6" /></button><h1 className={`text-xl font-semibold ${colors.headerIcons}`}>Ubah Profil</h1></div>
        <button onClick={handleSave} disabled={!hasUnsavedChanges || isSaving} className={`p-2 ${colors.headerIcons} ${(!hasUnsavedChanges || isSaving) ? 'opacity-50' : ''}`}>
            {isSaving ? <SpinnerIcon className="w-6 h-6" /> : <CheckIcon className="w-6 h-6" />}
        </button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 flex justify-center">
            <button onClick={photoSheet.open} className="relative group w-24 h-24" disabled={isUploading}>
                {isUploading ? (
                     <div className="w-24 h-24 rounded-full bg-gray-700/50 flex items-center justify-center">
                        <SpinnerIcon className="w-8 h-8 text-white"/>
                    </div>
                ) : previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                    <div className={`w-24 h-24 ${colors.linkColor} rounded-full flex items-center justify-center text-4xl font-bold text-white`}>{(currentFirstName || ' ').charAt(0)}{(currentLastName || ' ').charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><CameraIcon className="w-8 h-8 text-white" /></div>
            </button>
        </div>
        <div className={`h-2 ${colors.screenBg}`}></div>
        <div className={colors.sectionBg}><div className="px-4 pt-3 pb-2"><p className={`text-sm font-semibold ${colors.linkColor}`}>Nama Anda</p><input type="text" value={currentFirstName} onChange={(e) => setCurrentFirstName(e.target.value)} placeholder="Nama depan" className={`w-full bg-transparent outline-none py-1.5 border-b ${colors.inputBorder} ${colors.primaryText}`} /><input type="text" value={currentLastName} onChange={(e) => setCurrentLastName(e.target.value)} placeholder="Nama belakang" className={`w-full bg-transparent outline-none py-1.5 border-b ${colors.inputBorder} ${colors.primaryText}`} /></div></div>
        <p className={`text-sm ${colors.descriptionText} px-4 py-3`}>Nama Anda akan terlihat oleh kontak.</p>
        <div className={`h-2 ${colors.screenBg}`}></div>
        <div className={colors.sectionBg}><div className="px-4 pt-3 pb-2"><p className={`text-sm font-semibold ${colors.linkColor}`}>Bio</p><textarea value={currentBio} onChange={(e) => setCurrentBio(e.target.value)} placeholder="Tentang dirimu" rows={3} maxLength={70} className={`w-full bg-transparent outline-none py-1.5 border-b ${colors.inputBorder} ${colors.primaryText} resize-none`} /></div></div>
        <p className={`text-sm ${colors.descriptionText} px-4 py-3`}>Contoh: 23 thn. desainer.</p>
        <div className={`h-2 ${colors.screenBg}`}></div>
        <div className={colors.sectionBg}><div className="px-4 pt-3 pb-2"><p className={`text-sm font-semibold ${colors.linkColor}`}>Tanggal Lahir</p><input type="date" value={currentBirthday} onChange={(e) => setCurrentBirthday(e.target.value)} className={`w-full bg-transparent outline-none py-1.5 border-b ${colors.inputBorder} ${colors.primaryText}`} style={{ colorScheme: isDark ? 'dark' : 'light' }} /></div></div>
      </main>
       {photoSheet.isOpen && <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={photoSheet.close}></div>
            <div className={`fixed z-50 ${colors.sectionBg} p-4 bottom-0 left-0 right-0 rounded-t-2xl`}>
                <h2 className={`font-semibold text-lg mb-4 text-center ${colors.primaryText}`}>Foto Profil</h2>
                <ul className="space-y-2">
                    <li onClick={handleCameraClick} className="flex items-center p-3 space-x-4 cursor-pointer"><CameraIcon className={`w-6 h-6 ${colors.secondaryText}`} /><span className={colors.primaryText}>Ambil Foto</span></li>
                    <li onClick={handleGalleryClick} className="flex items-center p-3 space-x-4 cursor-pointer"><GalleryIcon className={`w-6 h-6 ${colors.secondaryText}`} /><span className={colors.primaryText}>Pilih dari Galeri</span></li>
                    {(previewUrl) && <li onClick={handleRemovePhoto} className="flex items-center p-3 space-x-4 cursor-pointer"><TrashIcon className="w-6 h-6 text-red-500" /><span className="text-red-500">Hapus Foto</span></li>}
                </ul>
            </div>
      </>}
    </div>
  );
};

export default ProfileInfoScreen;