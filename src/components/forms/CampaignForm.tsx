import Editor from '@monaco-editor/react';
import { Loader2, Pause, Save, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { EmailCampaign } from '../../types';

interface CampaignFormProps {
    campaign?: Partial<EmailCampaign>;
    onSave: (data: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onSend?: (id: string) => void;
    onPause?: (id: string) => void;
    loading?: boolean;
    totalEmails?: number;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
    campaign,
    onSave,
    onSend,
    onPause,
    loading = false,
    totalEmails = 0
}) => {
    const [formData, setFormData] = useState({
        subject: campaign?.subject || '',
        sender: campaign?.sender || '',
        htmlContent: campaign?.htmlContent || `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Campaign</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <header style="background: linear-gradient(135deg, #007acc, #1177bb); color: white; padding: 2rem; text-align: center;">
            <h1 style="margin: 0; font-size: 2rem;">Hello!</h1>
            <p style="margin: 0.5rem 0 0; opacity: 0.9;">Welcome to our amazing email campaign</p>
        </header>
        
        <main style="padding: 2rem;">
            <h2 style="color: #007acc; margin-top: 0;">Your Content Here</h2>
            <p>This is your email content. You can customize this HTML to create beautiful, responsive emails.</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #007acc; padding: 1rem; margin: 1.5rem 0;">
                <p style="margin: 0;"><strong>Pro tip:</strong> Use inline CSS for better email client compatibility.</p>
            </div>
            
            <a href="#" style="display: inline-block; background: #007acc; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 4px; margin: 1rem 0;">
                Call to Action
            </a>
        </main>
        
        <footer style="background: #f8f9fa; padding: 1rem; text-align: center; color: #666; font-size: 0.875rem;">
            <p style="margin: 0;">© 2025 Your Company. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`,
    });

    // Logs state for bottom panel
    const [logs, setLogs] = useState<string[]>([]);
    // Local action loading states
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [pausing, setPausing] = useState(false);

    // Resizable split (editor/preview)
    const [editorWidthPct, setEditorWidthPct] = useState(50);
    const [dragSplit, setDragSplit] = useState(false);
    const splitAreaRef = useRef<HTMLDivElement>(null);

    // Resizable logs height
    const [logsHeight, setLogsHeight] = useState(192); // px
    const [dragLogs, setDragLogs] = useState(false);
    const contentAreaRef = useRef<HTMLDivElement>(null);

    const appendLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'> = {
                ...formData,
                selectedLists: [], // Não precisamos mais de listas selecionadas
                status: 'draft',
                totalEmails,
                sentEmails: 0,
                failedEmails: 0,
            };
            await Promise.resolve((onSave as any)(campaignData));
            appendLog('Draft saved.');
        } finally {
            setSaving(false);
        }
    };

    const handleClickSend = async () => {
        if (!campaign?.id) return;
        setSending(true);
        try {
            await Promise.resolve((onSend as any)?.(campaign.id));
            appendLog('Send triggered.');
        } finally {
            setSending(false);
        }
    };

    const handleClickPause = async () => {
        if (!campaign?.id) return;
        setPausing(true);
        try {
            await Promise.resolve((onPause as any)?.(campaign.id));
            appendLog('Pause triggered.');
        } finally {
            setPausing(false);
        }
    };

    // Global mouse handlers for resizers
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (dragSplit && splitAreaRef.current) {
                const rect = splitAreaRef.current.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setEditorWidthPct(Math.min(80, Math.max(20, pct)));
            }
            if (dragLogs && contentAreaRef.current) {
                const rect = contentAreaRef.current.getBoundingClientRect();
                const height = rect.bottom - e.clientY; // pixels for logs
                const max = rect.height * 0.7;
                const min = 96; // px
                setLogsHeight(Math.min(max, Math.max(min, height)));
            }
        };
        const onMouseUp = () => {
            setDragSplit(false);
            setDragLogs(false);
        };
        if (dragSplit || dragLogs) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragSplit, dragLogs]);

    const canSend = campaign?.id &&
        formData.subject.trim() &&
        formData.sender.trim() &&
        formData.htmlContent.trim() &&
        campaign.status !== 'sending';

    const canPause = campaign?.id && campaign.status === 'sending';

    return (
        <div className="w-full h-full flex flex-col min-h-0 min-w-0 overflow-hidden">
            {/* Controls Bar: Subject / From Email + Action Buttons */}
            <div className="vscode-surface border-b px-6 py-3 flex-shrink-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4 min-w-0">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                        <div>
                            <label htmlFor="subject" className="block text-xs font-medium mb-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                Subject Line *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                className="input-field text-sm"
                                placeholder="Enter email subject..."
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="sender" className="block text-xs font-medium mb-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                From Email *
                            </label>
                            <input
                                type="email"
                                id="sender"
                                value={formData.sender}
                                onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                                className="input-field text-sm"
                                placeholder="sender@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap md:flex-nowrap whitespace-nowrap">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || saving}
                            className="btn-secondary text-sm"
                            title="Save campaign as draft"
                        >
                            <span className="mr-2 inline-flex items-center justify-center h-6 w-6 rounded-full" style={{ background: 'var(--vscode-border)', color: 'var(--vscode-text)' }}>
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            </span>
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                        {canPause && (
                            <button
                                type="button"
                                onClick={handleClickPause}
                                disabled={loading || pausing}
                                className="btn-danger text-sm"
                                title="Pause sending"
                            >
                                <span className="mr-2 inline-flex items-center justify-center h-6 w-6 rounded-full" style={{ background: 'var(--vscode-warning)', color: 'white' }}>
                                    {pausing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
                                </span>
                                {pausing ? 'Pausing...' : 'Pause'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleClickSend}
                            disabled={loading || sending || !canSend}
                            className="btn-primary text-sm"
                            title={campaign?.status === 'paused' ? 'Resume sending' : 'Send campaign'}
                        >
                            <span className="mr-2 inline-flex items-center justify-center h-6 w-6 rounded-full" style={{ background: 'var(--vscode-accent)', color: 'white' }}>
                                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            </span>
                            {sending ? (campaign?.status === 'paused' ? 'Resuming...' : 'Sending...') : (campaign?.status === 'paused' ? 'Resume' : 'Send')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content + Logs */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0" ref={contentAreaRef}>
                {/* Main Row: Settings + Split View */}
                <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
                    {/* Split View - full width now */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0">
                        {/* Split View Content */}
                        <div className="flex-1 flex overflow-hidden min-w-0 min-h-0 w-full" ref={splitAreaRef}>
                            {/* HTML Editor - Left Pane (resizable) */}
                            <div className="border-r flex flex-col" style={{
                                borderRightColor: 'var(--vscode-border)',
                                width: `${editorWidthPct}%`,
                                minWidth: '240px',
                                maxWidth: '80%'
                            }}>
                                <div className="p-3 border-b text-sm font-medium flex-shrink-0" style={{
                                    borderBottomColor: 'var(--vscode-border)',
                                    color: 'var(--vscode-text)',
                                    background: 'var(--vscode-panel)',
                                    borderLeft: '3px solid var(--vscode-accent)'
                                }}>
                                    HTML Editor
                                </div>
                                <div className="flex-1 min-h-0 w-full">
                                    <Editor
                                        height="100%"
                                        width="100%"
                                        defaultLanguage="html"
                                        value={formData.htmlContent}
                                        onChange={(value) => setFormData(prev => ({ ...prev, htmlContent: value || '' }))}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineHeight: 22,
                                            wordWrap: 'on',
                                            automaticLayout: true,
                                            scrollBeyondLastLine: false,
                                            folding: true,
                                            lineNumbers: 'on',
                                            renderWhitespace: 'selection',
                                            tabSize: 2,
                                            insertSpaces: true
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Vertical Resizer */}
                            <div
                                className="flex-shrink-0"
                                style={{ width: '6px', cursor: 'col-resize', background: 'var(--vscode-border)' }}
                                onMouseDown={() => setDragSplit(true)}
                                title="Resize editor/preview"
                            />

                            {/* Email Preview - Right Pane */}
                            <div className="vscode-surface overflow-hidden flex flex-col flex-1" style={{
                                boxShadow: 'none',
                                width: `${100 - editorWidthPct}%`,
                                minWidth: '240px'
                            }}>
                                <div className="p-3 border-b text-sm font-medium flex-shrink-0" style={{
                                    borderBottomColor: 'var(--vscode-border)',
                                    color: 'var(--vscode-text)',
                                    background: 'var(--vscode-panel)',
                                    borderLeft: '3px solid var(--vscode-accent)'
                                }}>
                                    Email Preview
                                </div>
                                <div className="flex-1 overflow-auto overflow-x-auto p-0 vscode-scrollbar w-full">
                                    <div
                                        className="bg-white w-full h-full"
                                        dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horizontal Resizer for Logs */}
                <div
                    className="flex-shrink-0"
                    style={{ height: '6px', cursor: 'row-resize', background: 'var(--vscode-border)' }}
                    onMouseDown={() => setDragLogs(true)}
                    title="Resize logs panel"
                />

                {/* Bottom Logs Panel */}
                <div className="vscode-panel border-t flex flex-col" style={{ height: `${logsHeight}px` }}>
                    <div className="px-3 py-2 border-b flex items-center justify-between text-sm font-medium"
                        style={{ borderBottomColor: 'var(--vscode-border)', borderLeft: '3px solid var(--vscode-accent)', background: 'rgba(0,122,204,0.08)' }}>
                        <span style={{ color: 'var(--vscode-text)' }}>Logs</span>
                        <div className="space-x-2">
                            <button
                                className="btn-ghost text-xs"
                                onClick={() => setLogs([])}
                                title="Clear logs"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto vscode-scrollbar p-3 text-xs font-mono" style={{ color: 'var(--vscode-text)' }}>
                        {logs.length === 0 ? (
                            <div style={{ color: 'var(--vscode-text-muted)' }}>No logs yet…</div>
                        ) : (
                            <pre className="whitespace-pre-wrap">{logs.join('\n')}</pre>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="vscode-panel border-t h-8 px-3 text-xs flex items-center justify-between" style={{ borderTopColor: 'var(--vscode-border)' }}>
                <div className="flex items-center space-x-3">
                    <span style={{ color: 'var(--vscode-text-muted)' }}>Status:</span>
                    <span className="capitalize" style={{ color: 'var(--vscode-text)' }}>{campaign?.status || 'draft'}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span style={{ color: 'var(--vscode-text-muted)' }}>Recipients: <span style={{ color: 'var(--vscode-text)' }}>{totalEmails}</span></span>
                    <div className="flex items-center space-x-2">
                        <span style={{ color: 'var(--vscode-text-muted)' }}>Progress:</span>
                        <div className="w-24 bg-gray-700 rounded-full h-1.5">
                            <div
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: campaign?.totalEmails ? `${((campaign.sentEmails || 0) / campaign.totalEmails) * 100}%` : '0%',
                                    background: 'var(--vscode-accent)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignForm;
