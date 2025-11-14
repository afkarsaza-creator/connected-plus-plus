import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import * as api from '../services/api';
import type { Chat, User, Message, MessageContent, AutoDeleteOption } from '../types';
import { useAuth } from './AuthContext';
import { useNavigation } from './NavigationContext';
import { useSettings } from './SettingsContext';

// Suara notifikasi yang disematkan
const notificationSounds: { [key: string]: HTMLAudioElement } = {
    Default: new Audio("data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAABMYXZjNTguNzYuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-///8AAAAAAAAAAAAABJADgBI/AAAAAgBDRD4/AAAAA/////+wYzLgA5AgwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMwAABEVOTURERTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-///8AAAAAAAAAAAAABJQAwAAAEAAAAAABJAQMFBgcIAgQDAgECAwUGBwgJCgsMDQ4PDxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKi0tLi8wMTIyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAAMKHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3MlzJ00DAgA="),
    Chime: new Audio("data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAABMYXZjNTguNzYuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-///8AAAAAAAAAAAAABJQAwAAAEAAAAAABJAQMFBgcIAgQDAgECAwUGBwgJCgsMDQ4PDxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKi0tLi8wMTIyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAA4ACgocSLCgwYMIH1zAsKHDhxAjQoTAsKLFixgzZvyAsaPHjyBDihwJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKjTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTpxK0FAgA="),
    Zap: new Audio("data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAABMYXZjNTguNzYuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-///8AAAAAAAAAAAAABJQAwAAAEAAAAAABJAQMFBgcIAgQDAgECAwUGBwgJCgsMDQ4PDxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKi0tLi8wMTIyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAAUACgocSLCgwYMIEx5EsKHDhxAjQnSAsKLFixgzZsyAsaPHjyBDihwJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1TqKjRo0iTKl3KtKjTp1CjSp1KtarVq1izat3KtavXr2DD4gA="),
};

function playSound(soundName: string) {
    if (notificationSounds[soundName]) {
        notificationSounds[soundName].play().catch(e => console.error("Error playing sound:", e));
    }
}

interface ChatContextType {
    loading: boolean;
    dataLoadingError: any;
    isChatContentLoading: boolean;
    chats: Chat[];
    typingStatus: { [chatId: string]: string[] };
    messagesByChat: { [chatId: string]: Message[] };
    activeChat: Chat | null;
    newGroupMembers: User[];
    clearedChatIds: Set<string>;
    
    // Actions
    setActiveChat: (chat: Chat | null) => void;
    setNewGroupMembers: (members: User[]) => void;
    trackTyping: () => void;
    cleanupSubscriptions: () => Promise<void>;
    sendMessage: (chatId: string, content: MessageContent) => Promise<void>;
    deleteMessage: (messageId: string, chatId: string) => Promise<void>;
    editMessage: (messageId: string, chatId: string, newContent: MessageContent) => Promise<void>;
    toggleReaction: (chatId: string, messageId: string, emoji: string) => Promise<void>;
    forwardMessage: (content: MessageContent, targetChatIds: string[]) => Promise<void>;
    createAndGetOneOnOneChat: (userId: string) => Promise<Chat | null>;
    navigateToChat: (item: User | Chat) => Promise<void>;
    toggleMute: (chatId: string) => Promise<void>;
    setChatAutoDelete: (chatId: string, timer: AutoDeleteOption) => Promise<void>;
    clearHistory: (chatId: string) => Promise<void>;
    createGroup: (name: string, photoFile: File | null) => Promise<void>;
    leaveGroup: (chatId: string) => Promise<void>;
    addMembersToGroup: (chatId: string, userIds: string[]) => Promise<void>;
    removeMemberFromGroup: (chatId: string, memberId: string) => Promise<void>;
    editGroup: (chatId: string, newName: string, newPhoto: string | null, newDescription: string) => Promise<void>;
    applyGlobalAutoDeleteToChats: (timer: AutoDeleteOption) => Promise<void>;
    reportError: (message: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userProfile, setAlert } = useAuth();
    const { handleNavigate } = useNavigation();
    const { settings } = useSettings();
    
    const [initialLoading, setInitialLoading] = useState(true);
    const [dataLoadingError, setDataLoadingError] = useState<any>(null);
    const [isChatContentLoading, setChatContentLoading] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [newGroupMembers, setNewGroupMembers] = useState<User[]>([]);
    const [messagesByChat, setMessagesByChat] = useState<{ [chatId: string]: Message[] }>({});
    const [typingStatus, setTypingStatus] = useState<{ [chatId: string]: string[] }>({});
    const [clearedChatIds, setClearedChatIds] = useState<Set<string>>(new Set());

    const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
    const lastTypingTrackTimeRef = useRef<number>(0);
    const chatsRef = useRef<Chat[]>(chats);
    const activeChatRef = useRef<Chat | null>(activeChat);
    const typingTimeoutsRef = useRef<{ [key: string]: number }>({});

    useEffect(() => { chatsRef.current = chats; }, [chats]);
    useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

    useEffect(() => {
        if (!userProfile?.id) return;
        const loadInitialData = async () => {
            try {
                setInitialLoading(true);
                const fetchedChats = await api.fetchUserChats();
                setChats(fetchedChats || []);
                setDataLoadingError(null);
            } catch (error: any) {
                console.error("CRITICAL: Gagal memuat data obrolan.", error);
                setDataLoadingError(error);
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitialData();
    }, [userProfile?.id]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (activeChat && !messagesByChat[activeChat.id] && !clearedChatIds.has(activeChat.id)) {
                setChatContentLoading(true);
                try {
                    const messages = await api.fetchMessagesForChat(activeChat.id);
                    if (messages) {
                        setMessagesByChat(prev => ({ ...prev, [activeChat.id]: messages }));
                        await api.markMessagesAsRead(activeChat.id);
                    }
                } catch (error) {
                    console.error(`Failed to fetch messages for chat ${activeChat.id}:`, error);
                } finally {
                    setChatContentLoading(false);
                }
            }
        };
        fetchMessages();
    }, [activeChat, messagesByChat, clearedChatIds]);

    const handleMessageUpdate = useCallback((updatedMessage: Message) => {
        if(!userProfile) return;
        setMessagesByChat(prev => {
            const chatId = updatedMessage.chat_id;
            const currentMessages = prev[chatId] || [];
            const existingMessageIndex = currentMessages.findIndex(m => m.id === updatedMessage.id);
            if (existingMessageIndex > -1) {
                const newMessages = [...currentMessages];
                newMessages[existingMessageIndex] = updatedMessage;
                return { ...prev, [chatId]: newMessages };
            }
            if (updatedMessage.senderId === userProfile.id) {
                const optimisticIndex = currentMessages.findIndex(m => m.id.startsWith('temp_') && m.senderId === userProfile.id);
                if (optimisticIndex > -1) {
                    const newMessages = [...currentMessages];
                    newMessages[optimisticIndex] = updatedMessage;
                    return { ...prev, [chatId]: newMessages };
                }
            }
            return { ...prev, [chatId]: [updatedMessage, ...currentMessages] };
        });
    }, [userProfile]);

    const handleMessageDelete = useCallback((deletedMessage: { id: string, chat_id: string }) => {
        setMessagesByChat(prev => {
            const currentMessages = prev[deletedMessage.chat_id] || [];
            const messageIndex = currentMessages.findIndex(m => m.id === deletedMessage.id);
            if (messageIndex > -1) {
                const newMessages = [...currentMessages];
                newMessages[messageIndex] = { ...newMessages[messageIndex], content: { type: 'deleted' }, reactions: {} };
                return { ...prev, [deletedMessage.chat_id]: newMessages };
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        if (!userProfile?.id) return;
    
        const handleDbChange = (payload: any) => {
            const chatId = payload.new?.chat_id || payload.old?.chat_id;
            if (!chatId) return;
    
            const currentActiveChatId = activeChatRef.current?.id;
    
            if (chatId === currentActiveChatId) {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    handleMessageUpdate(api.mapRawMessageToMessage(payload.new));
                } else if (payload.eventType === 'DELETE') {
                    handleMessageDelete(payload.old as any);
                }
            } else {
                if (payload.eventType === 'INSERT') {
                     const newMessage = api.mapRawMessageToMessage(payload.new);
                     const chat = chatsRef.current.find(c => c.id === newMessage.chat_id);
                     if (!chat) return;

                     if (newMessage.senderId !== userProfile.id) {
                         const isGroup = chat.is_group;
                         const notificationsOn = isGroup ? settings.notificationsGroups : settings.notificationsPrivate;
                         if (notificationsOn && !chat.isMuted) {
                             const tone = isGroup ? settings.groupTone : settings.privateTone;
                             if (tone !== 'None') playSound(tone);
                         }
                     }
                     
                     setChats(prevChats => {
                         const chatIndex = prevChats.findIndex(c => c.id === newMessage.chat_id);
                         if (chatIndex === -1) return prevChats;
    
                         let lastMessageText = '';
                         switch (newMessage.content.type) {
                            case 'text': lastMessageText = newMessage.content.text; break;
                            case 'photo': lastMessageText = newMessage.content.caption || 'Foto'; break;
                            case 'voice': lastMessageText = 'Pesan suara'; break;
                            case 'file': lastMessageText = 'Berkas'; break;
                            case 'deleted': lastMessageText = 'Pesan dihapus'; break;
                         }
    
                         const updatedChat = { 
                             ...prevChats[chatIndex], 
                             lastMessage: lastMessageText, 
                             timestamp: newMessage.timestamp,
                             unreadCount: (prevChats[chatIndex].unreadCount || 0) + 1,
                         };
                         
                         const newChats = prevChats.filter(c => c.id !== newMessage.chat_id);
                         newChats.unshift(updatedChat);
                         return newChats;
                     });
                }
            }
        };
    
        const channelId = 'messages-realtime';
        const messagesChannel = supabase
            .channel(channelId)
            .on(
                'postgres_changes', 
                { event: '*', schema: 'public', table: 'messages' }, 
                handleDbChange
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') console.log("Berhasil berlangganan pembaruan pesan.");
                else if (status === 'CHANNEL_ERROR') console.error("Gagal berlangganan pembaruan pesan.", err);
                else if (status === 'TIMED_OUT') console.warn("Langganan pesan habis waktu.");
            });
    
        channelsRef.current.set(channelId, messagesChannel);
    
        return () => {
            supabase.removeChannel(messagesChannel);
            channelsRef.current.delete(channelId);
        };
    
    }, [userProfile?.id, handleMessageUpdate, handleMessageDelete, settings]);
    
    useEffect(() => {
        if (!userProfile?.id) return;
        const handleNewChatParticipant = async (payload: any) => {
            const newChatId = payload.new.chat_id;
            if (chatsRef.current.some(c => c.id === newChatId)) return;
            const newChat = await api.fetchChatById(newChatId);
            if (newChat) setChats(prevChats => [newChat, ...prevChats]);
        };
        const channelId = `new-chats-for-${userProfile.id}`;
        const subscription = supabase.channel(channelId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_participants', filter: `user_id=eq.${userProfile.id}` }, handleNewChatParticipant).subscribe();
        channelsRef.current.set(channelId, subscription);
        return () => { supabase.removeChannel(subscription); channelsRef.current.delete(channelId); };
    }, [userProfile?.id]);
    
    useEffect(() => {
        if (!activeChat || !userProfile) return;
        const channelId = `chat:${activeChat.id}`;
        const channel = supabase.channel(channelId);
        channelsRef.current.set(channelId, channel);
        const typingEventHandler = ({ payload }: { payload: any }) => {
            if (payload.userId === userProfile.id) return;
            const chatId = channel.topic.split(':')[1];
            setTypingStatus(prev => ({ ...prev, [chatId]: Array.from(new Set([...(prev[chatId] || []), payload.userId])) }));
            const timeoutKey = `${chatId}-${payload.userId}`;
            if (typingTimeoutsRef.current[timeoutKey]) clearTimeout(typingTimeoutsRef.current[timeoutKey]);
            typingTimeoutsRef.current[timeoutKey] = window.setTimeout(() => {
                setTypingStatus(prev => {
                    const newStatus = { ...prev };
                    newStatus[chatId] = (newStatus[chatId] || []).filter(id => id !== payload.userId);
                    if (newStatus[chatId].length === 0) delete newStatus[chatId];
                    return newStatus;
                });
                delete typingTimeoutsRef.current[timeoutKey];
            }, 3000); 
        };
        channel.on('broadcast', { event: 'typing' }, typingEventHandler).subscribe(status => { if (status === 'SUBSCRIBED') console.log(`Subscribed to typing on ${channelId}`); });
        return () => { supabase.removeChannel(channel); channelsRef.current.delete(channelId); };
    }, [activeChat, userProfile?.id]);

    const cleanupSubscriptions = useCallback(async () => {
        await supabase.removeAllChannels();
        channelsRef.current.clear();
    }, []);

    const reportError = useCallback((message: string) => setAlert({ message, type: 'error' }), [setAlert]);

    const trackTyping = useCallback(() => {
        if (activeChat && userProfile && Date.now() - lastTypingTrackTimeRef.current > 2000) {
            lastTypingTrackTimeRef.current = Date.now();
            const channel = channelsRef.current.get(`chat:${activeChat.id}`);
            channel?.send({ type: 'broadcast', event: 'typing', payload: { userId: userProfile.id } });
        }
    }, [activeChat, userProfile]);
    
    const sendMessage = async (chatId: string, content: MessageContent) => {
        if(!userProfile) return;
        const tempId = `temp_${Date.now()}`;
        const optimisticMessage: Message = { id: tempId, senderId: userProfile.id, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), content, chat_id: chatId, status: 'sent' };
        setMessagesByChat(prev => ({ ...prev, [chatId]: [optimisticMessage, ...(prev[chatId] || [])] }));
        try {
            await api.sendMessage(chatId, content);
        } catch (error: any) {
            console.error("Gagal mengirim pesan:", error.message || error);
            setMessagesByChat(prev => ({ ...prev, [chatId]: prev[chatId].filter(m => m.id !== tempId) }));
            let errorMessage = "Gagal mengirim pesan. Silakan coba lagi.";
            if (error.message.includes('new row violates row-level security policy')) errorMessage = "Gagal mengirim pesan. Anda mungkin telah diblokir oleh pengguna ini atau sebaliknya."
            setAlert({ message: errorMessage, type: 'error' });
        }
    };

    const deleteMessage = async (messageId: string, chatId: string) => { await api.deleteMessage(messageId); };
    const editMessage = async (messageId: string, chatId: string, newContent: MessageContent) => { await api.editMessage(messageId, newContent); };
    const toggleReaction = async (chatId: string, messageId: string, emoji: string) => { await api.toggleReaction(messageId, emoji); };
    const forwardMessage = async (content: MessageContent, targetChatIds: string[]) => { for (const chatId of targetChatIds) await api.sendMessage(chatId, content); };
    
    const createAndGetOneOnOneChat = useCallback(async (userId: string) => {
        try {
            const newChatId = await api.createOneOnOneChat(userId);
            if (!newChatId) return null;

            const existingChat = chatsRef.current.find(c => c.id === newChatId);
            if (existingChat) return existingChat;

            const newChat = await api.fetchChatById(newChatId);
            if (newChat) {
                 setChats(prevChats => {
                     if (prevChats.some(c => c.id === newChat.id)) return prevChats;
                     return [newChat, ...prevChats];
                 });
            }
            return newChat;
        } catch (error: any) {
            console.error("Gagal membuat obrolan 1-on-1:", error.message || error);
            throw error;
        }
    }, []);

    const navigateToChat = useCallback(async (item: User | Chat) => {
        if ('members' in item) {
            setActiveChat(item);
            handleNavigate('chat');
        } else {
            const existingChat = chatsRef.current.find(c => !c.is_group && c.members?.length === 2 && c.members.some(m => m.id === item.id));
            if (existingChat) {
                setActiveChat(existingChat);
                handleNavigate('chat');
            } else {
                try {
                    const newChat = await createAndGetOneOnOneChat(item.id);
                    if (newChat) {
                        setActiveChat(newChat);
                        handleNavigate('chat');
                    } else {
                         setAlert({ message: 'Tidak dapat memulai obrolan. Silakan coba lagi.', type: 'error' });
                    }
                } catch (error: any) {
                    console.error("Gagal memulai obrolan:", error.message || error);
                    setAlert({ message: `Gagal memulai obrolan: ${error.message}`, type: 'error' });
                }
            }
        }
    }, [handleNavigate, createAndGetOneOnOneChat, setAlert]);
    
    const createGroup = async (name: string, photoFile: File | null) => {
        if (!userProfile) return;
        try {
            const memberIds = [userProfile.id, ...newGroupMembers.map(m => m.id)];
            const newChat = await api.createGroupChat(name, memberIds, photoFile);
            if (newChat) {
                setChats(prev => [newChat, ...prev]);
                setActiveChat(newChat);
                handleNavigate('chat');
            }
            setNewGroupMembers([]);
        } catch (error: any) {
            console.error("Gagal membuat grup:", error);
            setAlert({ message: `Gagal membuat grup: ${error.message}`, type: 'error' });
        }
    };
    
    const leaveGroup = async (chatId: string) => {
        await api.leaveGroup(chatId);
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (activeChat?.id === chatId) setActiveChat(null);
    };
    
    const toggleMute = async (chatId: string) => {
        const chatToUpdate = chatsRef.current.find(c => c.id === chatId);
        if (chatToUpdate) {
            const newMutedState = !chatToUpdate.isMuted;
            setChats(prev => prev.map(c => c.id === chatId ? { ...c, isMuted: newMutedState } : c));
            if (activeChatRef.current?.id === chatId) setActiveChat(prev => prev ? { ...prev, isMuted: newMutedState } : null);
            try {
                await api.updateMuteStatus(chatId, newMutedState);
            } catch (error) {
                console.error("Gagal memperbarui status bisu:", error);
                setChats(prev => prev.map(c => c.id === chatId ? { ...c, isMuted: !newMutedState } : c));
                if (activeChatRef.current?.id === chatId) setActiveChat(prev => prev ? { ...prev, isMuted: !newMutedState } : null);
                reportError("Gagal mengubah status bisu. Coba lagi.");
            }
        }
    };

    const addMembersToGroup = async (chatId: string, userIds: string[]) => {
        await api.addMembersToGroup(chatId, userIds);
        const updatedChat = await api.fetchChatById(chatId);
        if (updatedChat) {
            setChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));
            if (activeChat?.id === chatId) setActiveChat(updatedChat);
        }
    };

    const removeMemberFromGroup = async (chatId: string, memberId: string) => {
        await api.removeMemberFromGroup(chatId, memberId);
        const updatedChat = await api.fetchChatById(chatId);
        if (updatedChat) {
            setChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));
            if (activeChat?.id === chatId) setActiveChat(updatedChat);
        }
    };
    
    const editGroup = async (chatId: string, newName: string, newPhoto: string | null, newDescription: string) => {
        await api.updateGroupInfo(chatId, newName, newPhoto, newDescription);
        const updatedChat = await api.fetchChatById(chatId);
        if (updatedChat) {
            setChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));
            if (activeChat?.id === chatId) setActiveChat(updatedChat);
        }
    };
    
    const setChatAutoDelete = async (chatId: string, timer: AutoDeleteOption) => {
        await api.updateChatAutoDeleteTimer(chatId, timer);
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, autoDeleteTimer: timer } : c));
        if (activeChat?.id === chatId) setActiveChat(prev => prev ? { ...prev, autoDeleteTimer: timer } : null);
    };
    
    const clearHistory = async (chatId: string) => {
        const previousMessages = messagesByChat[chatId] || [];
        setMessagesByChat(prev => ({ ...prev, [chatId]: [] }));
        setClearedChatIds(prev => new Set(prev).add(chatId));
        try {
            await api.clearChatHistory(chatId);
            setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: 'Belum ada pesan', timestamp: '' } : c));
        } catch (error: any) {
            console.error("Gagal membersihkan riwayat:", error);
            reportError("Gagal membersihkan riwayat. Coba lagi.");
            setMessagesByChat(prev => ({ ...prev, [chatId]: previousMessages }));
            setClearedChatIds(prev => { const newSet = new Set(prev); newSet.delete(chatId); return newSet; });
        }
    };

    const applyGlobalAutoDeleteToChats = async (timer: AutoDeleteOption) => {
        const privateChats = chatsRef.current.filter(c => !c.is_group);
        if (privateChats.length === 0) {
            setAlert({ message: 'Tidak ada obrolan pribadi untuk diperbarui.', type: 'success' });
            return;
        };
        try {
            await Promise.all(privateChats.map(chat => api.updateChatAutoDeleteTimer(chat.id, timer)));
            setChats(prev => prev.map(chat => !chat.is_group ? { ...chat, autoDeleteTimer: timer } : chat));
            if (activeChatRef.current && !activeChatRef.current.is_group) setActiveChat(prev => prev ? { ...prev, autoDeleteTimer: timer } : null);
            setAlert({ message: `Timer hapus otomatis diperbarui untuk ${privateChats.length} obrolan pribadi.`, type: 'success' });
        } catch (error: any) {
            console.error("Gagal menerapkan timer global:", error);
            reportError("Gagal memperbarui beberapa obrolan. Coba lagi.");
        }
    };

    const value = {
        loading: initialLoading,
        dataLoadingError,
        isChatContentLoading,
        chats,
        typingStatus,
        messagesByChat,
        activeChat,
        newGroupMembers,
        clearedChatIds,
        setActiveChat,
        setNewGroupMembers,
        trackTyping,
        cleanupSubscriptions,
        sendMessage,
        deleteMessage,
        editMessage,
        toggleReaction,
        forwardMessage,
        createAndGetOneOnOneChat,
        navigateToChat,
        toggleMute,
        setChatAutoDelete,
        clearHistory,
        createGroup,
        leaveGroup,
        addMembersToGroup,
        removeMemberFromGroup,
        editGroup,
        applyGlobalAutoDeleteToChats,
        reportError,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
};
