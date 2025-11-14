import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';
  
  const colors = {
    trackOn: 'bg-blue-500',
    trackOff: isDark ? 'bg-gray-600' : 'bg-gray-300',
    thumb: 'bg-white',
  };

  const trackClasses = `relative inline-flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`;
  const thumbClasses = `pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`;
  
  return (
    <button
      type="button"
      className={`${trackClasses} ${isOn ? colors.trackOn : colors.trackOff}`}
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
    >
      <span
        aria-hidden="true"
        className={`${thumbClasses} ${isOn ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
};

export default ToggleSwitch;