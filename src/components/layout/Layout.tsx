import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
    return (
        <div className="h-screen vscode-theme flex flex-col overflow-hidden min-w-0">
            <Header />
            <main className="flex-1 flex overflow-hidden min-h-0 min-w-0">
                <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
