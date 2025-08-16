import {
    AlertCircle,
    CheckCircle,
    Clock,
    Code,
    FolderOpen,
    GripHorizontal,
    List,
    Mail,
    Pause,
    Play,
    Send,
    Server,
    Square,
    Users,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CompactPanel from '../components/UltraCompactPanel';
import UltraCompactTerminal from '../components/UltraCompactTerminal';
import { useEmailLists, useSmtpConfigs } from '../hooks';
import { useSequentialEmailSender } from '../hooks/useSequentialEmailSender';
import type { EmailCampaign } from '../types';

const UltraCompactHomePageVSCode: React.FC = () => {
    const { lists } = useEmailLists();
    const { configs } = useSmtpConfigs();
    const { state, startSending, pauseSending, resumeSending, stopSending, canSend } = useSequentialEmailSender();

    // Estado do formulário
    const [formData, setFormData] = useState({
        subject: '',
        sender: '',
        htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Campaign</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #007acc, #005a9e); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 15px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; line-height: 1.7; color: #333; }
        .content h2 { color: #2c3e50; margin: 0 0 20px 0; font-size: 24px; }
        .content p { margin: 0 0 15px 0; font-size: 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #007acc, #0099ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3); transition: all 0.3s ease; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 122, 204, 0.4); }
        .footer { background: #2c3e50; color: #95a5a6; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sua Campanha de Email</h1>
            <p>Comunicação profissional que gera resultados</p>
        </div>
        <div class="content">
            <h2>Olá!</h2>
            <p>Esta é sua mensagem personalizada aqui...</p>
            <p>Adicione seu conteúdo e personalize conforme necessário para criar uma comunicação impactante.</p>
            <a href="#" class="button">Call to Action</a>
        </div>
        <div class="footer">
            <p>Enviado via <a href="#">xSendMkt</a> | Email Marketing Profissional</p>
        </div>
    </div>
</body>
</html>`
    });

    // Estado do splitter e dimensões
    const [terminalHeight, setTerminalHeight] = useState(280);
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isDraggingVertical, setIsDraggingVertical] = useState(false);
    const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
    const [isAutoProgressing, setIsAutoProgressing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Estatísticas
    const totalEmails = lists.reduce((total, list) => total + list.emails.length, 0);
    const activeSmtps = configs.filter(smtp => smtp.isActive);
    const standbySmtps = configs.filter(smtp => smtp.status === 'standby');
    const failedSmtps = configs.filter(smtp => smtp.status === 'failed');

    // Verificar se pode enviar
    const isReadyToSend = canSend({
        id: '1',
        subject: formData.subject,
        sender: formData.sender,
        htmlContent: formData.htmlContent,
        selectedLists: [],
        status: 'draft',
        totalEmails: 0,
        sentEmails: 0,
        failedEmails: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    }, configs, lists);

    // Auto-avançar é gerenciado pelo hook useSequentialEmailSender
    useEffect(() => {
        if (state.isActive && !state.isPaused) {
            setIsAutoProgressing(true);
        } else {
            setIsAutoProgressing(false);
        }
    }, [state.isActive, state.isPaused]);

    // Funções de controle
    const handleStartSending = async () => {
        try {
            const campaign: EmailCampaign = {
                id: Date.now().toString(),
                subject: formData.subject,
                sender: formData.sender,
                htmlContent: formData.htmlContent,
                selectedLists: lists.map(list => list.id),
                status: 'draft',
                totalEmails: totalEmails,
                sentEmails: 0,
                failedEmails: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await startSending(campaign, configs);
        } catch (error) {
            console.error('Erro ao iniciar envio:', error);
        }
    };

    const handlePauseResume = () => {
        if (state.isPaused) {
            resumeSending();
        } else {
            pauseSending();
        }
    };

    const handleStopSending = () => {
        stopSending();
        setIsAutoProgressing(false);
    };

    // Manipuladores do splitter vertical (terminal)
    const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDraggingVertical(true);
        e.preventDefault();
    }, []);

    const handleVerticalMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingVertical || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = containerRect.bottom - e.clientY;
        const minHeight = 200;
        const maxHeight = containerRect.height - 200;
        
        setTerminalHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    }, [isDraggingVertical]);

    const handleVerticalMouseUp = useCallback(() => {
        setIsDraggingVertical(false);
    }, []);

    // Manipuladores do splitter horizontal (sidebar)
    const handleHorizontalMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDraggingHorizontal(true);
        e.preventDefault();
    }, []);

    const handleHorizontalMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingHorizontal || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        const minWidth = 280;
        const maxWidth = 400;
        
        setSidebarWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    }, [isDraggingHorizontal]);

    const handleHorizontalMouseUp = useCallback(() => {
        setIsDraggingHorizontal(false);
    }, []);

    useEffect(() => {
        if (isDraggingVertical) {
            document.addEventListener('mousemove', handleVerticalMouseMove);
            document.addEventListener('mouseup', handleVerticalMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleVerticalMouseMove);
                document.removeEventListener('mouseup', handleVerticalMouseUp);
            };
        }
    }, [isDraggingVertical, handleVerticalMouseMove, handleVerticalMouseUp]);

    useEffect(() => {
        if (isDraggingHorizontal) {
            document.addEventListener('mousemove', handleHorizontalMouseMove);
            document.addEventListener('mouseup', handleHorizontalMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleHorizontalMouseMove);
                document.removeEventListener('mouseup', handleHorizontalMouseUp);
            };
        }
    }, [isDraggingHorizontal, handleHorizontalMouseMove, handleHorizontalMouseUp]);

    return (
        <div className="h-screen bg-[#1e1e1e] text-gray-100 flex flex-col overflow-hidden">
            {/* Ultra-Compact Header */}
            <div className="bg-[#007acc] px-3 py-1.5 flex items-center justify-between flex-shrink-0 border-b border-[#005a9e]">
                <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-white" />
                    <h1 className="text-sm font-semibold text-white">xSendMkt</h1>
                    <span className="text-blue-100 text-xs">Email Marketing</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-blue-100">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">{totalEmails}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        <span className="font-medium">{activeSmtps.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <List className="w-3 h-3" />
                        <span className="font-medium">{lists.length}</span>
                    </div>
                </div>
            </div>

            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0" style={{ width: `calc(100% - ${sidebarWidth}px)` }}>
                    {/* Content Panels */}
                    <div 
                        className="flex-1 bg-[#252526] overflow-y-auto"
                        style={{ height: `calc(100% - ${terminalHeight}px)` }}
                    >
                        <div className="p-3 space-y-3">
                            
                            {/* Campaign Form */}
                            <CompactPanel 
                                title="Configuração da Campanha" 
                                icon={<Mail className="w-3 h-3 text-blue-400" />}
                            >
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Assunto</label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                                className="w-full px-2 py-1 text-xs bg-[#3c3c3c] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500"
                                                placeholder="Assunto do email..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Remetente</label>
                                            <input
                                                type="email"
                                                value={formData.sender}
                                                onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                                                className="w-full px-2 py-1 text-xs bg-[#3c3c3c] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500"
                                                placeholder="seu@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Conteúdo HTML</label>
                                        <textarea
                                            value={formData.htmlContent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                                            className="w-full h-32 px-2 py-1 text-xs bg-[#1e1e1e] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500 font-mono resize-none"
                                            placeholder="Conteúdo HTML..."
                                        />
                                    </div>
                                </div>
                            </CompactPanel>

                            {/* Sending Controls */}
                            <CompactPanel 
                                title="Controles de Envio" 
                                icon={<Zap className="w-3 h-3 text-yellow-400" />}
                            >
                                {!state.isActive ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleStartSending}
                                            disabled={!isReadyToSend}
                                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded font-medium text-xs transition-all ${
                                                isReadyToSend
                                                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <Send className="w-3 h-3" />
                                            Iniciar Envio Sequencial
                                        </button>
                                        
                                        {!isReadyToSend && (
                                            <div className="text-xs text-gray-400 space-y-1">
                                                {!formData.subject.trim() && <div>• Preencha o assunto</div>}
                                                {!formData.sender.trim() && <div>• Preencha o remetente</div>}
                                                {!formData.htmlContent.trim() && <div>• Preencha o conteúdo</div>}
                                                {lists.length === 0 && <div>• Adicione listas de email</div>}
                                                {activeSmtps.length === 0 && <div>• Configure SMTPs ativos</div>}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Progress */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-gray-300 truncate">
                                                    {state.currentList?.name || 'N/A'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {(state.currentList?.progress || 0).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-[#3c3c3c] rounded-full h-1">
                                                <div
                                                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                                    style={{ width: `${state.currentList?.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-4 gap-1">
                                            <div className="bg-green-900/30 border border-green-700 p-1 rounded text-center">
                                                <div className="text-xs font-bold text-green-400">{state.globalStats.totalSent}</div>
                                                <div className="text-xs text-green-300">✓</div>
                                            </div>
                                            <div className="bg-red-900/30 border border-red-700 p-1 rounded text-center">
                                                <div className="text-xs font-bold text-red-400">{state.globalStats.totalFailed}</div>
                                                <div className="text-xs text-red-300">✗</div>
                                            </div>
                                            <div className="bg-blue-900/30 border border-blue-700 p-1 rounded text-center">
                                                <div className="text-xs font-bold text-blue-400">{state.emailsPerSecond.toFixed(1)}</div>
                                                <div className="text-xs text-blue-300">E/s</div>
                                            </div>
                                            <div className="bg-purple-900/30 border border-purple-700 p-1 rounded text-center">
                                                <div className="text-xs font-bold text-purple-400">{Math.round(state.estimatedTimeRemaining / 60)}m</div>
                                                <div className="text-xs text-purple-300">ETA</div>
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={handlePauseResume}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded font-medium text-xs bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
                                            >
                                                {state.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                                {state.isPaused ? 'Retomar' : 'Pausar'}
                                            </button>
                                            
                                            <button
                                                onClick={handleStopSending}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded font-medium text-xs bg-red-600 hover:bg-red-700 text-white transition-all"
                                            >
                                                <Square className="w-3 h-3" />
                                                Parar
                                            </button>
                                        </div>

                                        {state.currentEmail && (
                                            <div className="text-xs text-gray-400 p-1 bg-[#1e1e1e] rounded">
                                                <span className="text-gray-500">Processando:</span>
                                                <div className="font-mono text-blue-400 truncate">{state.currentEmail}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CompactPanel>
                        </div>
                    </div>

                    {/* Vertical Splitter */}
                    <div
                        className={`h-1 bg-[#3e3e42] border-t border-[#464647] cursor-row-resize flex items-center justify-center hover:bg-[#464647] transition-colors ${
                            isDraggingVertical ? 'bg-blue-500' : ''
                        }`}
                        onMouseDown={handleVerticalMouseDown}
                    >
                        <GripHorizontal className="w-4 h-4 text-gray-500" />
                    </div>

                    {/* Terminal Section */}
                    <div 
                        className="bg-[#1e1e1e] border-t border-[#3e3e42] flex-shrink-0"
                        style={{ height: `${terminalHeight}px` }}
                    >
                        <UltraCompactTerminal 
                            logs={state.logs}
                            isActive={state.isActive}
                            currentEmail={state.currentEmail}
                        />
                    </div>
                </div>

                {/* Horizontal Splitter */}
                <div
                    className={`w-1 bg-[#3e3e42] border-l border-[#464647] cursor-col-resize flex items-center justify-center hover:bg-[#464647] transition-colors ${
                        isDraggingHorizontal ? 'bg-blue-500' : ''
                    }`}
                    onMouseDown={handleHorizontalMouseDown}
                >
                    <div className="h-8 w-1 bg-gray-500 rounded-full transform rotate-90"></div>
                </div>

                {/* Compact Right Sidebar */}
                <div 
                    className="bg-[#252526] flex flex-col overflow-hidden border-l border-[#3e3e42]"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    <div className="p-2 space-y-2 overflow-y-auto">
                        
                        {/* Email Lists */}
                        <CompactPanel 
                            title={`Listas (${lists.length})`} 
                            icon={<FolderOpen className="w-3 h-3 text-blue-400" />}
                            defaultExpanded={true}
                        >
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                {lists.map((list, index) => (
                                    <div
                                        key={list.id}
                                        className={`flex items-center justify-between p-1.5 rounded text-xs transition-all ${
                                            index === state.currentListIndex && isAutoProgressing
                                                ? 'bg-blue-900/30 border border-blue-700'
                                                : state.completedLists.includes(list.id)
                                                ? 'bg-green-900/20 border border-green-800'
                                                : 'bg-[#1e1e1e] hover:bg-[#2d2d30]'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate flex items-center gap-1">
                                                {index === state.currentListIndex && isAutoProgressing && (
                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                                )}
                                                {state.completedLists.includes(list.id) && (
                                                    <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                                                )}
                                                {list.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{list.emails.length}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">#{index + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </CompactPanel>

                        {/* SMTP Status */}
                        <CompactPanel 
                            title="Status SMTP" 
                            icon={<Server className="w-3 h-3 text-green-400" />}
                            defaultExpanded={true}
                        >
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                {configs.slice(0, 6).map((smtp) => (
                                    <div key={smtp.id} className="flex items-center justify-between p-1.5 bg-[#1e1e1e] rounded text-xs">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{smtp.name}</div>
                                            <div className="text-gray-500 truncate">{smtp.username}</div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {smtp.isActive ? (
                                                smtp.status === 'standby' ? (
                                                    <Clock className="w-2.5 h-2.5 text-yellow-500" />
                                                ) : smtp.status === 'failed' ? (
                                                    <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                                                ) : (
                                                    <CheckCircle className="w-2.5 h-2.5 text-green-500" />
                                                )
                                            ) : (
                                                <AlertCircle className="w-2.5 h-2.5 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                                <div className="text-center p-1 bg-green-900/20 rounded">
                                    <div className="font-bold text-green-400 text-xs">{activeSmtps.length}</div>
                                    <div className="text-green-300 text-xs">OK</div>
                                </div>
                                <div className="text-center p-1 bg-yellow-900/20 rounded">
                                    <div className="font-bold text-yellow-400 text-xs">{standbySmtps.length}</div>
                                    <div className="text-yellow-300 text-xs">Wait</div>
                                </div>
                                <div className="text-center p-1 bg-red-900/20 rounded">
                                    <div className="font-bold text-red-400 text-xs">{failedSmtps.length}</div>
                                    <div className="text-red-300 text-xs">Fail</div>
                                </div>
                            </div>
                        </CompactPanel>

                        {/* Global Stats */}
                        <CompactPanel 
                            title="Estatísticas" 
                            icon={<Zap className="w-3 h-3 text-purple-400" />}
                            defaultExpanded={true}
                        >
                            <div className="space-y-2">
                                {/* Current List Progress */}
                                {state.currentList && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-300 truncate">{state.currentList.name}</span>
                                            <span className="text-xs text-gray-400">{state.currentList.progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-[#3c3c3c] rounded-full h-1">
                                            <div
                                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                                style={{ width: `${state.currentList.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="text-center p-1 bg-blue-900/20 rounded">
                                        <div className="font-bold text-blue-400">{state.globalStats.totalSent + state.globalStats.totalFailed}</div>
                                        <div className="text-blue-300">Processados</div>
                                    </div>
                                    <div className="text-center p-1 bg-green-900/20 rounded">
                                        <div className="font-bold text-green-400">{state.globalStats.completedLists}</div>
                                        <div className="text-green-300">Listas OK</div>
                                    </div>
                                </div>
                            </div>
                        </CompactPanel>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UltraCompactHomePageVSCode;
