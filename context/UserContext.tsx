import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api';
import type { User } from '../types';
import { useAuth } from './AuthContext';

interface UserContextType {
  loading: boolean;
  error: any;
  users: User[]; // Contacts
  allUsers: User[];
  contactIds: Set<string>;
  blockedUserIds: string[];
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  addContact: (userId: string) => Promise<boolean>;
  deleteContact: (userId: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]); // Contacts
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [contactIds, setContactIds] = useState<Set<string>>(new Set());
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userProfile?.id) return;
    
    const loadUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [allUsersData, contactsData, blockedData] = await Promise.all([
          api.fetchAllProfiles(),
          api.fetchContacts(userProfile.id),
          api.fetchBlockedUsers()
        ]);
        
        if (allUsersData) {
          setAllUsers(allUsersData);
          const contactIdSet = new Set(contactsData?.map(c => c.contact_id) || []);
          setContactIds(contactIdSet);
          setUsers(allUsersData.filter(u => contactIdSet.has(u.id)));
        }

        setBlockedUserIds(blockedData?.map(b => b.blocked_user_id) || []);

      } catch (err) {
        console.error("Gagal memuat data pengguna:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [userProfile?.id]);
  
  useEffect(() => {
    if (!userProfile || loading) return; 

    setAllUsers(prev => prev.map(u => u.id === userProfile.id ? userProfile : u));
    setUsers(prev => prev.map(u => u.id === userProfile.id ? userProfile : u));

    if (activeUser?.id === userProfile.id) {
        setActiveUser(userProfile);
    }
  }, [userProfile, activeUser?.id, loading]);

  const blockUser = useCallback(async (userId: string) => {
    const success = await api.blockUser(userId);
    if (success) {
        setBlockedUserIds(prev => [...prev, userId]);
    }
  }, []);

  const unblockUser = useCallback(async (userId: string) => {
    const success = await api.unblockUser(userId);
    if (success) {
        setBlockedUserIds(prev => prev.filter(id => id !== userId));
    }
  }, []);

  const addContact = useCallback(async (userId: string) => {
    const success = await api.addContact(userId);
    if (success) {
        setContactIds(prev => new Set(prev).add(userId));
        const userToAdd = allUsers.find(u => u.id === userId);
        if(userToAdd) {
            setUsers(prev => [...prev, userToAdd].sort((a, b) => a.name.localeCompare(b.name)));
        }
    }
    return success;
  }, [allUsers]);

  const deleteContact = useCallback(async (userId: string) => {
    const success = await api.deleteContact(userId);
    if (success) {
        setContactIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
        setUsers(prev => prev.filter(u => u.id !== userId));
    }
    return success;
  }, []);

  const value = {
    loading,
    error,
    users,
    allUsers,
    contactIds,
    blockedUserIds,
    activeUser,
    setActiveUser,
    blockUser,
    unblockUser,
    addContact,
    deleteContact
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};