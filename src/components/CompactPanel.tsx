import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

interface CompactPanelProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}

export const CompactPanel: React.FC<CompactPanelProps> = ({
    title,
    icon,
    children,
    defaultExpanded = true,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={`bg-[#2d2d30] border border-[#3e3e42] rounded ${className}`}>
            <div
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-[#3e3e42] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {icon}
                    <h3 className="font-semibold text-xs truncate">{title}</h3>
                </div>
                <div className="flex items-center gap-1">
                    {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                    )}
                </div>
            </div>
            {isExpanded && (
                <div className="p-2 pt-0">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CompactPanel;
