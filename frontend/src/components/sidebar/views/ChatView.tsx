import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { ChatViewProps } from './types';

export const ChatView: React.FC<ChatViewProps> = ({ activePanel, setActivePanel, setIsFilePanelOpen }) => (
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