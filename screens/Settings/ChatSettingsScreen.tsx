import React from 'react';
import { ArrowLeftIcon, MoreVertIcon, DoubleCheckIcon } from '../../components/icons';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';

const darkWallpaperUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAACRJREFUOKVjZGBg+M+AAhYGBgYWBiMjIyNDA0YyNjZmZ2BgyAAA/P8PARb+AUABBf8YAAAAAElFTkSuQmCC';
const lightWallpaperUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAADFJREFUKFNjZGD4z4AG/gE1MDD8Z8TBAE4pCgY0sBgAASgGGGwY/g9gAATgAADzZAZvAV42qgAAAABJRU5ErkJggg==';

const ChatSettingsScreen: React.FC = () => {
  const { settings, setSetting, theme } = useSettings();
  const { handleBack } = useNavigation();
  const { textSize, cornerRadius } = settings;
  const isDark = theme === 'dark';
  
  const colors = {
    headerBg: isDark ? 'bg-[#222e3a]' : 'bg-[#527da3]',
    screenBg: isDark ? 'bg-[#18222d]' : 'bg-[#eef1f4]',
    sectionBg: isDark ? 'bg-[#222e3a]' : 'bg-white',
    primaryText: isDark ? 'text-white' : 'text-black',
    secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
    linkColor: isDark ? 'text-blue-400' : 'text-blue-500',
    wallpaperBg: isDark ? 'bg-[#86a889]' : 'bg-[#d7e2da]',
    incomingBubble: isDark ? 'bg-[#212d3b]' : 'bg-white',
    outgoingBubble: isDark ? 'bg-[#4d5ea4]' : 'bg-[#e1ffc7]',
    outgoingText: isDark ? 'text-white' : 'text-black',
    iconColor: isDark ? 'text-gray-400' : 'text-gray-500',
    headerIcons: 'text-white',
    divider: isDark ? 'border-black/20' : 'border-gray-200',
    sliderClass: isDark ? 'slider' : 'slider-light'
  };

  const maxCornerRadius = 18;

  const getBorderRadiusStyles = (radius: number, type: 'incoming' | 'outgoing') => {
    const r = Math.min(radius, maxCornerRadius);
    const common = { borderTopLeftRadius: `${r}px`, borderTopRightRadius: `${r}px` };
    if (type === 'incoming') {
      return { ...common, borderBottomRightRadius: `${r}px`, borderBottomLeftRadius: '4px' };
    }
    return { ...common, borderBottomLeftRadius: `${r}px`, borderBottomRightRadius: '4px' };
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg} overflow-y-auto`}>
      <header className={`${colors.headerBg} p-3 flex items-center justify-between sticky top-0 z-10`}>
        <div className="flex items-center space-x-4">
          <button onClick={handleBack} className={`p-2 -ml-2 ${colors.headerIcons}`}><ArrowLeftIcon className="w-6 h-6" /></button>
          <h1 className={`text-xl font-semibold ${colors.headerIcons}`}>Pengaturan Obrolan</h1>
        </div>
        <button className={`p-2 ${colors.headerIcons}`}><MoreVertIcon className="w-6 h-6" /></button>
      </header>

      <div className={`${colors.sectionBg} py-4`}>
        <Slider
          label="Ukuran teks pesan"
          value={textSize}
          min={12}
          max={20}
          onChange={(e) => setSetting('textSize', Number(e.target.value))}
          colors={colors}
        />
      </div>

      <h3 className={`font-semibold px-4 pt-4 pb-2 text-sm ${colors.linkColor}`}>Pratinjau</h3>

      <div 
        className="flex-1 p-4 flex flex-col justify-center"
        style={{
          backgroundColor: isDark ? '#0E1621' : '#E5DDD5',
          backgroundImage: `url("${isDark ? darkWallpaperUrl : lightWallpaperUrl}")`,
          backgroundRepeat: 'repeat',
          minHeight: '200px' // memastikan area pratinjau memiliki tinggi minimum
        }}
      >
        <div className="space-y-2">
            <div className="flex justify-start">
                <div 
                  className={`${colors.incomingBubble} p-2 max-w-[70%] relative ${colors.primaryText} shadow-md`}
                  style={getBorderRadiusStyles(cornerRadius, 'incoming')}
                >
                    <div className="absolute top-1 left-1 w-1 h-4 bg-green-400 rounded-full"></div>
                    <p className="font-bold text-green-400 pl-3">Pengguna</p>
                    <p style={{ fontSize: `${textSize}px` }} className="pl-3">Hari ini mau menyerah?</p>
                    <p className={`text-right text-xs ${colors.secondaryText} mt-1`}>09:32</p>
                </div>
            </div>
             <div className="flex justify-end">
                <div 
                  className={`${colors.outgoingBubble} p-2 max-w-[70%] ${colors.outgoingText} shadow-md`}
                  style={getBorderRadiusStyles(cornerRadius, 'outgoing')}
                >
                    <p style={{ fontSize: `${textSize}px` }}>Nggak mungkin! Aku mau buktiin kalau aku bisa. 💫</p>
                     <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>09:58</span>
                        <DoubleCheckIcon className={`w-4 h-4 ${isDark ? 'text-white' : 'text-blue-500'}`} />
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className={colors.sectionBg}>
         <div className={`py-2 border-t ${colors.divider}`}>
          <Slider
            label="Sudut pesan"
            value={cornerRadius}
            min={0}
            max={maxCornerRadius}
            onChange={(e) => setSetting('cornerRadius', Number(e.target.value))}
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  colors: any;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, onChange, colors }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-base ${colors.linkColor} font-semibold`}>{label}</span>
                <span className={`text-base ${colors.linkColor} font-semibold`}>{value}</span>
            </div>
            <div className="flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={onChange}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${colors.sliderClass}`}
                    style={{'--slider-progress': `${percentage}%`} as React.CSSProperties}
                />
            </div>
        </div>
    );
};

export default ChatSettingsScreen;