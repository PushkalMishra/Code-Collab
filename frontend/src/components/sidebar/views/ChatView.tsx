import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { ChatViewProps } from './types';

export const ChatView: React.FC<ChatViewProps> = ({ activePanel, switchPanel, isPanelOpen }) => (
    <SidebarIcon
        icon={<span>💬</span>}
        label="Chat"
        active={activePanel === 'chat' && isPanelOpen}
        onClick={() => {
            switchPanel('chat');
        }}
    />
); 