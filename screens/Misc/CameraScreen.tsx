import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ArrowLeftIcon } from '../../components/icons';
import { useNavigation } from '../../context/NavigationContext';

const CameraScreen: React.FC = () => {
  const { handleBack, screenOptions } = useNavigation();
  const onPhotoTaken = screenOptions?.onPhotoTaken;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        activeStream = mediaStream;
        setStream(mediaStream);
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError("Akses kamera ditolak. Mohon aktifkan di pengaturan browser Anda.");
        setHasPermission(false);
      }
    };

    getCameraStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node; // Keep ref updated for capturePhoto
    if (node && stream) {
      node.srcObject = stream;
      node.play().catch(e => console.error("Error playing video automatically:", e));
    }
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));

        if (blob && onPhotoTaken) {
            // Await the callback in case it performs async operations like uploading.
            await onPhotoTaken(blob);
        }
      }
    }
    handleBack(); // Navigate back after photo is taken and processed.
  }, [onPhotoTaken, handleBack]);
  
  const colors = {
    screenBg: 'bg-black',
    headerText: 'text-white',
    secondaryText: 'text-gray-300',
  };

  return (
    <div className={`h-full flex flex-col ${colors.screenBg} relative`}>
      <header className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10 bg-black/30">
        <button onClick={handleBack} className={`p-2 ${colors.headerText}`}>
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex-1 flex items-center justify-center">
        {hasPermission === true && <video ref={videoCallbackRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>}
        {hasPermission === false && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <p className={colors.secondaryText}>{error}</p>
            </div>
        )}
        {hasPermission === null && (
            <div className="flex-1 flex items-center justify-center">
                <p className={colors.secondaryText}>Meminta izin kamera...</p>
            </div>
        )}
      </div>

      <footer className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center z-10 bg-black/30">
        <button 
          onClick={capturePhoto} 
          disabled={hasPermission !== true}
          className="w-20 h-20 rounded-full border-4 border-white bg-white/30 flex items-center justify-center disabled:opacity-50 transition-opacity"
          aria-label="Ambil gambar"
        >
        </button>
      </footer>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraScreen;