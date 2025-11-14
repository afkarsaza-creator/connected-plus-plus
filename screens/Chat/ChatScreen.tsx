import React, { useState, useRef, useEffect } from 'react';
import type { User, Message, Chat, MessageContent } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '../../context/NavigationContext';
import { useChatInteractions } from './hooks/useChatInteractions';

import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import AttachmentPreview from './components/AttachmentPreview';
import { 
    ImageLightbox, 
    CallMenuSheet, 
    AttachmentSheet, 
    ConfirmationDialog, 
    ContextMenu, 
    ReactionPicker 
} from './components/ChatModals';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { useSavedMessages } from '../../context/SavedMessagesContext';
// FIX: Import the useModalState hook.
import { useModalState } from '../../hooks/useModalState.ts';


const ChatScreen: React.FC = () => {
    const { userProfile: currentUser, setAlert } = useAuth();
    const { 
        activeChat: chat, messagesByChat, typingStatus, clearedChatIds, trackTyping, sendMessage, editMessage, 
        deleteMessage, toggleReaction, leaveGroup, clearHistory, isChatContentLoading, reportError
    } = useChat();
    const { allUsers, setActiveUser, blockedUserIds, contactIds, blockUser, unblockUser, deleteContact } = useUser();
    const { settings } = useSettings();
    const { handleNavigate, handleBack, highlightedMessageId } = useNavigation();
    const { startCall } = useCall();
    const { uploadFile } = useStorage();
    const { saveMessage: saveMessageToCloud } = useSavedMessages();
    const { theme } = settings;
    
    const interactions = useChatInteractions();
    const blockConfirmDialog = useModalState<User>();
    const deleteContactDialog = useModalState<User>();

    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    useEffect(() => {
        const highlightedElement = highlightedMessageId ? messageRefs.current.get(highlightedMessageId) : null;
        if (highlightedElement) {
            highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedMessageId]);

    if (!chat || !currentUser) return null;

    const messages = messagesByChat[chat.id] || [];
    const isDark = theme === 'dark';
    const otherUser = !chat.is_group ? chat.members?.find(m => m.id !== currentUser.id) : null;
    const isOwner = currentUser.id === chat.created_by;
    
    const colors = {
        screenBg: isDark ? 'bg-[#0E1621]' : 'bg-[#C8D7E8]',
        systemMessageBg: isDark ? 'bg-gray-700/50' : 'bg-gray-200/80',
        systemMessageText: isDark ? 'text-white' : 'text-gray-400',
    };

    const handleNavigateToProfile = (user: User) => {
        setActiveUser(user);
        handleNavigate('userProfile');
    };

    const handleNavigateToDetails = () => {
        if (chat.is_group) {
            handleNavigate('groupDetails');
        } else if (otherUser) {
            handleNavigateToProfile(otherUser);
        }
    };
    
    const handleCancelEdit = () => setEditingMessage(null);
    const handleRequestEdit = (message: Message) => setEditingMessage(message);

    const handleLeaveConfirm = () => { 
        leaveGroup(chat.id); 
        interactions.leaveConfirmDialog.close(); 
        handleBack();
    };

    const handleClearConfirm = () => {
        clearHistory(chat.id);
        interactions.clearConfirmDialog.close();
    }
    
    const handleDeleteConfirm = () => {
        if (interactions.deleteConfirmDialog.payload) {
            deleteMessage(interactions.deleteConfirmDialog.payload.id, chat.id);
        }
        interactions.deleteConfirmDialog.close();
    };

    const handleBlockConfirm = async () => {
        const userToProcess = blockConfirmDialog.payload;
        if (userToProcess) {
            if (blockedUserIds.includes(userToProcess.id)) {
                await unblockUser(userToProcess.id);
                setAlert({ message: `${userToProcess.name} telah dibuka blokirnya.`, type: 'success' });
            } else {
                await blockUser(userToProcess.id);
                setAlert({ message: `${userToProcess.name} telah diblokir.`, type: 'success' });
            }
        }
        blockConfirmDialog.close();
    };
    
    const handleDeleteContactConfirm = async () => {
        const userToProcess = deleteContactDialog.payload;
        if (userToProcess) {
            await deleteContact(userToProcess.id);
            setAlert({ message: `${userToProcess.name} telah dihapus dari kontak Anda.`, type: 'success' });
        }
        deleteContactDialog.close();
    };

    const handleSaveMessage = (message: Message) => {
        if (chat) {
            saveMessageToCloud(message, chat);
            setAlert({ message: 'Pesan disimpan ke Pesan Tersimpan.', type: 'success' });
        }
    };
    
    const handleSendAttachment = async (file: File, caption: string) => {
        setIsUploading(true);
        try {
            const publicUrl = await uploadFile(file, 'chat-attachments', chat.id);
            if (publicUrl) {
                const content: MessageContent = { 
                    type: 'photo', 
                    url: publicUrl, 
                    ...(caption.trim() && { caption: caption.trim() }) 
                };
                await sendMessage(chat.id, content);
            } else {
                console.error("Failed to upload attachment, URL was null.");
                reportError("Gagal mengunggah lampiran. URL tidak valid.");
            }
        } catch (error) {
            console.error("Error sending attachment:", error);
            reportError("Gagal mengirim lampiran. Silakan coba lagi.");
        } finally {
            setIsUploading(false);
            setAttachmentPreview(null);
            setCaption('');
        }
    };
    
    const handleSendFileAttachment = async (file: File) => {
        setIsUploading(true);
        try {
            const publicUrl = await uploadFile(file, 'chat-attachments', chat.id);
            if (publicUrl) {
                const content: MessageContent = {
                    type: 'file',
                    url: publicUrl,
                    fileName: file.name,
                    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                };
                await sendMessage(chat.id, content);
            } else {
                 reportError("Gagal mengunggah file. URL tidak valid.");
            }
        } catch (error) {
            console.error("Error sending file:", error);
            reportError("Gagal mengirim file. Silakan coba lagi.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`h-full flex flex-col relative ${colors.screenBg}`}>
            {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
            
            <ChatHeader 
                chat={chat}
                otherUser={otherUser}
                typingStatus={typingStatus}
                allUsers={allUsers}
                onBack={handleBack}
                onNavigateToDetails={handleNavigateToDetails}
                onNavigateToChatSearch={() => handleNavigate('chatSearch')}
                onStartCall={(type) => { if(otherUser) startCall(otherUser.id, type); }}
                onShowMenu={interactions.leaveConfirmDialog.open}
                onBlockUser={() => otherUser && blockConfirmDialog.open(otherUser)}
                onDeleteContact={() => otherUser && deleteContactDialog.open(otherUser)}
                isBlocked={otherUser ? blockedUserIds.includes(otherUser.id) : false}
                isContact={otherUser ? contactIds.has(otherUser.id) : false}
            />
            
            <main className="flex-1 p-4 overflow-y-auto flex flex-col-reverse" onClick={() => { 
                interactions.contextMenu.closeMenu(); 
                interactions.reactionPicker.closeReactionPicker(); 
            }}>
                {isChatContentLoading ? (
                    <div className={`m-auto rounded-full px-4 py-2 text-sm ${colors.systemMessageBg} ${colors.systemMessageText}`}>Memuat...</div>
                ) : (clearedChatIds.has(chat.id) || messages.length === 0) ? (
                    <div className={`m-auto rounded-full px-4 py-2 text-sm ${colors.systemMessageBg} ${colors.systemMessageText}`}>Belum ada pesan...</div>
                ) : (
                    <MessageList 
                        messages={[...messages].reverse()}
                        chat={chat}
                        currentUser={currentUser}
                        onNavigateToProfile={handleNavigateToProfile}
                        onShowContextMenu={interactions.contextMenu.showMenu}
                        onShowLightbox={setLightboxUrl}
                        messageRefs={messageRefs}
                        highlightedMessageId={highlightedMessageId}
                    />
                )}
            </main>
            
            <MessageInput 
                chatId={chat.id}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
                onSendMessage={sendMessage}
                onEditMessage={editMessage}
                onOpenAttachmentMenu={interactions.attachmentMenu.open}
                trackTyping={trackTyping}
                reportError={reportError}
            />

            {attachmentPreview && (
                <AttachmentPreview 
                    file={attachmentPreview} 
                    caption={caption}
                    onCaptionChange={setCaption}
                    onCancel={() => !isUploading && setAttachmentPreview(null)} 
                    onSend={handleSendAttachment}
                    isSending={isUploading}
                />
            )}
            
            <CallMenuSheet
                isOpen={interactions.callMenu.isOpen}
                onClose={interactions.callMenu.close}
                onStartCall={(type) => { if(otherUser) startCall(otherUser.id, type); }}
            />
            <AttachmentSheet
                isOpen={interactions.attachmentMenu.isOpen}
                onClose={interactions.attachmentMenu.close}
                onPhotoAttachment={(file) => setAttachmentPreview(file)}
                onFileAttachment={handleSendFileAttachment}
            />
            <ConfirmationDialog 
                isOpen={interactions.leaveConfirmDialog.isOpen}
                title={isOwner ? "Hapus grup" : "Keluar grup"}
                message={isOwner ? "Anda yakin ingin menghapus dan keluar?" : "Anda yakin ingin keluar?"}
                confirmText={isOwner ? "HAPUS" : "KELUAR"}
                onCancel={interactions.leaveConfirmDialog.close}
                onConfirm={handleLeaveConfirm}
            />
            <ConfirmationDialog 
                isOpen={interactions.clearConfirmDialog.isOpen}
                title="Bersihkan Riwayat"
                message="Anda yakin?"
                confirmText="BERSIHKAN"
                onCancel={interactions.clearConfirmDialog.close}
                onConfirm={handleClearConfirm}
            />
            <ConfirmationDialog 
                isOpen={interactions.deleteConfirmDialog.isOpen}
                title="Hapus Pesan"
                message="Anda yakin?"
                confirmText="HAPUS"
                onCancel={interactions.deleteConfirmDialog.close}
                onConfirm={handleDeleteConfirm}
            />
            <ConfirmationDialog 
                isOpen={blockConfirmDialog.isOpen}
                title={blockConfirmDialog.payload && blockedUserIds.includes(blockConfirmDialog.payload.id) ? 'Buka Blokir Pengguna' : 'Blokir Pengguna'}
                message={`Anda yakin ingin ${blockConfirmDialog.payload && blockedUserIds.includes(blockConfirmDialog.payload.id) ? 'membuka blokir' : 'memblokir'} ${blockConfirmDialog.payload?.name}?`}
                confirmText={blockConfirmDialog.payload && blockedUserIds.includes(blockConfirmDialog.payload.id) ? 'BUKA BLOKIR' : 'BLOKIR'}
                onCancel={blockConfirmDialog.close}
                onConfirm={handleBlockConfirm}
            />
             <ConfirmationDialog 
                isOpen={deleteContactDialog.isOpen}
                title="Hapus Kontak"
                message={`Anda yakin ingin menghapus ${deleteContactDialog.payload?.name} dari kontak Anda?`}
                confirmText="HAPUS"
                onCancel={deleteContactDialog.close}
                onConfirm={handleDeleteContactConfirm}
            />
            {interactions.contextMenu.menu && (
                <ContextMenu 
                    menu={interactions.contextMenu.menu}
                    currentUser={currentUser}
                    onClose={interactions.contextMenu.closeMenu}
                    onShowReactionPicker={interactions.reactionPicker.showReactionPicker}
                    onNavigate={handleNavigate}
                    onSaveMessage={handleSaveMessage}
                    onEdit={handleRequestEdit}
                    onDelete={interactions.requestDelete}
                />
            )}
            {interactions.reactionPicker.picker && (
                <ReactionPicker
                    picker={interactions.reactionPicker.picker}
                    currentUser={currentUser}
                    messages={messages}
                    onClose={interactions.reactionPicker.closeReactionPicker}
                    onToggleReaction={(messageId, emoji) => toggleReaction(chat.id, messageId, emoji)}
                />
            )}
        </div>
    );
};

export default ChatScreen;