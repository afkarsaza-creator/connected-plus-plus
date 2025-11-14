import React from 'react';
import { UserProvider } from './UserContext';
import { ChatProvider } from './ChatContext';
import { CallProvider } from './CallContext';
import { SavedMessagesProvider } from './SavedMessagesContext';
import { StorageProvider } from './StorageContext';
import { NavigationProvider } from './NavigationContext';

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationProvider>
      <UserProvider>
        <StorageProvider>
          <CallProvider>
            <SavedMessagesProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
            </SavedMessagesProvider>
          </CallProvider>
        </StorageProvider>
      </UserProvider>
    </NavigationProvider>
  );
};