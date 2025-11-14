import React from 'react';
import { ArrowLeftIcon, ProfileIcon, GroupIcon } from '../../components/icons';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';

const NotificationsAndSoundsScreen: React.FC = () => {
  const { settings, setSetting, theme } = useSettings();
  const { handleBack, handleNavigate } = useNavigation();
  const { notificationsPrivate, notificationsGroups, privateTone, groupTone } = settings;
  const isDark = theme === 'dark';

  const colors = {
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    headerIcons: 'text-white',
    divider: isDark ? 'border-black/20' : 'border-gray-200',
  };

  const SettingRow: React.FC<{ title: string; children: React.ReactNode; isLast?: boolean }> = ({ title, children, isLast }) => (
    <div className={`flex items-center justify-between px-4 py-3 ${!isLast ? `border-b ${colors.divider}` : ''}`}>
      <span className={`text-base ${colors.primaryText}`}>{title}</span>
      <div>{children}</div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${colors.screenBg}`}>
      <header className={`${colors.headerBg} p-3 flex items-center sticky top-0 z-10 space-x-4`}>
        <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerIcons}`}>
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className={`text-xl font-semibold ${colors.headerIcons}`}>Notifikasi dan Suara</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <div className="mt-2">
          <h3 className={`${colors.linkColor} font-semibold px-4 pt-2 pb-2 text-sm`}>Obrolan Pribadi</h3>
          <div className={colors.sectionBg}>
            <SettingRow title="Notifikasi">
              <ToggleSwitch isOn={notificationsPrivate} onToggle={() => setSetting('notificationsPrivate', !notificationsPrivate)} />
            </SettingRow>
            <div onClick={() => handleNavigate('notificationSound', { type: 'private', title: 'Suara Obrolan Pribadi' })} className="cursor-pointer">
              <SettingRow title="Suara" isLast>
                <span className={colors.secondaryText}>{privateTone} &rsaquo;</span>
              </SettingRow>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <h3 className={`${colors.linkColor} font-semibold px-4 pt-2 pb-2 text-sm`}>Grup</h3>
          <div className={colors.sectionBg}>
            <SettingRow title="Notifikasi">
              <ToggleSwitch isOn={notificationsGroups} onToggle={() => setSetting('notificationsGroups', !notificationsGroups)} />
            </SettingRow>
             <div onClick={() => handleNavigate('notificationSound', { type: 'group', title: 'Suara Grup' })} className="cursor-pointer">
              <SettingRow title="Suara" isLast>
                <span className={colors.secondaryText}>{groupTone} &rsaquo;</span>
              </SettingRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsAndSoundsScreen;
