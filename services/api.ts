import { supabase } from '../supabaseClient';
import type { User, Chat, Call, SavedMessage, Message, MessageContent, AutoDeleteOption } from '../types';

// =====================================================================
// == Data Mapping Utilities
// =====================================================================

const mapProfileToUser = (profile: any, currentUserId?: string): User => {
    if (!profile) {
        // Ini seharusnya tidak terjadi jika anggota disaring, tetapi sebagai pengaman
        return {
            id: `invalid-user-${Date.now()}`,
            name: 'Pengguna Tidak Dikenal',
            avatar: { initials: '?', color: 'bg-gray-400' },
            lastSeen: 'offline'
        };
    }
    const isCurrentUser = profile.id === currentUserId;
    return {
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        avatar: { 
            initials: `${(profile.first_name || ' ').charAt(0)}${(profile.last_name || ' ').charAt(0)}`.trim().toUpperCase(), 
            color: 'bg-blue-500',
            photo: profile.avatar_url,
        },
        lastSeen: isCurrentUser ? 'daring' : 'luring',
        phone: profile.phone,
        username: profile.username,
        bio: profile.bio,
        birthday: profile.birth_date,
        // Petakan kolom privasi dari DB ke objek Pengguna
        phoneNumberPrivacy: profile.phone_number_privacy,
        lastSeenPrivacy: profile.last_seen_privacy,
        profilePhotoPrivacy: profile.profile_photo_privacy,
        forwardedMessagesPrivacy: profile.forwarded_messages_privacy,
        callsPrivacy: profile.calls_privacy,
        onlineStatusPrivacy: profile.online_status_privacy,
    };
};

const mapRawChatToChat = (rawChat: any, currentUserId: string | undefined): Chat => {
    // Pemeriksaan ketahanan tertinggi
    if (!rawChat || typeof rawChat !== 'object') {
        console.error("mapRawChatToChat menerima rawChat yang tidak valid:", rawChat);
        // Mengembalikan objek obrolan dummy untuk mencegah crash seluruh daftar
        return {
            id: `invalid-chat-${Date.now()}`,
            name: 'Data Obrolan Tidak Valid',
            avatar: { initials: '!', color: 'bg-red-500' },
            lastMessage: 'Gagal memproses obrolan',
            timestamp: '',
            is_group: false,
            members: [],
            messages: []
        };
    }

    const membersArray = Array.isArray(rawChat.members) ? rawChat.members.filter(Boolean) : [];

    const otherMember = rawChat.is_group || !membersArray.length
        ? null 
        : membersArray.find((m: any) => m.id !== currentUserId);

    const chatName = rawChat.is_group 
        ? rawChat.name || "Grup"
        : (otherMember ? `${otherMember.first_name || ''} ${otherMember.last_name || ''}`.trim() : 'Obrolan');

    const chatAvatar = rawChat.is_group 
        ? { initials: (rawChat.name || 'G').charAt(0).toUpperCase(), color: 'bg-purple-500', photo: rawChat.photo_url }
        : (otherMember 
            ? { 
                initials: `${(otherMember.first_name || ' ').charAt(0)}${(otherMember.last_name || ' ').charAt(0)}`.trim().toUpperCase(), 
                color: 'bg-blue-500', 
                photo: otherMember.avatar_url
              }
            : { initials: '?', color: 'bg-gray-400', photo: undefined });
            
    const lastMessageContent = rawChat.last_message?.content;
    let lastMessageText = 'Belum ada pesan';
    // FIX: Logika yang lebih kuat untuk menangani semua jenis konten pesan, termasuk file dan foto dengan keterangan.
    if (lastMessageContent && typeof lastMessageContent === 'object' && lastMessageContent.type) {
        switch(lastMessageContent.type) {
            case 'text':
                lastMessageText = lastMessageContent.text || 'Pesan teks';
                break;
            case 'photo':
                lastMessageText = (lastMessageContent as any).caption || 'Foto';
                break;
            case 'voice':
                lastMessageText = 'Pesan suara';
                break;
            case 'file':
                lastMessageText = 'Berkas';
                break;
            case 'deleted':
                lastMessageText = 'Pesan dihapus';
                break;
            default:
                lastMessageText = 'Pesan';
                break;
        }
    } else if (rawChat.last_message) {
        // Fallback jika pesan terakhir ada tetapi kontennya tidak valid.
        lastMessageText = 'Pesan';
    }

    const lastMessageSenderId = rawChat.last_message?.user_id;

    return {
        id: rawChat.id,
        name: chatName || 'Obrolan Tidak Dikenal',
        avatar: chatAvatar,
        lastMessage: lastMessageText,
        timestamp: new Date(rawChat.last_message?.created_at || rawChat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        members: membersArray.map(member => mapProfileToUser(member, currentUserId)),
        messageStatus: lastMessageSenderId === currentUserId ? rawChat.last_message?.status : undefined,
        photo: rawChat.photo_url,
        is_group: rawChat.is_group,
        isMuted: rawChat.is_muted,
        autoDeleteTimer: rawChat.auto_delete_timer,
        description: rawChat.description,
        created_by: rawChat.created_by,
        messages: [],
    };
};

export const mapRawMessageToMessage = (raw: any): Message => ({
    id: raw.id,
    senderId: raw.user_id,
    timestamp: new Date(raw.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content: raw.content as MessageContent,
    reactions: raw.reactions,
    chat_id: raw.chat_id,
    status: raw.status,
});

// =====================================================================
// == Storage Management
// =====================================================================

// FIX: Implement missing 'uploadFile' function.
export const uploadFile = async (
    file: File, 
    bucket: 'group-avatars' | 'chat-attachments' | 'profile-avatars', 
    pathPrefix: string = ''
): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

    const { error } = await supabase.storage.from(bucket).upload(filePath, file);

    if (error) {
        console.error(`Error uploading file to ${bucket}:`, error.message);
        throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
};

// FIX: Implement missing 'deleteAvatar' function.
export const deleteAvatar = async (avatarUrl: string) => {
    if (!avatarUrl) return;

    try {
        const urlPath = new URL(avatarUrl).pathname;
        const publicPathIndex = urlPath.indexOf('/public/');

        if (publicPathIndex === -1) {
            console.error("Could not find '/public/' segment in avatar URL path:", avatarUrl);
            return;
        }

        const pathAfterPublic = urlPath.substring(publicPathIndex + '/public/'.length);
        const [bucket, ...pathSegments] = pathAfterPublic.split('/');
        const path = pathSegments.join('/');

        if (bucket && path) {
            const { error } = await supabase.storage.from(bucket).remove([path]);
            if (error && error.message !== 'The resource was not found') { // Ignore "not found" errors
                console.error('Error deleting avatar from storage:', error);
            }
        }
    } catch (e) {
        console.error("Could not parse avatar URL to delete:", avatarUrl, e);
    }
};

// =====================================================================
// == User and Profile Management
// =====================================================================

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error.message || error);
        throw error;
    }

    return data ? mapProfileToUser(data, userId) : null;
};

export const fetchAllProfiles = async (): Promise<User[] | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error('Error fetching all profiles:', error.message || error);
        throw error;
    }
    return data.map(profile => mapProfileToUser(profile, currentUserId));
};

export const updateUserProfile = async (userId: string, updates: Partial<User & { first_name?: string; last_name?: string; birth_date?: string; avatar_url?: string }>) => {
    const dbUpdates: { [key: string]: any } = {};
    for (const key in updates) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        dbUpdates[snakeKey] = (updates as any)[key];
    }

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (error) {
        console.error("Error updating profile:", error.message || error);
        throw error;
    }
};

// =====================================================================
// == Chat Management
// =====================================================================

export const fetchUserChats = async (): Promise<Chat[] | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: rawChats, error } = await supabase.rpc('get_user_chats_with_details');

    if (error) {
        console.error("CRITICAL: Gagal memuat data obrolan melalui RPC `get_user_chats_with_details`.", error);
        throw error;
    }

    if (!rawChats || rawChats.length === 0) {
        return [];
    }

    const mappedChats = rawChats.map((rawChat: any) => mapRawChatToChat(rawChat, user.id));
    
    mappedChats.sort((a, b) => {
        const timeA = rawChats.find(c => c.id === a.id)?.last_message?.created_at;
        const timeB = rawChats.find(c => c.id === b.id)?.last_message?.created_at;
        
        if (!timeA) return 1;
        if (!timeB) return -1;

        return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return mappedChats;
};


export const createOneOnOneChat = async (otherUserId: string): Promise<string | null> => {
    const { data, error } = await supabase.rpc('create_one_on_one_chat', { other_user_id: otherUserId });
    if (error) {
        console.error('Error creating or finding one-on-one chat:', error.message || error);
        throw error;
    }
    return data;
};

export const fetchChatById = async (chatId: string): Promise<Chat | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    const { data: rawChat, error } = await supabase
        .rpc('get_chat_details_by_id', { p_chat_id: chatId });

    if (error) {
        console.error(`Error fetching chat by ID ${chatId}:`, error.message || error);
        throw error;
    }
    
    if (!rawChat) {
        return null;
    }

    try {
        return mapRawChatToChat(rawChat, currentUserId);
    } catch (e) {
        console.error("Failed to map single chat:", e, "Raw data:", rawChat);
        return null;
    }
};

export const createGroupChat = async (name: string, memberIds: string[], photoFile: File | null): Promise<Chat | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Pengguna tidak terautentikasi");

    const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
            name: name,
            is_group: true,
            created_by: user.id
        })
        .select()
        .single();
    
    if (chatError) {
        console.error('Error creating group chat row:', chatError);
        throw chatError;
    }

    const newChatId = chatData.id;

    try {
        const participants = memberIds.map(memberId => ({
            chat_id: newChatId,
            user_id: memberId
        }));
        const { error: participantsError } = await supabase
            .from('chat_participants')
            .insert(participants);
        if (participantsError) throw participantsError;

        if (photoFile) {
            // FIX: Call the newly implemented 'uploadFile' function.
            const photoUrl = await uploadFile(photoFile, 'group-avatars', newChatId);
            if (photoUrl) {
                const { error: updateError } = await supabase
                    .from('chats')
                    .update({ photo_url: photoUrl })
                    .eq('id', newChatId);
                if (updateError) throw updateError;
            }
        }

        const newChat = await fetchChatById(newChatId);
        return newChat;

    } catch (error) {
        console.error('Error during group creation steps:', error);
        await supabase.from('chats').delete().eq('id', newChatId);
        throw error;
    }
};


export const updateGroupInfo = async (chatId: string, name: string, photo: string | null, description: string) => {
    const { error } = await supabase.from('chats').update({ name, photo_url: photo, description }).eq('id', chatId);
    if (error) {
        console.error("Error updating group info:", error.message || error);
        throw error;
    }
};

export const updateChatAutoDeleteTimer = async (chatId: string, timer: AutoDeleteOption) => {
    const { error } = await supabase
        .rpc('update_auto_delete_timer', {
            p_chat_id: chatId,
            p_timer_value: timer
        });

    if (error) {
        console.error("Error updating chat auto-delete timer:", error.message || error);
        throw error;
    }
};

export const addMembersToGroup = async (chatId: string, userIds: string[]) => {
    const participants = userIds.map(userId => ({ chat_id: chatId, user_id: userId }));
    const { error } = await supabase.from('chat_participants').insert(participants);
    if (error) {
        console.error("Error adding members:", error.message || error);
        throw error;
    }
};

export const removeMemberFromGroup = async (chatId: string, memberId: string) => {
    const { error } = await supabase.from('chat_participants').delete().match({ chat_id: chatId, user_id: memberId });
    if (error) {
        console.error("Error removing member:", error.message || error);
        throw error;
    }
};

export const leaveGroup = async (chatId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { error } = await supabase.from('chat_participants').delete().match({ chat_id: chatId, user_id: user.id });
        if (error) {
            console.error("Error leaving group:", error.message || error);
            throw error;
        }
    }
};

export const updateMuteStatus = async (chatId: string, isMuted: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { error } = await supabase
            .from('chat_participants')
            .update({ is_muted: isMuted })
            .match({ chat_id: chatId, user_id: user.id });
        
        if (error) {
            console.error("Error updating mute status:", error.message || error);
            throw error;
        }
    }
};

// =====================================================================
// == Message Management
// =====================================================================

export const fetchMessagesForChat = async (chatId: string): Promise<Message[] | null> => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error(`Error fetching messages for chat ${chatId}:`, error.message || error);
        throw error;
    }
    return data.map(mapRawMessageToMessage);
};

export const sendMessage = async (chatId: string, content: MessageContent) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('messages').insert({
        chat_id: chatId,
        user_id: user.id,
        content: content,
    });
    if (error) {
        console.error("Error sending message:", error.message || error);
        throw error;
    }
};

export const deleteMessage = async (messageId: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) {
        console.error("Error deleting message:", error.message || error);
        throw error;
    }
};

export const editMessage = async (messageId: string, newContent: MessageContent) => {
    const { error } = await supabase
        .from('messages')
        .update({ content: newContent })
        .eq('id', messageId);
    if (error) {
        console.error("Error editing message:", error.message || error);
        throw error;
    }
};

export const clearChatHistory = async (chatId: string) => {
    const { error } = await supabase.rpc('clear_chat_history', {
      p_chat_id: chatId,
    });
  
    if (error) {
      console.error(`Error clearing history for chat ${chatId} via RPC:`, error.message || error);
      throw error;
    }
};

export const toggleReaction = async (messageId: string, emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.rpc('toggle_reaction_on_message', {
        p_message_id: messageId,
        p_user_id: user.id,
        p_emoji: emoji,
    });

    if (error) {
        console.error("Error toggling reaction:", error.message || error);
        throw error;
    }
};

export const markMessagesAsRead = async (chatId: string) => {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_chat_id: chatId,
    });
  
    if (error) {
      console.error("Gagal menandai pesan sebagai telah dibaca:", error.message);
    }
};

export const saveMessage = async (message: Message, fromChat: Chat, currentUser: User): Promise<SavedMessage | null> => {
    const fromUser = fromChat.members?.find(m => m.id === message.senderId) || { name: 'Unknown', avatar: 'deleted' };
    
    const { data, error } = await supabase.from('saved_messages').insert({
        user_id: currentUser.id,
        original_message: message,
        from_name: fromUser.name,
        from_avatar_url: typeof fromUser.avatar === 'object' ? fromUser.avatar.photo : null,
    }).select().single();
    
    if (error) {
        console.error("Error saving message:", error.message || error);
        throw error;
    }
    return {
        id: data.id,
        originalMessage: data.original_message,
        fromName: data.from_name,
        fromAvatar: { initials: '?', color: 'bg-gray-400', photo: data.from_avatar_url },
        savedAt: new Date(data.created_at).toISOString(),
    };
};

export const fetchSavedMessages = async (): Promise<SavedMessage[] | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase.from('saved_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching saved messages:', error.message || error);
        throw error;
    }
    return data.map(sm => ({
        id: sm.id,
        originalMessage: sm.original_message,
        fromName: sm.from_name,
        fromAvatar: { initials: '?', color: 'bg-gray-400', photo: sm.from_avatar_url },
        savedAt: new Date(sm.created_at).toISOString(),
    }));
};

export const deleteSavedMessage = async (savedMessageId: string) => {
    const { error } = await supabase.from('saved_messages').delete().eq('id', savedMessageId);
    if (error) {
        console.error("Error deleting saved message:", error.message || error);
        throw error;
    }
};

// =====================================================================
// == Contacts Management
// =====================================================================

export const fetchContacts = async (userId: string): Promise<{ contact_id: string }[] | null> => {
    const { data, error } = await supabase.from('contacts').select('contact_id').eq('user_id', userId);
    if (error) {
        console.error("Error fetching contacts:", error.message || error);
        throw error;
    }
    return data;
};

export const addContact = async (contactId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('contacts').upsert({ user_id: user.id, contact_id: contactId });
    if (error) {
        console.error("Error adding contact:", error.message || error);
        throw error;
    }
    return true;
};

export const deleteContact = async (contactId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('contacts').delete().match({ user_id: user.id, contact_id: contactId });
    if (error) {
        console.error("Error deleting contact:", error.message || error);
        throw error;
    }
    return true;
};

// =====================================================================
// == Blocked Users Management
// =====================================================================

export const fetchBlockedUsers = async (): Promise<{ blocked_user_id: string }[] | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_user_id')
        .eq('user_id', user.id);
    if (error) {
        console.error("Error fetching blocked users:", error.message || error);
        throw error;
    }
    return data;
};

// FIX: Implement the 'blockUser' function correctly.
export const blockUser = async (userIdToBlock: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('blocked_users')
        .insert({ user_id: user.id, blocked_user_id: userIdToBlock });

    if (error) {
        console.error("Error blocking user:", error.message || error);
        throw error;
    }
    return !error;
};

// FIX: Implement the missing 'unblockUser' function.
export const unblockUser = async (userIdToUnblock: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('blocked_users')
        .delete()
        .match({ user_id: user.id, blocked_user_id: userIdToUnblock });
    
    if (error) {
        console.error("Error unblocking user:", error.message || error);
        throw error;
    }
    return !error;
};

// =====================================================================
// == Call Management
// =====================================================================

// FIX: Implement missing 'fetchCalls' function.
export const fetchCalls = async (): Promise<Call[] | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching calls:", error.message || error);
        throw error;
    }
    return data.map(c => ({
        id: c.id,
        userId: c.contact_id,
        type: c.type,
        timestamp: new Date(c.created_at).toLocaleString(),
        callType: c.call_type,
    }));
};

// FIX: Implement missing 'addCallRecord' function.
export const addCallRecord = async (contactId: string, type: 'incoming' | 'outgoing' | 'missed', callType: 'voice' | 'video'): Promise<Call | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('calls')
        .insert({
            user_id: user.id,
            contact_id: contactId,
            type: type,
            call_type: callType,
        })
        .select()
        .single();
    
    if (error) {
        console.error("Error adding call record:", error.message || error);
        throw error;
    }
    return data ? {
        id: data.id,
        userId: data.contact_id,
        type: data.type,
        timestamp: new Date(data.created_at).toLocaleString(),
        callType: data.call_type,
    } : null;
};

// FIX: Implement missing 'deleteAllCalls' function.
export const deleteAllCalls = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('calls').delete().eq('user_id', user.id);
    if (error) {
        console.error("Error deleting all calls:", error.message || error);
        throw error;
    }
};