import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Import `VideoIcon` to fix 'Cannot find name' error.
import { ChatAvatar, EndCallIcon, CameraOffIcon, FlipCameraIcon, MicrophoneIcon, MuteOffIcon, SpeakerIcon, PersonAddIcon, ChatBubbleIcon, VideoIcon } from '../../components/icons';
import { useCall } from '../../context/CallContext';
import { useNavigation } from '../../context/NavigationContext';

interface ActiveCallScreenProps {
  onFlipCamera?: () => void;
  hasMultipleCameras?: boolean;
}

const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({ 
  onFlipCamera = () => {}, 
  hasMultipleCameras = false 
}) => {
  const { 
    activeCall, callStreams, isMuted, isLocalVideoOn, isSpeakerphoneOn, 
    endCall, toggleMute, toggleVideo, toggleSpeakerphone 
  } = useCall();
  const { handleBack } = useNavigation();
  
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const [position, setPosition] = useState({ right: 16, top: 16 });
  const localVideoContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialRight: 0, initialTop: 0 });
  const controlsTimeoutRef = useRef<number | null>(null);

  const { local: localStream, remote: remoteStream } = callStreams;

  const localVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && localStream) node.srcObject = localStream;
  }, [localStream]);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Memastikan stream jarak jauh diputar di elemen yang sesuai
    if (remoteStream) {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  useEffect(() => {
    let durationInterval: number;
    if (activeCall?.status === 'Terhubung') {
      durationInterval = window.setInterval(() => setDuration(prev => prev + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(durationInterval);
  }, [activeCall?.status]);
  
  useEffect(() => {
      if (activeCall?.type === 'video' && controlsVisible) {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = window.setTimeout(() => setControlsVisible(false), 4000);
      }
      return () => {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      };
  }, [controlsVisible, activeCall?.type]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    let newRight = dragStartRef.current.initialRight - dx;
    let newTop = dragStartRef.current.initialTop + dy;
    const vw = window.innerWidth, vh = window.innerHeight;
    const elWidth = localVideoContainerRef.current?.offsetWidth || 96;
    const elHeight = localVideoContainerRef.current?.offsetHeight || 144;
    const margin = 16;
    if (newTop < margin) newTop = margin;
    if (newTop > vh - elHeight - margin) newTop = vh - elHeight - margin;
    if (newRight < margin) newRight = margin;
    if (newRight > vw - elWidth - margin) newRight = vw - elWidth - margin;
    setPosition({ right: newRight, top: newTop });
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    if (localVideoContainerRef.current) localVideoContainerRef.current.style.transition = 'top 0.2s, right 0.2s';
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  }, [handleDragMove]);
  
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    if (localVideoContainerRef.current) localVideoContainerRef.current.style.transition = 'none';
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY, initialRight: position.right, initialTop: position.top };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  }, [position, handleDragMove, handleDragEnd]);

  useEffect(() => {
    const handleResize = () => {
      if (!localVideoContainerRef.current) return;
      const vw = window.innerWidth, vh = window.innerHeight;
      const elWidth = localVideoContainerRef.current.offsetWidth;
      const elHeight = localVideoContainerRef.current.offsetHeight;
      const margin = 16;
      let newRight = position.right, newTop = position.top, needsUpdate = false;
      if (newTop < margin) { newTop = margin; needsUpdate = true; }
      if (newTop > vh - elHeight - margin) { newTop = vh - elHeight - margin; needsUpdate = true; }
      if (newRight < margin) { newRight = margin; needsUpdate = true; }
      if (newRight > vw - elWidth - margin) { newRight = vw - elWidth - margin; needsUpdate = true; }
      if (needsUpdate) setPosition({ right: newRight, top: newTop });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);
  
  const handleToggleSpeaker = () => {
    const mediaElement = activeCall?.type === 'video' ? remoteVideoRef.current : remoteAudioRef.current;
    toggleSpeakerphone(mediaElement);
  };

  if (!activeCall) return null;

  const { user, type, status } = activeCall;

  const toggleControls = () => { if (type === 'video') setControlsVisible(prev => !prev); };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const VoiceCallUI = () => (
    <div className="h-full flex flex-col bg-gray-800 text-white justify-between items-center p-8">
        <div/> {/* Spacer for top content */}
        <div className="text-center flex-1 flex flex-col justify-center items-center">
            <ChatAvatar avatar={user.avatar} size="x-large" />
            <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
            <p className="text-gray-300 mt-2">{status === 'Terhubung' ? formatDuration(duration) : status}</p>
        </div>
        <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-4 justify-items-center items-center pb-8">
            <CallControlButton icon={isMuted ? <MuteOffIcon className="w-7 h-7" /> : <MicrophoneIcon className="w-7 h-7" />} label="Bisukan" isActive={isMuted} onClick={toggleMute} />
            <CallControlButton icon={<ChatBubbleIcon className="w-7 h-7" />} label="Obrolan" onClick={handleBack} />
            <CallControlButton icon={<SpeakerIcon className="w-7 h-7" />} label="Speaker" isActive={isSpeakerphoneOn} onClick={handleToggleSpeaker} />
        </div>
        <div className="pb-8"><button onClick={endCall} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform" aria-label="Akhiri panggilan"><EndCallIcon className="w-10 h-10" /></button></div>
    </div>
  );

  const VideoCallUI = () => (
    <div className="h-full flex flex-col bg-black text-white relative" onClick={toggleControls}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">{remoteStream ? <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><ChatAvatar avatar={user.avatar} size="x-large"/><p className="text-gray-300 mt-4 animate-pulse">{status}</p></div>}</div>
        {localStream && <div ref={localVideoContainerRef} className={`absolute w-24 h-36 bg-gray-800 rounded-lg z-20 cursor-move shadow-lg overflow-hidden transition-all duration-300 ${isLocalVideoOn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ right: `${position.right}px`, top: `${position.top}px`}} onMouseDown={handleDragStart} onTouchStart={handleDragStart} onClick={(e) => e.stopPropagation()}><video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" /></div>}
        <div className={`absolute inset-0 z-20 flex flex-col justify-between p-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-black/20 p-2 rounded-lg self-start"><h1 className="text-xl font-semibold">{user.name}</h1><p className="text-gray-300 text-sm">{status === 'Terhubung' ? formatDuration(duration) : status}</p></div>
            <div className="flex justify-around items-center w-full max-w-sm mx-auto p-4 bg-black/30 rounded-full backdrop-blur-sm">
                 <CallControlButton icon={isMuted ? <MuteOffIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />} isActive={isMuted} onClick={toggleMute} small/>
                 <CallControlButton icon={isLocalVideoOn ? <VideoIcon className="w-6 h-6" /> : <CameraOffIcon className="w-6 h-6" />} isActive={!isLocalVideoOn} onClick={toggleVideo} small/>
                 {hasMultipleCameras && <CallControlButton icon={<FlipCameraIcon className="w-6 h-6" />} onClick={onFlipCamera} small/>}
                <CallControlButton icon={<EndCallIcon className="w-6 h-6" />} onClick={endCall} destructive small/>
            </div>
        </div>
    </div>
  );
  
  return (
    <>
      {/* Elemen audio ini selalu ada untuk menangani audio stream jarak jauh,
          bahkan dalam panggilan video (di mana video ditampilkan secara terpisah).
          Ini memungkinkan kita mengontrol output audio (speaker/earpiece) secara konsisten. */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {type === 'video' ? <VideoCallUI /> : <VoiceCallUI />}
    </>
  );
};

interface CallControlButtonProps { icon: React.ReactNode; label?: string; isActive?: boolean; onClick?: () => void; destructive?: boolean; small?: boolean; }
const CallControlButton: React.FC<CallControlButtonProps> = ({ icon, label, isActive, onClick, destructive, small }) => {
    const sizeClasses = small ? 'w-14 h-14' : 'w-16 h-16';
    const buttonClass = destructive ? 'bg-red-500 text-white' : (isActive ? 'bg-white text-black' : 'bg-white/20 text-white backdrop-blur-sm');
    return (<div className="flex flex-col items-center space-y-2 text-center" style={{ width: small ? 'auto' : '80px' }}><button onClick={onClick} className={`${sizeClasses} rounded-full flex items-center justify-center transition-colors shadow-lg transform hover:scale-105 ${buttonClass}`}>{icon}</button>{label && <span className="text-sm text-white font-medium">{label}</span>}</div>);
};

export default ActiveCallScreen;