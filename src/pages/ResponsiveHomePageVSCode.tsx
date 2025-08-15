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
import GlobalStatsPanel from '../components/GlobalStatsPanel';
import HackerTerminal from '../components/HackerTerminal';
import { useEmailLists, useSmtpConfigs } from '../hooks';
import { useSequentialEmailSender } from '../hooks/useSequentialEmailSender';
import type { EmailCampaign } from '../types';

const ResponsiveHomePageVSCode: React.FC = () => {
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
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #007acc, #005a9e); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 30px 20px; line-height: 1.6; }
        .content h2 { color: #333; margin-top: 0; }
        .button { display: inline-block; background: #007acc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sua Campanha de Email</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Comunicação profissional que gera resultados</p>
        </div>
        <div class="content">
            <h2>Olá!</h2>
            <p>Esta é sua mensagem personalizada aqui...</p>
            <p>Adicione seu conteúdo e personalize conforme necessário.</p>
            <a href="#" class="button">Call to Action</a>
        </div>
        <div class="footer">
            <p>Enviado via xSendMkt | Email Marketing Profissional</p>
        </div>
    </div>
</body>
</html>`
    });

    // Estado do splitter do terminal
    const [terminalHeight, setTerminalHeight] = useState(300);
    const [isDragging, setIsDragging] = useState(false);
    const [isAutoProgressing, setIsAutoProgressing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const splitterRef = useRef<HTMLDivElement>(null);

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

    // Função para adicionar log no terminal
    const addTerminalLog = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    };

    // Função para iniciar envio
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

            addTerminalLog('info', `Iniciando envio sequencial para ${lists.length} listas`);
            await startSending(campaign, configs);
        } catch (error) {
            addTerminalLog('error', `Erro ao iniciar envio: ${error}`);
            console.error('Erro ao iniciar envio:', error);
        }
    };

    // Função para pausar/retomar
    const handlePauseResume = () => {
        if (state.isPaused) {
            resumeSending();
            addTerminalLog('info', 'Envio retomado');
        } else {
            pauseSending();
            addTerminalLog('warning', 'Envio pausado');
        }
    };

    // Função para parar envio
    const handleStopSending = () => {
        stopSending();
        setIsAutoProgressing(false);
        addTerminalLog('warning', 'Envio interrompido pelo usuário');
    };

    // Manipuladores do splitter
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = containerRect.bottom - e.clientY;
        const minHeight = 200;
        const maxHeight = containerRect.height - 300;
        
        setTerminalHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="h-screen bg-[#1e1e1e] text-gray-100 flex flex-col overflow-hidden">
            {/* VS Code Style Header */}
            <div className="bg-[#007acc] px-4 py-2 flex items-center justify-between flex-shrink-0 border-b border-[#005a9e]">
                <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-white" />
                    <h1 className="text-lg font-semibold text-white">xSendMkt</h1>
                    <span className="text-blue-100 text-sm">Email Marketing Campaign</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-blue-100">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">{totalEmails}</span>
                        <span>emails</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        <span className="font-medium">{activeSmtps.length}</span>
                        <span>SMTPs</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <List className="w-3 h-3" />
                        <span className="font-medium">{lists.length}</span>
                        <span>listas</span>
                    </div>
                </div>
            </div>

            <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Content Panels */}
                    <div 
                        className="flex-1 flex overflow-hidden"
                        style={{ height: `calc(100% - ${terminalHeight}px)` }}
                    >
                        
                        {/* Email Form - 75% */}
                        <div className="flex-1 bg-[#252526] border-r border-[#3e3e42] overflow-y-auto">
                            <div className="p-4 space-y-4">
                                
                                {/* Campaign Form */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        <h2 className="text-base font-semibold">Configuração da Campanha</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Assunto
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                                className="w-full px-2 py-1.5 text-sm bg-[#3c3c3c] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500"
                                                placeholder="Digite o assunto do email..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                Remetente
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.sender}
                                                onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                                                className="w-full px-2 py-1.5 text-sm bg-[#3c3c3c] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500"
                                                placeholder="seu@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                            Conteúdo HTML
                                        </label>
                                        <textarea
                                            value={formData.htmlContent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                                            className="w-full h-48 px-2 py-1.5 text-xs bg-[#1e1e1e] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500 font-mono resize-none"
                                            placeholder="Digite o conteúdo HTML do email..."
                                        />
                                    </div>
                                </div>

                                {/* Sending Controls */}
                                <div className="bg-[#2d2d30] p-3 rounded border border-[#3e3e42]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        <h3 className="text-base font-semibold">Controles de Envio</h3>
                                    </div>
                                    
                                    {!state.isActive ? (
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={handleStartSending}
                                                disabled={!isReadyToSend}
                                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded font-medium text-sm transition-all ${
                                                    isReadyToSend
                                                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                <Send className="w-4 h-4" />
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
                                        <div className="space-y-3">
                                            
                                            {/* Progress Bar */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-gray-300">
                                                        Lista: {state.currentList?.name || 'N/A'} ({(state.currentList?.sent || 0) + (state.currentList?.failed || 0)} / {state.currentList?.total || 0})
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {(state.currentList?.progress || 0).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-[#3c3c3c] rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${state.currentList?.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="bg-green-900/30 border border-green-700 p-2 rounded text-center">
                                                    <div className="text-base font-bold text-green-400">{state.globalStats.totalSent}</div>
                                                    <div className="text-xs text-green-300">Enviados</div>
                                                </div>
                                                <div className="bg-red-900/30 border border-red-700 p-2 rounded text-center">
                                                    <div className="text-base font-bold text-red-400">{state.globalStats.totalFailed}</div>
                                                    <div className="text-xs text-red-300">Falharam</div>
                                                </div>
                                                <div className="bg-blue-900/30 border border-blue-700 p-2 rounded text-center">
                                                    <div className="text-base font-bold text-blue-400">
                                                        {state.emailsPerSecond.toFixed(1)}
                                                    </div>
                                                    <div className="text-xs text-blue-300">E/s</div>
                                                </div>
                                                <div className="bg-purple-900/30 border border-purple-700 p-2 rounded text-center">
                                                    <div className="text-base font-bold text-purple-400">
                                                        {Math.round(state.estimatedTimeRemaining / 60)}m
                                                    </div>
                                                    <div className="text-xs text-purple-300">ETA</div>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    onClick={handlePauseResume}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded font-medium text-xs bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
                                                >
                                                    {state.isPaused ? (
                                                        <>
                                                            <Play className="w-3 h-3" />
                                                            Retomar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pause className="w-3 h-3" />
                                                            Pausar
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <button
                                                    onClick={handleStopSending}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded font-medium text-xs bg-red-600 hover:bg-red-700 text-white transition-all"
                                                >
                                                    <Square className="w-3 h-3" />
                                                    Parar
                                                </button>

                                                {state.currentEmail && (
                                                    <div className="text-xs text-gray-400 flex-1 min-w-0">
                                                        <span className="text-gray-500">Enviando:</span>
                                                        <span className="font-mono text-blue-400 ml-1 truncate block">
                                                            {state.currentEmail}
                                                        </span>
                                                    </div>
                                                )}

                                                {state.isPaused && (
                                                    <div className="flex items-center gap-1 text-yellow-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-xs font-medium">Pausado</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - 25% */}
                        <div className="w-80 bg-[#252526] flex flex-col overflow-hidden">
                            
                            {/* Global Stats Panel */}
                            <div className="p-3 border-b border-[#3e3e42]">
                                <GlobalStatsPanel 
                                    globalStats={state.globalStats}
                                    currentList={state.currentList}
                                    isActive={state.isActive}
                                />
                            </div>

                            {/* Email Lists Section */}
                            <div className="border-b border-[#3e3e42] p-3 flex-1 min-h-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen className="w-3 h-3 text-blue-400" />
                                    <h3 className="font-semibold text-xs">Listas de Email</h3>
                                    <span className="text-xs text-gray-500">({lists.length})</span>
                                </div>
                                
                                <div className="space-y-1 overflow-y-auto max-h-32">
                                    {lists.map((list, index) => (
                                        <div
                                            key={list.id}
                                            className={`flex items-center justify-between p-2 rounded text-xs transition-all ${
                                                index === state.currentListIndex && isAutoProgressing
                                                    ? 'bg-blue-900/30 border border-blue-700'
                                                    : state.completedLists.includes(list.id)
                                                    ? 'bg-green-900/20 border border-green-800'
                                                    : 'bg-[#2d2d30] border border-[#3e3e42] hover:border-[#464647]'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate flex items-center gap-1">
                                                    {index === state.currentListIndex && isAutoProgressing && (
                                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                                    )}
                                                    {state.completedLists.includes(list.id) && (
                                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                                    )}
                                                    {list.name}
                                                </div>
                                                <div className="text-xs text-gray-500">{list.emails.length} emails</div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SMTP Status Section */}
                            <div className="p-3 flex-1 min-h-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Server className="w-3 h-3 text-green-400" />
                                    <h3 className="font-semibold text-xs">Status SMTP</h3>
                                </div>
                                
                                <div className="space-y-1 overflow-y-auto max-h-32">
                                    {configs.slice(0, 8).map((smtp) => (
                                        <div key={smtp.id} className="flex items-center justify-between p-2 bg-[#2d2d30] rounded text-xs">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{smtp.name}</div>
                                                <div className="text-gray-500 truncate">{smtp.username}</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {smtp.isActive ? (
                                                    smtp.status === 'standby' ? (
                                                        <Clock className="w-3 h-3 text-yellow-500" />
                                                    ) : smtp.status === 'failed' ? (
                                                        <AlertCircle className="w-3 h-3 text-red-500" />
                                                    ) : (
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                    )
                                                ) : (
                                                    <AlertCircle className="w-3 h-3 text-gray-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* SMTP Summary */}
                                <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                                    <div className="text-center p-1.5 bg-green-900/20 rounded">
                                        <div className="font-bold text-green-400">{activeSmtps.length}</div>
                                        <div className="text-green-300">Ativo</div>
                                    </div>
                                    <div className="text-center p-1.5 bg-yellow-900/20 rounded">
                                        <div className="font-bold text-yellow-400">{standbySmtps.length}</div>
                                        <div className="text-yellow-300">Standby</div>
                                    </div>
                                    <div className="text-center p-1.5 bg-red-900/20 rounded">
                                        <div className="font-bold text-red-400">{failedSmtps.length}</div>
                                        <div className="text-red-300">Failed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Splitter */}
                    <div
                        ref={splitterRef}
                        className={`h-1 bg-[#3e3e42] border-t border-[#464647] cursor-row-resize flex items-center justify-center hover:bg-[#464647] transition-colors ${
                            isDragging ? 'bg-blue-500' : ''
                        }`}
                        onMouseDown={handleMouseDown}
                    >
                        <GripHorizontal className="w-4 h-4 text-gray-500" />
                    </div>

                    {/* Terminal Section */}
                    <div 
                        className="bg-[#1e1e1e] border-t border-[#3e3e42] flex-shrink-0"
                        style={{ height: `${terminalHeight}px` }}
                    >
                        <HackerTerminal 
                            logs={state.logs}
                            isActive={state.isActive}
                            currentEmail={state.currentEmail}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveHomePageVSCode;
