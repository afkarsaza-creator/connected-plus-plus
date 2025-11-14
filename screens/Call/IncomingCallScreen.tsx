import React from 'react';
import { ChatAvatar, EndCallIcon, CallIcon, VideoIcon } from '../../components/icons';
import { useCall } from '../../context/CallContext';

const IncomingCallScreen: React.FC = () => {
  const { incomingCall, acceptCall, endCall } = useCall();

  if (!incomingCall) return null;

  const { user, type } = incomingCall;
  const photoUrl = typeof user.avatar === 'object' && user.avatar.photo ? user.avatar.photo : '';
  
  return (
    <div className="h-full flex flex-col bg-gray-800 text-white items-center p-8 bg-cover bg-center relative overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl"
            style={{ backgroundImage: photoUrl ? `url(${photoUrl})` : '' }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 pt-16">
            <ChatAvatar avatar={user.avatar} size="x-large" />
            <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
                {type === 'video' ? <VideoIcon className="w-5 h-5 text-gray-300" /> : <CallIcon className="w-5 h-5 text-gray-300" />}
                <p className="text-gray-300">Panggilan {type === 'video' ? 'Video' : 'Suara'} cONnected+</p>
            </div>
        </div>
        
        <div className="w-full flex justify-around items-center relative z-10 pb-8 animate-slide-up">
            <div className="flex flex-col items-center space-y-2">
                <button 
                    onClick={endCall}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
                    aria-label="Tolak panggilan"
                >
                    <EndCallIcon className="w-10 h-10" />
                </button>
                <span>Tolak</span>
            </div>
             <div className="flex flex-col items-center space-y-2">
                <button 
                    onClick={acceptCall}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
                    aria-label="Terima panggilan"
                >
                     {type === 'video' ? <VideoIcon className="w-8 h-8" /> : <CallIcon className="w-8 h-8" />}
                </button>
                <span>Terima</span>
            </div>
        </div>
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default IncomingCallScreen;