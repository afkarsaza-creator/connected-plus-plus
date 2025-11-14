import { useState, useCallback } from 'react';

// Diperbarui untuk secara opsional menangani payload, membuatnya cukup fleksibel
// untuk menggantikan kebutuhan akan `useConfirmationDialog`.
export const useModalState = <T = undefined>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<T | undefined>(undefined);

  const open = useCallback((payload?: T) => {
    setIsOpen(true);
    if (payload !== undefined) {
      setPayload(payload);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Reset payload saat ditutup untuk menghindari state yang basi
    setPayload(undefined);
  }, []);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return { isOpen, open, close, toggle, payload };
};