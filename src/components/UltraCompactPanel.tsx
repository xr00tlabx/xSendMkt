import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import React, { useState } from 'react';

interface UltraCompactPanelProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}

const UltraCompactPanel: React.FC<UltraCompactPanelProps> = ({
    title,
    icon,
    children,
    defaultExpanded = false,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={`bg-[#2d2d30] border border-[#3e3e42] rounded-sm overflow-hidden ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-2 py-1 bg-[#37373d] hover:bg-[#3e3e42] transition-colors flex items-center justify-between text-xs font-medium text-gray-200"
            >
                <div className="flex items-center gap-1.5">
                    {icon}
                    <span className="truncate">{title}</span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
            </button>
            
            {isExpanded && (
                <div className="p-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export default UltraCompactPanel;
