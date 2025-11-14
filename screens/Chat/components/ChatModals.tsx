import React, { useRef } from 'react';
import type { Message, Screen, User } from '../../../types';
import { 
    EmojiIcon, ForwardIcon, SavedIcon, PencilIcon, TrashIcon, CallIcon, VideoIcon, GalleryIcon, FileIcon 
} from '../../../components/icons';
import { useSettings } from '../../../context/SettingsContext';
import { useSavedMessages } from '../../../context/SavedMessagesContext';

// --- ImageLightbox ---
export const ImageLightbox: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
        <img src={url} alt="Lightbox" className="max-w-[90vw] max-h-[90vh] object-contain" />
    </div>
);

// --- CallMenuSheet ---
export const CallMenuSheet: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onStartCall: (type: 'voice' | 'video') => void;
}> = ({ isOpen, onClose, onStartCall }) => {
    const { theme } = useSettings();
    const colors = {
        menuBg: theme === 'dark' ? 'bg-[#2a3744]' : 'bg-white',
        menuHover: theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100',
        primaryText: theme === 'dark' ? 'text-white' : 'text-black',
        iconColor: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    };
    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
            <div className={`fixed bottom-0 left-0 right-0 ${colors.menuBg} rounded-t-2xl p-2 z-50`}>
                <ul className="space-y-1">
                    <li onClick={() => { onClose(); onStartCall('voice'); }} className={`flex items-center p-3 space-x-4 cursor-pointer rounded-lg ${colors.menuHover}`}><CallIcon className={`w-6 h-6 ${colors.iconColor}`} /><span className={colors.primaryText}>Panggilan Suara</span></li>
                    <li onClick={() => { onClose(); onStartCall('video'); }} className={`flex items-center p-3 space-x-4 cursor-pointer rounded-lg ${colors.menuHover}`}><VideoIcon className={`w-6 h-6 ${colors.iconColor}`} /><span className={colors.primaryText}>Panggilan Video</span></li>
                </ul>
            </div>
        </>
    );
};

// --- AttachmentSheet ---
export const AttachmentSheet: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onPhotoAttachment: (file: File) => void;
    onFileAttachment: (file: File) => void;
}> = ({ isOpen, onClose, onPhotoAttachment, onFileAttachment }) => {
    const { theme } = useSettings();
    const photoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const colors = {
        menuBg: theme === 'dark' ? 'bg-[#2a3744]' : 'bg-white',
        primaryText: theme === 'dark' ? 'text-white' : 'text-black',
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, handler: (file: File) => void) => {
        if (event.target.files && event.target.files[0]) {
            handler(event.target.files[0]);
        }
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <>
            <input type="file" ref={photoInputRef} onChange={(e) => handleFileChange(e, onPhotoAttachment)} accept="image/*,video/*" className="hidden" />
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, onFileAttachment)} className="hidden" />
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
            <div className={`fixed bottom-0 left-0 right-0 ${colors.menuBg} rounded-t-2xl p-2 z-50`}>
                <ul className="grid grid-cols-3 gap-2 text-center p-4">
                    <li onClick={() => photoInputRef.current?.click()} className="flex flex-col items-center p-2 cursor-pointer rounded-lg hover:bg-white/10"><GalleryIcon className="w-8 h-8 text-purple-400" /><span className={`mt-1 text-sm ${colors.primaryText}`}>Foto/Video</span></li>
                    <li onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-2 cursor-pointer rounded-lg hover:bg-white/10"><FileIcon className="w-8 h-8 text-blue-400" /><span className={`mt-1 text-sm ${colors.primaryText}`}>Berkas</span></li>
                </ul>
            </div>
        </>
    );
};


// --- ConfirmationDialog ---
export const ConfirmationDialog: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onCancel: () => void;
    onConfirm: () => void;
}> = ({ isOpen, title, message, confirmText, onCancel, onConfirm }) => {
    const { theme } = useSettings();
    const colors = {
        dialogBg: theme === 'dark' ? 'bg-[#2a3744]' : 'bg-white',
        primaryText: theme === 'dark' ? 'text-white' : 'text-black',
        dialogText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
        actionButtonText: theme === 'dark' ? 'text-blue-400' : 'text-[#527da3]',
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
            <div className={`${colors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm text-left`}>
                <h2 className={`text-lg font-bold mb-2 ${colors.primaryText}`}>{title}</h2>
                <p className={`${colors.dialogText} mb-6`}>{message}</p>
                <div className="flex justify-end space-x-6">
                    <button onClick={onCancel} className={`font-semibold ${colors.actionButtonText}`}>BATAL</button>
                    <button onClick={onConfirm} className={`font-semibold text-red-500`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

// --- ContextMenu ---
export const ContextMenu: React.FC<{
    menu: { x: number, y: number, message: Message, element: HTMLElement | null };
    currentUser: User;
    onClose: () => void;
    onShowReactionPicker: (messageId: string, element: HTMLElement) => void;
    onNavigate: (screen: Screen, options: any) => void;
    onSaveMessage: (message: Message) => void;
    onEdit: (message: Message) => void;
    onDelete: () => void;
}> = ({ menu, currentUser, onClose, onShowReactionPicker, onNavigate, onSaveMessage, onEdit, onDelete }) => {
    const { theme } = useSettings();
    const colors = {
        menuBg: theme === 'dark' ? 'bg-[#2a3744]' : 'bg-white',
        menuHover: theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100',
        primaryText: theme === 'dark' ? 'text-white' : 'text-black',
    };

    const isOptimistic = menu.message.id.startsWith('temp_');
    
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className={`absolute ${colors.menuBg} rounded-md shadow-lg py-1 z-50`} style={{ top: menu.y, left: menu.x }}>
                {!isOptimistic && <button onClick={() => { if (menu.element) onShowReactionPicker(menu.message.id, menu.element); onClose(); }} className={`w-full text-left flex items-center px-4 py-2 text-sm ${colors.primaryText} ${colors.menuHover}`}><EmojiIcon className="w-5 h-5 mr-3" /><span>Reaksi</span></button>}
                <button onClick={() => { onNavigate('forwardMessage', { messageToForward: menu.message }); onClose(); }} className={`w-full text-left flex items-center px-4 py-2 text-sm ${colors.primaryText} ${colors.menuHover}`}><ForwardIcon className="w-5 h-5 mr-3" /><span>Teruskan</span></button>
                {!isOptimistic && <button onClick={() => { onSaveMessage(menu.message); onClose(); }} className={`w-full text-left flex items-center px-4 py-2 text-sm ${colors.primaryText} ${colors.menuHover}`}><SavedIcon className="w-5 h-5 mr-3" /><span>Simpan</span></button>}
                {menu.message.senderId === currentUser.id && menu.message.content.type === 'text' && !isOptimistic && <button onClick={() => { onEdit(menu.message); onClose(); }} className={`w-full text-left flex items-center px-4 py-2 text-sm ${colors.primaryText} ${colors.menuHover}`}><PencilIcon className="w-5 h-5 mr-3" /><span>Ubah</span></button>}
                {menu.message.senderId === currentUser.id && !isOptimistic && <button onClick={onDelete} className={`w-full text-left flex items-center px-4 py-2 text-sm text-red-500 ${colors.menuHover}`}><TrashIcon className="w-5 h-5 mr-3" /><span>Hapus</span></button>}
            </div>
        </>
    );
};

// --- ReactionPicker ---
export const ReactionPicker: React.FC<{
    picker: { messageId: string, element: HTMLElement };
    currentUser: User;
    messages: Message[];
    onClose: () => void;
    onToggleReaction: (messageId: string, emoji: string) => void;
}> = ({ picker, currentUser, messages, onClose, onToggleReaction }) => {
    const { theme } = useSettings();
    const colors = {
        menuBg: theme === 'dark' ? 'bg-[#2a3744]' : 'bg-white',
    };
    const availableReactions = ['👍', '❤️', '😂', '🎉', '😢', '😠'];
    
    return (
        <div className={`absolute z-30 ${colors.menuBg} p-1 rounded-full shadow-lg flex space-x-1`} style={{ top: `${picker.element.getBoundingClientRect().top - 40}px`, left: `${picker.element.getBoundingClientRect().left}px` }}>
            {availableReactions.map(emoji => {
                const hasReacted = messages.find(m => m.id === picker.messageId)?.reactions?.[emoji]?.includes(currentUser.id);
                return (
                    <button key={emoji} onClick={() => { onToggleReaction(picker.messageId, emoji); onClose(); }} className={`p-1.5 rounded-full text-2xl transition-transform transform hover:scale-125 ${hasReacted ? 'bg-blue-500/30' : 'hover:bg-gray-500/30'}`}>{emoji}</button>
                );
            })}
        </div>
    );
};