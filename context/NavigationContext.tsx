import React, { createContext, useState, useCallback, useContext } from 'react';
import type { Screen } from '../types';

interface NavigationContextType {
  screen: Screen;
  screenHistory: Screen[];
  screenOptions: any;
  highlightedMessageId: string | null;
  isSidebarOpen: boolean;
  handleNavigate: (screen: Screen, options?: any) => void;
  handleBack: () => void;
  setHighlightedMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screen>('chatList');
  const [screenHistory, setScreenHistory] = useState<Screen[]>(['chatList']);
  const [screenOptions, setScreenOptions] = useState<any>({});
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = useCallback((newScreen: Screen, options = {}) => {
    setScreenHistory(prev => [...prev, newScreen]);
    setScreen(newScreen);
    setScreenOptions(options);
  }, []);

  const handleBack = useCallback(() => {
    setHighlightedMessageId(null);
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const previousScreen = newHistory[newHistory.length - 1];
      setScreen(previousScreen);
      setScreenHistory(newHistory);
    }
  }, [screenHistory]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  
  const value = {
    screen,
    screenHistory,
    screenOptions,
    highlightedMessageId,
    isSidebarOpen,
    handleNavigate,
    handleBack,
    setHighlightedMessageId,
    openSidebar,
    closeSidebar,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
