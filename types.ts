export type MessageContent = 
  | { type: 'text'; text: string }
  | { type: 'photo'; url: string; caption?: string }
  | { type: 'voice'; url: string; duration: string }
  | { type: 'file'; url: string; fileName: string; fileSize: string }
  | { type: 'deleted' };

export interface Message {
  id: string;
  senderId: string;
  timestamp: string;
  content: MessageContent;
  reactions?: { [key: string]: string[] }; // Emoji -> array of user IDs
  chat_id: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface SavedMessage {
    id: string;
    originalMessage: Message;
    fromName: string;
    fromAvatar: User['avatar'];
    savedAt: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string | { initials: string; color: string; photo?: string; };
  lastMessage: string;
  timestamp: string;
  phone?: string;
  unreadCount?: number;
  isMuted?: boolean;
  isVerified?: boolean;
  isScam?: boolean;
  messageStatus?: 'sent' | 'delivered' | 'read';
  members?: User[];
  photo?: string | null;
  autoDeleteTimer?: AutoDeleteOption;
  description?: string | null;
  messages?: Message[];
  is_group?: boolean;
  created_by?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string | { initials: string; color: string; photo?: string; };
  lastSeen: string;
  phone?: string;
  username?: string;
  bio?: string;
  birthday?: string;
  // Pengaturan privasi sekarang menjadi bagian dari profil pengguna
  phoneNumberPrivacy?: PrivacyOption;
  lastSeenPrivacy?: PrivacyOption;
  onlineStatusPrivacy?: 'everybody' | 'myContacts';
  profilePhotoPrivacy?: PrivacyOption;
  forwardedMessagesPrivacy?: PrivacyOption;
  callsPrivacy?: PrivacyOption;
}

export interface Call {
  id: string;
  userId: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  callType: 'voice' | 'video';
}

export type Screen = 'chatList' | 'settings' | 'search' | 'profile' | 'newGroup' | 'contacts' | 'calls' | 'savedMessages' | 'wip' | 'privacyAndSecurity' | 'blockedUsers' | 'blockUserSelection' | 'chatSettings' | 'autoDeleteMessages' | 'enterNewEmail' | 'lastSeenOnline' | 'phoneNumber' | 'profilePhotos' | 'forwardedMessages' | 'callsPrivacy' | 'notificationsAndSounds' | 'notificationSound' | 'changeNumber' | 'username' | 'profileInfo' | 'camera' | 'groupInfo' | 'chat' | 'groupDetails' | 'editGroup' | 'groupAutoDelete' | 'chatAutoDelete' | 'chatSearch' | 'groupMembers' | 'addMembers' | 'userProfile' | 'newCallContacts' | 'features' | 'contactSearch' | 'login' | 'signup' | 'forgotPassword' | 'activeCall' | 'incomingCall' | 'forwardMessage' | 'sharedMedia';

export type AutoDeleteOption = 'off' | '3min' | '5min' | '7min' | '10min' | '1d' | '1w' | '1mo';

export type PrivacyOption = 'everybody' | 'myContacts' | 'nobody';

export interface Settings {
    theme: 'dark' | 'light';
    textSize: number;
    cornerRadius: number;
    globalAutoDeleteTimer: AutoDeleteOption;
    notificationsPrivate: boolean;
    notificationsGroups: boolean;
    // Pengaturan suara notifikasi baru
    privateTone: string;
    groupTone: string;
}