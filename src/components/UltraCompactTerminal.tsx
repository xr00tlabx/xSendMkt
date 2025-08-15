import { Terminal } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import type { EmailSendLog } from '../types';

interface UltraCompactTerminalProps {
    logs: EmailSendLog[];
    isActive: boolean;
    currentEmail?: string;
}

const UltraCompactTerminal: React.FC<UltraCompactTerminalProps> = ({ 
    logs, 
    isActive, 
    currentEmail 
}) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const formatTimestamp = (timestamp: Date): string => {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        }).format(timestamp);
    };

    const getLogColor = (type: string): string => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            default: return 'text-gray-300';
        }
    };

    const getLogIcon = (type: string): string => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return '→';
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0d1117] overflow-hidden">
            {/* Ultra-Compact Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-[#161b22] border-b border-[#21262d] flex-shrink-0">
                <div className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-semibold text-green-400 font-mono">TERMINAL</span>
                    {isActive && (
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs text-green-300">LIVE</span>
                        </div>
                    )}
                </div>
                
                <div className="text-xs text-gray-500 font-mono">
                    {logs.length} logs
                </div>
            </div>

            {/* Current Status */}
            {isActive && currentEmail && (
                <div className="px-2 py-1 bg-[#1c2128] border-b border-[#21262d] flex items-center gap-2 flex-shrink-0">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-400 font-mono">Processing:</span>
                    <span className="text-xs text-gray-300 font-mono truncate flex-1">{currentEmail}</span>
                </div>
            )}

            {/* Terminal Content */}
            <div 
                ref={terminalRef}
                className="flex-1 overflow-y-auto p-1 space-y-0.5 terminal-scroll"
                style={{ fontSize: '10px', lineHeight: '1.2' }}
            >
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <div className="text-xs">Aguardando logs...</div>
                        </div>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-1 hover:bg-[#21262d] px-1 py-0.5 rounded transition-colors ${getLogColor(log.type)}`}
                        >
                            <span className="text-gray-500 font-mono text-xs flex-shrink-0">
                                {formatTimestamp(log.timestamp)}
                            </span>
                            <span className={`${getLogColor(log.type)} flex-shrink-0 font-mono`}>
                                {getLogIcon(log.type)}
                            </span>
                            <span className="font-mono flex-1 min-w-0 break-all">
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Performance indicator */}
            {isActive && (
                <div className="px-2 py-1 bg-[#161b22] border-t border-[#21262d] flex items-center justify-between text-xs text-gray-500 font-mono flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span>System Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Logs: {logs.length}</span>
                        <span>|</span>
                        <span className="text-green-400">Ready</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UltraCompactTerminal;
