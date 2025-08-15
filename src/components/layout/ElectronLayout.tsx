import React from 'react';
import { Outlet } from 'react-router-dom';

const ElectronLayout: React.FC = () => {
    return (
        <div className="h-screen w-screen overflow-hidden bg-[#1e1e1e]">
            <Outlet />
        </div>
    );
};

export default ElectronLayout;
