import React, { createContext, useContext, useCallback } from 'react';
import * as api from '../services/api';

interface StorageContextType {
    uploadFile: (file: File, bucket: 'group-avatars' | 'chat-attachments' | 'profile-avatars', pathPrefix?: string) => Promise<string | null>;
    deleteAvatar: (avatarUrl: string) => Promise<void>;
}

const StorageContext = createContext<StorageContextType | null>(null);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
    const uploadFile = useCallback(async (file: File, bucket: 'group-avatars' | 'chat-attachments' | 'profile-avatars', pathPrefix?: string) => {
        return api.uploadFile(file, bucket, pathPrefix);
    }, []);
    
    const deleteAvatar = useCallback(async (avatarUrl: string) => {
        return api.deleteAvatar(avatarUrl);
    }, []);

    const value = {
        uploadFile,
        deleteAvatar,
    };

    return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};

export const useStorage = () => {
    const context = useContext(StorageContext);
    if (context === null) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};