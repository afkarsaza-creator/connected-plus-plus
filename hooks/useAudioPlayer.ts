import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPlayer = () => {
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Memoized function to clean up the current audio element.
    const stopCurrentAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current.ontimeupdate = null;
        }
    }, []);

    const togglePlayback = useCallback((messageId: string, url: string) => {
        // Case 1: The clicked message is already the one playing. Pause it.
        if (playingMessageId === messageId) {
            stopCurrentAudio();
            setPlayingMessageId(null);
            setPlaybackProgress(0);
            return;
        }

        // Case 2: A different (or no) message is playing. Start the new one.
        stopCurrentAudio(); // Stop anything currently playing.
        
        setPlaybackProgress(0); // Reset progress for the new audio.
        const newAudio = new Audio(url);
        audioRef.current = newAudio;

        newAudio.ontimeupdate = () => {
            if (newAudio.duration > 0) {
                setPlaybackProgress((newAudio.currentTime / newAudio.duration) * 100);
            }
        };

        newAudio.onended = () => {
            // When audio finishes, reset the state.
            setPlayingMessageId(null);
            setPlaybackProgress(0);
        };
        
        const playPromise = newAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setPlayingMessageId(messageId);
            }).catch(error => {
                // The 'AbortError' is expected if a new play() request interrupts this one.
                // We can safely ignore it, as the new request will manage the state.
                if (error.name !== 'AbortError') {
                    console.error("Error starting audio playback:", error);
                    // If a real error occurred (not an interruption), reset the state.
                    setPlayingMessageId(null);
                    setPlaybackProgress(0);
                }
            });
        } else {
            // Fallback for older browsers that don't return a promise from play().
            setPlayingMessageId(messageId);
        }
    }, [playingMessageId, stopCurrentAudio]);

    // Effect for cleaning up when the component unmounts.
    useEffect(() => {
        // Return the cleanup function.
        return () => {
            stopCurrentAudio();
        };
    }, [stopCurrentAudio]);

    return { playingMessageId, playbackProgress, togglePlayback };
};
