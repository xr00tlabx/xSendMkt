import { AlertCircle, CheckCircle, Clock, Info, Terminal, Zap } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface TerminalLogEntry {
    id: string;
    timestamp: Date;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
    email?: string;
}

interface HackerTerminalProps {
    logs: TerminalLogEntry[];
    isActive: boolean;
    currentEmail?: string;
}

export const HackerTerminal: React.FC<HackerTerminalProps> = ({ logs, isActive, currentEmail }) => {
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll para o final quando novos logs são adicionados
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-3 h-3 text-green-400" />;
            case 'error':
                return <AlertCircle className="w-3 h-3 text-red-400" />;
            case 'warning':
                return <Clock className="w-3 h-3 text-yellow-400" />;
            default:
                return <Info className="w-3 h-3 text-blue-400" />;
        }
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
            case 'warning':
                return 'text-yellow-400';
            default:
                return 'text-blue-400';
        }
    };

    const formatTimestamp = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    };

    return (
        <div className="h-80 bg-black/90 border border-green-500/30 rounded-lg overflow-hidden flex flex-col">
            {/* Terminal Header */}
            <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 px-4 py-2 border-b border-green-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-mono text-sm font-bold">xSendMkt Terminal</span>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isActive && (
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                            <span className="text-green-400 text-xs font-mono">ACTIVE</span>
                        </div>
                    )}
                    <div className="text-xs text-green-500 font-mono">
                        {formatTimestamp(new Date())}
                    </div>
                </div>
            </div>

            {/* Terminal Content */}
            <div
                ref={terminalRef}
                className="flex-1 p-3 overflow-y-auto bg-black/95 font-mono text-xs leading-relaxed terminal-scroll"
            >
                {/* Current Email Display */}
                {currentEmail && (
                    <div className="mb-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded flex items-center gap-2">
                        <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
                        <span className="text-blue-300">PROCESSING:</span>
                        <span className="text-green-400">{currentEmail}</span>
                    </div>
                )}

                {/* Boot Message */}
                {logs.length === 0 && (
                    <div className="space-y-1 text-green-400">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">[{formatTimestamp(new Date())}]</span>
                            <span>xSendMkt Terminal v2.0.0 initialized</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">[{formatTimestamp(new Date())}]</span>
                            <span>Ready for email sending operations...</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">[{formatTimestamp(new Date())}]</span>
                            <span className="text-yellow-400">Awaiting campaign start...</span>
                        </div>
                        <div className="mt-4 text-gray-600">
                            <span className="animate-pulse">▊</span>
                        </div>
                    </div>
                )}

                {/* Log Entries */}
                <div className="space-y-1">
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 group hover:bg-gray-900/30 px-1 py-0.5 rounded">
                            {/* Timestamp */}
                            <span className="text-gray-500 flex-shrink-0 w-24 text-xs">
                                [{formatTimestamp(log.timestamp)}]
                            </span>

                            {/* Log Level */}
                            <div className="flex items-center gap-1 flex-shrink-0 w-20">
                                {getLogIcon(log.type)}
                                <span className={`text-xs font-bold ${getLogColor(log.type)}`}>
                                    {log.type.toUpperCase()}
                                </span>
                            </div>

                            {/* Message */}
                            <div className="flex-1 min-w-0">
                                <span className={`${getLogColor(log.type)}`}>
                                    {log.message}
                                </span>
                                {log.email && (
                                    <div className="text-gray-400 text-xs mt-0.5">
                                        <span className="text-gray-600">└─</span>
                                        <span className="text-cyan-400 ml-1">{log.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Progress indicator */}
                            <div className="flex-shrink-0">
                                {log.type === 'success' && (
                                    <span className="text-green-400 text-xs">✓</span>
                                )}
                                {log.type === 'error' && (
                                    <span className="text-red-400 text-xs">✗</span>
                                )}
                                {log.type === 'warning' && (
                                    <span className="text-yellow-400 text-xs">!</span>
                                )}
                                {log.type === 'info' && (
                                    <span className="text-blue-400 text-xs">→</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Cursor */}
                {isActive && (
                    <div className="flex items-center gap-2 mt-2 text-green-400">
                        <span className="text-gray-500">[{formatTimestamp(new Date())}]</span>
                        <span className="animate-pulse">▊ Processing...</span>
                    </div>
                )}
            </div>

            {/* Terminal Footer */}
            <div className="bg-gray-900/50 px-4 py-1 border-t border-green-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-gray-400">
                    <span>Logs: {logs.length}</span>
                    <span>Status: {isActive ? 'ACTIVE' : 'IDLE'}</span>
                </div>
                <div className="text-green-500 font-mono">
                    {isActive ? '● LIVE' : '○ STANDBY'}
                </div>
            </div>
        </div>
    );
};

export default HackerTerminal;
