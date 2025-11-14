import React, { useRef } from 'react';
import type { Message, User, Chat } from '../../../types';
import { ChatAvatar, MessageStatusIcon, PlayIcon, PauseIcon, FileIcon, AutoDeleteTimerIcon } from '../../../components/icons';
import { useSettings } from '../../../context/SettingsContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface MessageListProps {
  messages: Message[];
  chat: Chat;
  currentUser: User;
  onNavigateToProfile: (user: User) => void;
  onShowContextMenu: (e: { pageX: number, pageY: number }, message: Message, element: HTMLElement | null) => void;
  onShowLightbox: (url: string) => void;
  messageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  highlightedMessageId: string | null;
}

const MessageBubble: React.FC<{
    message: Message;
    isMine: boolean;
    onShowLightbox: (url: string) => void;
    colors: any;
    audioPlayer: ReturnType<typeof useAudioPlayer>;
}> = ({ message, isMine, onShowLightbox, colors, audioPlayer }) => {
    
    const { content } = message;
    switch (content.type) {
        case 'text': return <p className={colors.primaryText}>{content.text}</p>;
        case 'photo': return (
            <div className="cursor-pointer" onClick={() => onShowLightbox(content.url)}>
                <img src={content.url} alt="photo" className="rounded-lg max-w-full h-auto" />
                {content.caption && <p className={`mt-1 ${colors.primaryText}`}>{content.caption}</p>}
            </div>
        );
        case 'voice':
            const isPlaying = audioPlayer.playingMessageId === message.id;
            return (
                <div className="flex items-center space-x-2 min-w-[180px] cursor-pointer" onClick={() => audioPlayer.togglePlayback(message.id, content.url)}>
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMine ? 'bg-white/30 text-white' : 'bg-blue-500 text-white'}`}>{isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}</button>
                    <div className="flex-1 relative h-1 bg-gray-500/50 rounded-full"><div className="h-full bg-blue-400 rounded-full" style={{ width: `${isPlaying ? audioPlayer.playbackProgress : 0}%` }}></div></div>
                    <span className={`text-xs ${colors.secondaryText}`}>{content.duration}</span>
                </div>
            );
        case 'file': return (
            <a href={content.url} target="_blank" rel="noopener noreferrer" download={content.fileName} className="flex items-center space-x-3 min-w-[200px] cursor-pointer group">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0"><FileIcon className="w-6 h-6 text-blue-400" /></div>
                <div className="overflow-hidden">
                    <p className={`font-semibold truncate group-hover:underline ${colors.primaryText}`}>{content.fileName}</p>
                    <p className={`text-sm ${colors.secondaryText}`}>{content.fileSize}</p>
                </div>
            </a>
        );
        case 'deleted': return <p className={`italic ${colors.secondaryText}`}>Pesan dihapus</p>;
        default: return null;
    }
};

const MessageItem: React.FC<{
    message: Message;
    chat: Chat;
    currentUser: User;
    isGroupChat: boolean;
    isDark: boolean;
    colors: any;
    onNavigateToProfile: (user: User) => void;
    onShowContextMenu: (e: { pageX: number; pageY: number; }, message: Message, element: HTMLElement | null) => void;
    onShowLightbox: (url: string) => void;
    messageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
    highlightedMessageId: string | null;
    audioPlayer: ReturnType<typeof useAudioPlayer>;
}> = ({ message, chat, currentUser, isGroupChat, isDark, colors, onNavigateToProfile, onShowContextMenu, onShowLightbox, messageRefs, highlightedMessageId, audioPlayer }) => {
    
    const bubbleRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<number | null>(null);

    const isMine = message.senderId === currentUser.id;
    const sender = isGroupChat ? chat.members?.find(m => m.id === message.senderId) : null;
    
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (message.content.type !== 'deleted') {
            onShowContextMenu(e, message, bubbleRef.current);
        }
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = window.setTimeout(() => {
            if (message.content.type !== 'deleted') {
                onShowContextMenu(e.touches[0], message, bubbleRef.current);
            }
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };
    
    return (
        <div ref={el => { if (el) messageRefs.current.set(message.id, el); else messageRefs.current.delete(message.id); }} className={`transition-colors duration-1000 p-1 -m-1 rounded-lg ${message.id === highlightedMessageId ? colors.highlightBg : ''}`}>
             <div 
                 className={`flex my-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                 onContextMenu={handleContextMenu}
                 onTouchStart={handleTouchStart}
                 onTouchEnd={handleTouchEnd}
                 onTouchCancel={handleTouchEnd}
             >
                {!isMine && isGroupChat && sender && (
                    <ChatAvatar avatar={sender.avatar} size="small" onClick={() => onNavigateToProfile(sender)} className="cursor-pointer mr-2 self-end mb-1" />
                )}
                <div ref={bubbleRef} className="relative">
                    <div className={`p-2 rounded-lg max-w-xs md:max-w-md ${isMine ? colors.myBubbleBg : colors.otherBubbleBg} shadow-sm`}>
                        {!isMine && isGroupChat && sender && (
                            <p onClick={() => onNavigateToProfile(sender)} className="font-bold text-sm text-green-400 mb-1 cursor-pointer">{sender.name}</p>
                        )}
                        <MessageBubble
                            message={message}
                            isMine={isMine}
                            onShowLightbox={onShowLightbox}
                            colors={colors}
                            audioPlayer={audioPlayer}
                        />
                        <div className="flex justify-end items-center mt-1 space-x-1">
                            {chat.autoDeleteTimer && chat.autoDeleteTimer !== 'off' && message.content.type !== 'deleted' && (
                                <AutoDeleteTimerIcon className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            )}
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{message.timestamp}</span>
                            {isMine && message.content.type !== 'deleted' && (
                                <MessageStatusIcon status={message.status} className={`w-4 h-4 ${message.status === 'read' ? 'text-green-400' : colors.secondaryText}`} />
                            )}
                        </div>
                    </div>
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <div className={`absolute -bottom-3 ${isMine ? 'right-2' : 'left-2'} flex space-x-1`}>
                        {Object.entries(message.reactions).map(([emoji, userIds]) => {
                            const reactors = userIds as string[];
                            if (reactors.length === 0) return null;
                            const hasReacted = reactors.includes(currentUser.id);
                            return (
                                <button key={emoji} onClick={() => {}} className={`px-1.5 py-0.5 rounded-full flex items-center space-x-1 text-xs shadow-md ${hasReacted ? (isDark ? 'bg-blue-600' : 'bg-blue-200') : colors.reactionBg}`}>
                                    <span>{emoji}</span>
                                    <span className={hasReacted ? (isDark ? 'text-white' : 'text-blue-800') : colors.primaryText}>{reactors.length}</span>
                                </button>
                            );
                        })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const MessageList: React.FC<MessageListProps> = ({
    messages, chat, currentUser, onNavigateToProfile, onShowContextMenu, onShowLightbox, messageRefs, highlightedMessageId
}) => {
    const { theme } = useSettings();
    const audioPlayer = useAudioPlayer();
    const isDark = theme === 'dark';
    const isGroupChat = chat.is_group;

    const colors = {
        myBubbleBg: isDark ? 'bg-[#2b5278]' : 'bg-[#e1ffc7]',
        otherBubbleBg: isDark ? 'bg-[#182533]' : 'bg-white',
        primaryText: isDark ? 'text-white' : 'text-black',
        secondaryText: isDark ? 'text-gray-400' : 'text-gray-500',
        reactionBg: isDark ? 'bg-gray-700/80' : 'bg-white/80',
        highlightBg: isDark ? 'bg-blue-500/20' : 'bg-blue-300/30',
    };

    return (
        <div>
            {messages.map(msg => (
                <MessageItem
                    key={msg.id}
                    message={msg}
                    chat={chat}
                    currentUser={currentUser}
                    onNavigateToProfile={onNavigateToProfile}
                    onShowContextMenu={onShowContextMenu}
                    onShowLightbox={onShowLightbox}
                    messageRefs={messageRefs}
                    highlightedMessageId={highlightedMessageId}
                    colors={colors}
                    audioPlayer={audioPlayer}
                    isGroupChat={isGroupChat}
                    isDark={isDark}
                />
            ))}
        </div>
    );
};

export default MessageList;