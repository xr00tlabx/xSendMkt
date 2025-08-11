import React from 'react';

interface ModalLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const ModalLayout: React.FC<ModalLayoutProps> = ({ children, title }) => {
    console.log('ModalLayout rendering with title:', title);
    
    return (
        <div className="min-h-screen bg-gray-50">
            {title && (
                <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default ModalLayout;
