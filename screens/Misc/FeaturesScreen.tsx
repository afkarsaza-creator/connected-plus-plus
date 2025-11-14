import React from 'react';
import { ArrowLeftIcon } from '../../components/icons';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';

const featureCategories = [
  {
    title: 'Autentikasi & Pengguna',
    features: [
      'Login, Pendaftaran, Lupa Kata Sandi, dan Logout.',
      'Manajemen profil pengguna (nama, bio, foto, username, tanggal lahir).',
    ],
  },
  {
    title: 'Perpesanan Inti',
    features: [
      'Obrolan pribadi (1-on-1) dan obrolan grup secara real-time.',
      'Pengiriman pesan (teks, foto, file, pesan suara).',
      'Interaksi pesan: Mengedit, Menghapus, Memberi Reaksi, dan Meneruskan (Forward).',
      'Status pesan (Terkirim, Diterima, Dibaca).',
      'Indikator pengetikan (typing indicator).',
    ],
  },
  {
    title: 'Panggilan Suara & Video (WebRTC)',
    features: [
      'Panggilan suara dan video 1-on-1 secara real-time.',
      'UI lengkap untuk panggilan masuk, panggilan aktif, dan riwayat panggilan.',
      'Fitur dalam panggilan: mute/unmute, video on/off, speakerphone.',
      'Pratinjau video lokal yang dapat digeser (drag-and-drop).',
    ],
  },
  {
    title: 'Manajemen Obrolan & Grup',
    features: [
      'Membuat grup baru dengan nama dan foto.',
      'Mengedit info grup (nama, deskripsi, foto).',
      'Menambah/mengeluarkan anggota (khusus pemilik).',
      'Membisukan (Mute) dan menyuarakan (Unmute) notifikasi per-obrolan.',
      'Membersihkan riwayat obrolan & pencarian pesan.',
      'Timer Hapus Otomatis per-obrolan (pribadi & grup).',
    ],
  },
  {
    title: 'Pengaturan & Privasi',
    features: [
      'Semua pengaturan privasi (Terakhir Dilihat, Foto Profil, dll.).',
      'Manajemen pengguna yang diblokir.',
      'Pengaturan tampilan (Tema Terang/Gelap, Ukuran Teks, Sudut Pesan).',
      'Pengaturan notifikasi dan suara.',
      'Timer Hapus Otomatis global.',
    ],
  },
  {
    title: 'Fitur Tambahan',
    features: [
      'Pesan Tersimpan (Saved Messages).',
      'Manajemen Kontak (melihat, menambah, menghapus).',
      'Pencarian kontak dan pengguna global.',
      'Media Bersama (Media, File, Tautan).',
      'Undang Teman & Bagikan Kontak (menggunakan Web Share API).',
    ],
  },
];


const FeaturesScreen: React.FC = () => {
  const { handleBack } = useNavigation();
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    headerText: 'text-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
  };

  const FeatureCategory: React.FC<{ title: string; features: string[] }> = ({ title, features }) => (
    <div className={`${colors.sectionBg} p-4 rounded-lg mb-4 shadow-sm`}>
      <h3 className={`text-xl font-bold mb-3 ${colors.primaryText}`}>{title}</h3>
      <ul className={`list-disc list-inside space-y-1.5 ${colors.secondaryText}`}>
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} flex items-center p-3 shadow-md z-10 space-x-4`}>
        <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerText}`}>
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className={`text-xl font-semibold ${colors.headerText}`}>Fitur cONnected+</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        {featureCategories.map(category => (
            <FeatureCategory 
                key={category.title}
                title={category.title}
                features={category.features}
            />
        ))}
        <div className="mt-4 text-center">
            <p className={`${colors.secondaryText} text-sm`}>Versi V.1.4.1</p>
        </div>
      </main>
    </div>
  );
};

export default FeaturesScreen;