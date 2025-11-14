import { useState, useRef } from 'react';

interface UseAudioRecorderProps {
  onStop: (blob: Blob, duration: number) => void;
}

export const useAudioRecorder = ({ onStop }: UseAudioRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<number | null>(null);

    const formatRecordingDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const startRecording = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
    
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
    
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                onStop(audioBlob, recordingDuration);
                stream.getTracks().forEach(track => track.stop());
            };
    
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingDuration(0);
            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            return { success: true };
    
        } catch (err) {
            console.error("Error accessing microphone:", err);
            return { success: false, error: "permission_denied" };
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        setIsRecording(false);
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            // Detach the onstop handler to prevent onStop from being called
            mediaRecorderRef.current.onstop = null; 
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        setIsRecording(false);
        setRecordingDuration(0);
    };

    return {
        isRecording,
        formattedDuration: formatRecordingDuration(recordingDuration),
        startRecording,
        stopRecording,
        cancelRecording,
    };
};