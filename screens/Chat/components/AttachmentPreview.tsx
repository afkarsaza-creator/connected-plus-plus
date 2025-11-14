import React, { useState, useEffect } from 'react';
import { SendIcon, SpinnerIcon } from '../../../components/icons';
import { useSettings } from '../../../context/SettingsContext';
import { useStorage } from '../../../context/StorageContext';

interface AttachmentPreviewProps {
  file: File;
  caption: string;
  onCaptionChange: (caption: string) => void;
  onCancel: () => void;
  onSend: (file: File, caption: string) => void;
  isSending?: boolean;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ 
    file, caption, onCaptionChange, onCancel, onSend, isSending = false
}) => {
    const { theme } = useSettings();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file && file.size > 0) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [file]);

    if (!previewUrl) return null; // Don't render if there's no file to preview

    return (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col p-4">
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex items-center bg-[#18222d] p-2 rounded-lg mt-4">
                <input 
                    type="text" 
                    placeholder="Tambahkan keterangan..." 
                    value={caption} 
                    onChange={(e) => onCaptionChange(e.target.value)}
                    disabled={isSending}
                    className="flex-1 bg-transparent py-2 px-2 text-base text-white placeholder-gray-400 outline-none disabled:opacity-50" 
                />
                <button 
                    onClick={() => onSend(file, caption)} 
                    disabled={isSending}
                    className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center ml-2 disabled:opacity-75"
                >
                    {isSending ? <SpinnerIcon className="w-6 h-6 text-white" /> : <SendIcon className="w-6 h-6 text-white" />}
                </button>
            </div>
            <button onClick={onCancel} disabled={isSending} className="text-white text-center mt-4 font-semibold disabled:opacity-50">Batal</button>
        </div>
    );
};

export default AttachmentPreview;