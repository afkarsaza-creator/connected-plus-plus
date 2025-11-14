import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import * as api from '../services/api';
import type { Call, User } from '../types';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { useNavigation } from './NavigationContext';

const ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
    ],
};

interface CallContextType {
    loading: boolean;
    error: any;
    calls: Call[];
    activeCall: { user: User; type: 'voice' | 'video'; isIncoming: boolean; status: string } | null;
    incomingCall: { user: User; type: 'voice' | 'video' } | null;
    callStreams: { local: MediaStream | null, remote: MediaStream | null };
    isMuted: boolean;
    isLocalVideoOn: boolean;
    isSpeakerphoneOn: boolean;
    addCall: (contactId: string, type: 'incoming' | 'outgoing' | 'missed', callType: 'voice' | 'video') => Promise<Call | null>;
    deleteAllCalls: () => Promise<void>;
    startCall: (userId: string, type: 'voice' | 'video') => Promise<void>;
    endCall: () => void;
    acceptCall: () => Promise<void>;
    toggleMute: () => void;
    toggleVideo: () => void;
    toggleSpeakerphone: (remoteMediaElement: HTMLAudioElement | HTMLVideoElement | null) => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userProfile, setAlert } = useAuth();
    const { allUsers } = useUser();
    const { handleNavigate, handleBack, screen } = useNavigation();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [calls, setCalls] = useState<Call[]>([]);
    
    const [activeCall, setActiveCall] = useState<{ user: User; type: 'voice' | 'video'; isIncoming: boolean; status: string } | null>(null);
    const [incomingCall, setIncomingCall] = useState<{ user: User; type: 'voice' | 'video'} | null>(null);
    const [incomingSdp, setIncomingSdp] = useState<RTCSessionDescriptionInit | null>(null);
    const [callStreams, setCallStreams] = useState<{ local: MediaStream | null, remote: MediaStream | null }>({ local: null, remote: null });
    const [isMuted, setIsMuted] = useState(false);
    const [isLocalVideoOn, setIsLocalVideoOn] = useState(true);
    const [isSpeakerphoneOn, setIsSpeakerphoneOn] = useState(false);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const signalingChannelRef = useRef<RealtimeChannel | null>(null);

    const sendSignal = useCallback(async (userId: string, data: any) => {
        const channel = supabase.channel(`signaling:${userId}`, { config: { broadcast: { ack: true } } });
        await channel.send({ type: 'broadcast', event: 'call-signal', payload: data });
    }, []);

    const cleanupCall = useCallback((shouldGoBack = false) => {
        callStreams.local?.getTracks().forEach(track => track.stop());
        callStreams.remote?.getTracks().forEach(track => track.stop());
        
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        setCallStreams({ local: null, remote: null });
        setActiveCall(null);
        setIncomingCall(null);
        setIncomingSdp(null);
        setIsSpeakerphoneOn(false); // Reset speakerphone state
        
        if (shouldGoBack && (screen === 'activeCall' || screen === 'incomingCall')) {
             handleBack();
        }
    }, [callStreams.local, callStreams.remote, handleBack, screen]);


    const endCall = useCallback(() => {
        if (!activeCall && !incomingCall) return;
        const otherUserId = activeCall?.user.id || incomingCall?.user.id;
        if (otherUserId) {
            sendSignal(otherUserId, { type: 'hang-up' });
        }
        cleanupCall(true);
    }, [activeCall, incomingCall, sendSignal, cleanupCall]);

    const handleSignalingData = useCallback(async (payload: any) => {
        switch (payload.type) {
            case 'offer': {
                const caller = allUsers.find(u => u.id === payload.callerId);
                if (caller && !activeCall && !incomingCall) {
                    setIncomingSdp(payload.sdp);
                    setIncomingCall({ user: caller, type: payload.callType });
                    handleNavigate('incomingCall');
                }
                break;
            }
            case 'answer': {
                if (peerConnectionRef.current && peerConnectionRef.current.signalingState === 'have-local-offer') {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                }
                break;
            }
            case 'ice-candidate': {
                if (peerConnectionRef.current && payload.candidate) {
                    try {
                       await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                    } catch (e) {
                        console.error('Error adding received ice candidate', e);
                    }
                }
                break;
            }
            case 'hang-up': {
                cleanupCall(true);
                break;
            }
        }
    }, [allUsers, activeCall, incomingCall, handleNavigate, cleanupCall]);


    useEffect(() => {
        if (userProfile && !signalingChannelRef.current) {
            const channel = supabase.channel(`signaling:${userProfile.id}`);
            channel
                .on('broadcast', { event: 'call-signal' }, ({ payload }) => {
                    handleSignalingData(payload);
                })
                .subscribe();
            signalingChannelRef.current = channel;
        }

        return () => {
            if (signalingChannelRef.current) {
                supabase.removeChannel(signalingChannelRef.current);
                signalingChannelRef.current = null;
            }
        };
    }, [userProfile, handleSignalingData]);

    const setupPeerConnection = useCallback((otherUserId: string) => {
        if (!userProfile) return null;
        const pc = new RTCPeerConnection(ICE_CONFIG);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal(otherUserId, { type: 'ice-candidate', candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            setCallStreams(prev => ({ ...prev, remote: event.streams[0] }));
            setActiveCall(prev => prev ? { ...prev, status: 'Terhubung' } : null);
        };

        pc.onconnectionstatechange = () => {
            if (!peerConnectionRef.current) return;
            const state = peerConnectionRef.current.connectionState;
            
            switch (state) {
                case 'disconnected':
                    setActiveCall(prev => prev ? { ...prev, status: 'Menyambungkan kembali...' } : null);
                    break;
                case 'failed':
                    setAlert({ message: 'Koneksi panggilan gagal.', type: 'error' });
                    cleanupCall(true);
                    break;
                case 'closed':
                    break;
            }
        };

        return pc;
    }, [sendSignal, userProfile, cleanupCall, setAlert]);

    useEffect(() => {
        if (!userProfile?.id) return;
        const loadCalls = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedCalls = await api.fetchCalls();
                setCalls(fetchedCalls || []);
            } catch (err) {
                console.error("Gagal memuat riwayat panggilan:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadCalls();
    }, [userProfile?.id]);

    const addCall = useCallback(async (contactId: string, type: 'incoming' | 'outgoing' | 'missed', callType: 'voice' | 'video'): Promise<Call | null> => {
        const newCall = await api.addCallRecord(contactId, type, callType);
        if (newCall) {
            setCalls(prev => [newCall, ...prev]);
        }
        return newCall;
    }, []);

    const deleteAllCalls = useCallback(async () => {
        await api.deleteAllCalls();
        setCalls([]);
    }, []);

    const startCall = useCallback(async (userId: string, type: 'voice' | 'video') => {
        if (!userProfile) return;
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
                
                if (type === 'voice') {
                    stream.getVideoTracks().forEach(track => { track.enabled = false; });
                }

                setCallStreams({ local: stream, remote: null });

                const pc = setupPeerConnection(userId);
                if (!pc) return;
                peerConnectionRef.current = pc;

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                sendSignal(userId, { type: 'offer', sdp: offer, callerId: userProfile.id, callType: type });
                
                await addCall(userId, 'outgoing', type);
                setIsLocalVideoOn(type === 'video');
                setIsMuted(false);
                setActiveCall({ user, type, isIncoming: false, status: 'Memanggil...' });
                handleNavigate('activeCall');
            } catch (err) {
                console.error("Error starting call:", err);
                setAlert({ message: 'Tidak dapat memulai panggilan. Periksa izin kamera/mikrofon.', type: 'error' });
                cleanupCall();
            }
        }
    }, [allUsers, addCall, handleNavigate, setAlert, userProfile, setupPeerConnection, sendSignal, cleanupCall]);

    const acceptCall = useCallback(async () => {
        if (!incomingCall || !incomingSdp || !userProfile) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: incomingCall.type === 'video' });
            
            if (incomingCall.type === 'voice') {
                stream.getVideoTracks().forEach(track => { track.enabled = false; });
            }

            setCallStreams(prev => ({ ...prev, local: stream }));

            const pc = setupPeerConnection(incomingCall.user.id);
            if (!pc) return;
            peerConnectionRef.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingSdp));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendSignal(incomingCall.user.id, { type: 'answer', sdp: answer });

            setIsLocalVideoOn(incomingCall.type === 'video');
            setIsMuted(false);
            setActiveCall({ ...incomingCall, status: 'Menghubungkan...', isIncoming: true });
            setIncomingCall(null);
            setIncomingSdp(null);
            handleNavigate('activeCall');

        } catch (err) {
            console.error("Error accepting call:", err);
            setAlert({ message: 'Gagal menerima panggilan. Periksa izin kamera/mikrofon.', type: 'error' });
            cleanupCall(true);
        }
    }, [incomingCall, incomingSdp, handleNavigate, setAlert, userProfile, setupPeerConnection, sendSignal, cleanupCall]);

    const toggleMute = () => {
        if (callStreams.local) {
            callStreams.local.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
            setIsMuted(prev => !prev);
        }
    };
    
    const toggleVideo = () => {
        if (callStreams.local) {
            callStreams.local.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
            setIsLocalVideoOn(prev => !prev);
        }
    };

    const toggleSpeakerphone = useCallback(async (remoteMediaElement: HTMLAudioElement | HTMLVideoElement | null) => {
        if (!remoteMediaElement || typeof (remoteMediaElement as any).setSinkId !== 'function') {
            console.warn('setSinkId() is not supported by this browser.');
            setAlert({ message: 'Mengganti perangkat output audio tidak didukung oleh browser ini.', type: 'success' });
            setIsSpeakerphoneOn(prev => !prev); // Toggle state untuk feedback UI
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
            const speaker = audioOutputs.find(d => d.label.toLowerCase().includes('speaker'));
            const defaultDevice = audioOutputs.find(d => d.deviceId === 'default');

            const nextState = !isSpeakerphoneOn;
            let targetDeviceId = defaultDevice?.deviceId || '';

            if (nextState && speaker) {
                targetDeviceId = speaker.deviceId;
            }
            
            await (remoteMediaElement as any).setSinkId(targetDeviceId);
            setIsSpeakerphoneOn(nextState);

        } catch (err) {
            console.error("Gagal mengganti output audio:", err);
            setAlert({ message: 'Tidak dapat mengganti perangkat audio.', type: 'error' });
        }
    }, [isSpeakerphoneOn, setAlert]);

    const value = {
        loading,
        error,
        calls,
        addCall,
        deleteAllCalls,
        activeCall,
        incomingCall,
        callStreams,
        isMuted,
        isLocalVideoOn,
        isSpeakerphoneOn,
        startCall,
        endCall,
        acceptCall,
        toggleMute,
        toggleVideo,
        toggleSpeakerphone,
    };

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (context === null) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};