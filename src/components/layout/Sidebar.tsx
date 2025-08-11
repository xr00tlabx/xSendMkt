import { AlertCircle, CheckCircle, Play, Server } from 'lucide-react';
import React from 'react';
import type { EmailList, SmtpConfig } from '../../types';

interface SidebarProps {
    lists: EmailList[];
    smtpConfigs?: SmtpConfig[];
    onSmtpToggle?: (id: string, active: boolean) => void;
    onTestSmtp?: (config: SmtpConfig) => void;
    onTestAllSmtps?: () => void;
    loading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    lists,
    smtpConfigs = [],
    onSmtpToggle,
    onTestSmtp,
    onTestAllSmtps,
    loading = false
}) => {
    const totalAllEmails = lists.reduce((total, list) => total + list.emails.length, 0);

    const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive);

    return (
        <div className="w-full h-full vscode-sidebar border-r flex flex-col overflow-hidden" style={{ borderRightColor: 'var(--vscode-border)' }}>
            {/* Email Lists Section */}
            <div className="basis-1/2 min-h-0 flex flex-col border-b" style={{ borderBottomColor: 'var(--vscode-border)' }}>
                <div className="p-4 flex items-center justify-between" style={{ background: 'rgba(0,122,204,0.06)', borderLeft: '3px solid var(--vscode-accent)' }}>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--vscode-text)' }}>
                        📧 Email Lists
                    </h2>
                    <div className="text-xs text-right" style={{ color: 'var(--vscode-text-muted)' }}>
                        <div>{lists.length} lista{lists.length !== 1 ? 's' : ''}</div>
                        <div className="font-medium">{totalAllEmails.toLocaleString()} emails</div>
                    </div>
                </div>

                {/* Lists */}
                <div className="flex-1 overflow-y-auto p-2 vscode-scrollbar">
                    {loading ? (
                        <div className="p-3">
                            <div className="animate-pulse space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 rounded" style={{ background: 'var(--vscode-surface)' }}></div>
                                ))}
                            </div>
                        </div>
                    ) : lists.length === 0 ? (
                        <div className="p-4 text-center">
                            <p className="text-sm" style={{ color: 'var(--vscode-text-muted)' }}>No email lists found.</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--vscode-text-muted)' }}>Create your first list to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                                    {lists.map(list => {
                                return (
                                    <div
                                        key={list.id}
                                        className="p-3 rounded border transition-all duration-200 vscode-item-hover"
                                        style={{
                                            borderColor: 'var(--vscode-border)',
                                            background: 'transparent'
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium truncate" style={{ color: 'var(--vscode-text)' }}>
                                                    {list.name}
                                                </h3>
                                                <div className="flex items-center text-xs mt-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                                    <span>{list.emails.length.toLocaleString()} emails</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SMTP Servers Section */}
            <div className="basis-1/2 min-h-0 flex flex-col">
                <div className="p-4 border-b flex items-center justify-between" style={{ borderBottomColor: 'var(--vscode-border)', background: 'rgba(0,122,204,0.06)', borderLeft: '3px solid var(--vscode-accent)' }}>
                    <div className="flex items-center">
                        <Server className="h-4 w-4 mr-2" style={{ color: 'var(--vscode-accent)' }} />
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--vscode-text)' }}>
                            🔧 SMTP Servers
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                            {activeSmtps.length} of {smtpConfigs.length} active
                        </p>
                        {onTestAllSmtps && (
                            <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: 'var(--vscode-border)' }} onClick={() => onTestAllSmtps()} title="Testar todos">
                                <Play className="h-3 w-3 inline mr-1" /> Testar
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-2 flex-1 overflow-y-auto vscode-scrollbar">
                    {smtpConfigs.length === 0 ? (
                        <div className="text-center py-4">
                            <Server className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--vscode-text-muted)' }} />
                            <p className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>No SMTP servers</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {smtpConfigs.map(smtp => (
                                <div
                                    key={smtp.id}
                                    className="p-3 rounded border text-sm cursor-pointer transition-all duration-200"
                                    style={{
                                        borderColor: smtp.isActive ? 'var(--vscode-success)' : 'var(--vscode-border)',
                                        background: smtp.isActive ? 'var(--vscode-success)15' : 'var(--vscode-surface)'
                                    }}
                                    onClick={() => onSmtpToggle?.(smtp.id, !smtp.isActive)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center min-w-0 flex-1">
                                            {smtp.isActive ? (
                                                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: 'var(--vscode-success)' }} />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: 'var(--vscode-text-muted)' }} />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium truncate" style={{ color: 'var(--vscode-text)' }}>
                                                    {smtp.name}
                                                </div>
                                                <div className="text-xs truncate mt-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                                    {smtp.host}:{smtp.port}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-2 flex items-center space-x-2">
                                            {onTestSmtp && (
                                                <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: 'var(--vscode-border)' }} onClick={(e) => { e.stopPropagation(); onTestSmtp(smtp); }} title="Testar">
                                                    <Play className="h-3 w-3 inline" />
                                                </button>
                                            )}
                                            <input
                                                type="checkbox"
                                                checked={smtp.isActive}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onSmtpToggle?.(smtp.id, e.target.checked);
                                                }}
                                                className="h-3 w-3 rounded border focus:ring-2"
                                                style={{
                                                    color: 'var(--vscode-accent)',
                                                    borderColor: 'var(--vscode-border)',
                                                    background: 'var(--vscode-surface)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
