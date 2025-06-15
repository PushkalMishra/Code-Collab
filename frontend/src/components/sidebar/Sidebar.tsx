import React from 'react';
import { SidebarViewProps } from '../../types/sidebar.types';
import { CodeView, ChatView, CopilotView, UsersView } from './views';
import './Sidebar.css';

const Sidebar: React.FC<SidebarViewProps> = (props) => {
    return (
        <div className="sidebar" role="navigation" aria-label="Main Navigation">
        <CodeView {...props} />
        <ChatView {...props} />
        <CopilotView {...props} />
            <UsersView {...props} />
    </div>
); 
};

export default Sidebar; 