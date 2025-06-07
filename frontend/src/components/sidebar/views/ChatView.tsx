import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { SidebarViewProps } from '../../../types/sidebar.types';

export const ChatView: React.FC<SidebarViewProps> = ({ activePanel, setActivePanel, setIsFilePanelOpen }) => (
    <SidebarIcon
        icon={<span>💬</span>}
        label="Chat"
        active={activePanel === 'chat'}
        onClick={() => {
            setActivePanel('chat');
            setIsFilePanelOpen(false);
        }}
    />
); 