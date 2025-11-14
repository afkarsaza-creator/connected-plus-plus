import { useState } from 'react';
import type { Message } from '../../../types';
import { useModalState } from '../../../hooks/useModalState.ts';

export const useChatInteractions = () => {
    // Kelola semua state modal/dialog dengan hook kustom
    const mainMenu = useModalState();
    const callMenu = useModalState();
    const attachmentMenu = useModalState();
    const leaveConfirmDialog = useModalState();
    const clearConfirmDialog = useModalState();
    const deleteConfirmDialog = useModalState<Message>(); // Sekarang payload adalah pesan yang akan dihapus
    
    // In-message interactions
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, message: Message, element: HTMLElement | null } | null>(null);
    const [reactionPicker, setReactionPicker] = useState<{ messageId: string, element: HTMLElement } | null>(null);

    // FIX: Replaced `React.MouseEvent | React.Touch` with a structural type `{ pageX: number, pageY: number }`.
    // This resolves the "Cannot find namespace 'React'" error as the React namespace is no longer needed for the type.
    // It also corrects the invalid `React.Touch` type and remains compatible with both MouseEvent and Touch objects.
    const showMenu = (e: { pageX: number, pageY: number }, message: Message, element: HTMLElement | null) => {
        setContextMenu({ x: e.pageX, y: e.pageY, message, element });
    };
    const closeMenu = () => setContextMenu(null);

    const requestDelete = () => {
        if (contextMenu) {
            deleteConfirmDialog.open(contextMenu.message);
            closeMenu();
        }
    };
    
    const showReactionPicker = (messageId: string, element: HTMLElement) => {
        setReactionPicker({ messageId, element });
    };
    const closeReactionPicker = () => setReactionPicker(null);

    return {
        mainMenu,
        callMenu,
        attachmentMenu,
        leaveConfirmDialog,
        clearConfirmDialog,
        deleteConfirmDialog,
        contextMenu: { menu: contextMenu, showMenu, closeMenu },
        reactionPicker: { picker: reactionPicker, showReactionPicker, closeReactionPicker },
        // Untuk kompatibilitas mundur sementara
        requestDelete,
    };
};