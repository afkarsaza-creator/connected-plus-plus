import React, { useState, useRef, useEffect } from 'react';
import { 
    EmojiIcon, AttachmentIcon, MicrophoneIcon, SendIcon, CheckIcon, PencilIcon, TrashIcon
} from '../../../components/icons';
import type { Message, MessageContent } from '../../../types';
import { useSettings } from '../../../context/SettingsContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useStorage } from '../../../context/StorageContext';

interface MessageInputProps {
  chatId: string;
  editingMessage: Message | null;
  onCancelEdit: () => void;
  onSendMessage: (chatId: string, content: MessageContent) => Promise<void>;
  onEditMessage: (messageId: string, chatId: string, newContent: MessageContent) => Promise<void>;
  onOpenAttachmentMenu: () => void;
  trackTyping: () => void;
  reportError: (message: string) => void;
}

const EMOJIS = [
  '😀', '😂', '❤️', '👍', '😢', '🙏', '🎉', '🔥', '🤔', '😊',
  '😎', '😍', '😮', '🥳', '🤯', '😴', '😠', '✅', '❌', '👋',
];

const MessageInput: React.FC<MessageInputProps> = ({
    chatId, editingMessage, onCancelEdit, onSendMessage, onEditMessage, onOpenAttachmentMenu, trackTyping, reportError
}) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const { theme } = useSettings();
    const { uploadFile } = useStorage();

    const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
        const publicUrl = await uploadFile(new File([audioBlob], "voice_message.webm"), 'chat-attachments', chatId);
        if (publicUrl) {
            onSendMessage(chatId, { type: 'voice', url: publicUrl, duration: audioRecorder.formattedDuration });
        }
    };
    
    const audioRecorder = useAudioRecorder({ onStop: handleSendVoiceMessage });
    const isDark = theme === 'dark';

    useEffect(() => {
        if (editingMessage && editingMessage.content.type === 'text') {
            setMessage(editingMessage.content.text);
        } else {
            setMessage('');
        }
    }, [editingMessage]);
    
    const colors = {
        inputBarBg: isDark ? 'bg-[#18222d]' : 'bg-white',
        inputPlaceholder: isDark ? 'placeholder-gray-400' : 'placeholder-gray-500',
        iconColor: isDark ? 'text-gray-400' : 'text-gray-500',
        primaryText: isDark ? 'text-white' : 'text-black',
        actionButtonText: isDark ? 'text-blue-400' : 'text-[#527da3]',
        inputBarDivider: isDark ? 'border-t border-gray-700/50' : 'border-t border-gray-200',
        emojiPickerBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        emojiPickerHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        trackTyping();
    };
    
    const handleEmojiSelect = (emoji: string) => {
        setMessage(prev => prev + emoji);
    };

    const handleSendOrEdit = () => {
        if (editingMessage) {
            if (editingMessage.content.type === 'text' && message.trim() && message.trim() !== editingMessage.content.text) {
                 const newContent: MessageContent = { ...editingMessage.content, text: message.trim() };
                 onEditMessage(editingMessage.id, chatId, newContent);
            }
            onCancelEdit();
        } else if (message.trim()) {
            onSendMessage(chatId, { type: 'text', text: message.trim() });
        }
        setMessage('');
    };

    const handleStartRecording = async () => {
        const result = await audioRecorder.startRecording();
        if (!result.success) {
            reportError("Tidak dapat mengakses mikrofon. Mohon periksa izin browser Anda.");
        }
    };

    return (
        <div className="relative">
            {showEmojiPicker && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
                    <div className={`absolute bottom-full left-2 mb-2 w-auto max-w-[90vw] p-2 rounded-lg shadow-xl z-40 ${colors.emojiPickerBg}`}>
                        <div className="grid grid-cols-5 gap-1">
                            {EMOJIS.map(emoji => (
                                <button key={emoji} onClick={() => handleEmojiSelect(emoji)} className={`text-2xl p-2 rounded-md ${colors.emojiPickerHover}`}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {editingMessage && (
                <div className={`${colors.inputBarBg} p-2 flex items-center justify-between border-t ${colors.inputBarDivider}`}>
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <PencilIcon className={`w-5 h-5 ${colors.actionButtonText} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${colors.actionButtonText}`}>Ubah</p>
                            <p className={`text-sm ${colors.primaryText} truncate`}>
                                {(editingMessage.content as any).text}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => { onCancelEdit(); setMessage(''); }} className={`p-2 ${colors.iconColor} text-2xl`}>&times;</button>
                </div>
            )}
            <footer className={`${colors.inputBarBg} p-2 flex items-center space-x-1 ${!editingMessage && colors.inputBarDivider}`}>
                {audioRecorder.isRecording ? (
                    <>
                        <div className="flex-1 flex items-center space-x-2 px-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className={`text-base ${colors.primaryText}`}>{audioRecorder.formattedDuration}</span>
                        </div>
                        <button onClick={audioRecorder.cancelRecording} className={`p-2 ${colors.iconColor}`}><TrashIcon className="w-6 h-6" /></button>
                        <button onClick={audioRecorder.stopRecording} className={`p-2 ${colors.actionButtonText}`}><SendIcon className="w-6 h-6" /></button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setShowEmojiPicker(prev => !prev)} className={`p-2 ${colors.iconColor}`}><EmojiIcon className="w-6 h-6" /></button>
                        <input 
                            type="text" 
                            placeholder="Pesan" 
                            value={message} 
                            onChange={handleInputChange} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSendOrEdit()} 
                            className={`flex-1 bg-transparent py-2 px-2 text-base ${colors.primaryText} ${colors.inputPlaceholder} outline-none`} 
                        />
                        {message.trim() === '' && !editingMessage ? (
                            <>
                                <button onClick={onOpenAttachmentMenu} className={`p-2 ${colors.iconColor}`}><AttachmentIcon className="w-6 h-6" /></button>
                                <button onClick={handleStartRecording} className={`p-2 ${colors.iconColor}`}><MicrophoneIcon className="w-6 h-6" /></button>
                            </>
                        ) : (
                            <button onClick={handleSendOrEdit} className={`p-2 ${colors.actionButtonText}`}>
                                {editingMessage ? <CheckIcon className="w-6 h-6" /> : <SendIcon className="w-6 h-6" />}
                            </button>
                        )}
                    </>
                )}
            </footer>
        </div>
    );
};

export default MessageInput;