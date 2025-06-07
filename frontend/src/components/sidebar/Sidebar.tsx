import React from 'react';
import { SidebarViewProps } from '../../types/sidebar.types';
import { CodeView, ChatView, CopilotView } from './views';
import './Sidebar.css';

const Sidebar: React.FC<SidebarViewProps> = (props) => {
    return (
        <div className="sidebar" role="navigation" aria-label="Main Navigation">
            <CodeView {...props} />
            <ChatView {...props} />
            <CopilotView {...props} />
        </div>
    );
};

export default Sidebar; 