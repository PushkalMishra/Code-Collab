import React from 'react';
import { SidebarViewProps } from '../../types/sidebar.types';
import { CodeView, ChatView, CopilotView } from './views';
import './Sidebar.css';

export const Sidebar: React.FC<SidebarViewProps> = (props) => (
    <div className="sidebar">
        <CodeView {...props} />
        <ChatView {...props} />
        <CopilotView {...props} />
    </div>
); 