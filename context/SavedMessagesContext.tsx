import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api';
import type { SavedMessage, Message, Chat } from '../types';
import { useAuth } from './AuthContext';

interface SavedMessagesContextType {
    loading: boolean;
    error: any;
    savedMessages: SavedMessage[];
    saveMessage: (message: Message, fromChat: Chat) => Promise<void>;
    deleteSavedMessage: (savedMessageId: string) => Promise<void>;
}

const SavedMessagesContext = createContext<SavedMessagesContextType | null>(null);

export const SavedMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);

    useEffect(() => {
        if (!userProfile?.id) return;

        const loadSavedMessages = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedMessages = await api.fetchSavedMessages();
                setSavedMessages(fetchedMessages || []);
            } catch (err) {
                console.error("Gagal memuat pesan tersimpan:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadSavedMessages();
    }, [userProfile?.id]);

    const saveMessage = useCallback(async (message: Message, fromChat: Chat) => {
        if (!userProfile) return;
        const newSavedMessage = await api.saveMessage(message, fromChat, userProfile);
        if (newSavedMessage) {
            setSavedMessages(prev => [newSavedMessage, ...prev]);
        }
    }, [userProfile]);

    const deleteSavedMessage = useCallback(async (savedMessageId: string) => {
        await api.deleteSavedMessage(savedMessageId);
        setSavedMessages(prev => prev.filter(sm => sm.id !== savedMessageId));
    }, []);

    const value = {
        loading,
        error,
        savedMessages,
        saveMessage,
        deleteSavedMessage,
    };

    return <SavedMessagesContext.Provider value={value}>{children}</SavedMessagesContext.Provider>;
};

export const useSavedMessages = () => {
    const context = useContext(SavedMessagesContext);
    if (context === null) {
        throw new Error('useSavedMessages must be used within a SavedMessagesProvider');
    }
    return context;
};