import {
    AlertCircle,
    CheckCircle,
    Clock,
    Code,
    FolderOpen,
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
import React, { useEffect, useState } from 'react';
import GlobalStatsPanel from '../components/GlobalStatsPanel';
import HackerTerminal from '../components/HackerTerminal';
import { useEmailLists, useSmtpConfigs } from '../hooks';
import { useSequentialEmailSender } from '../hooks/useSequentialEmailSender';
import type { EmailCampaign } from '../types';

const NewHomePageVSCode: React.FC = () => {
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
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #007acc; color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
        .footer { background: #343a40; color: white; padding: 10px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sua Campanha de Email</h1>
        </div>
        <div class="content">
            <h2>Olá!</h2>
            <p>Esta é sua mensagem personalizada aqui...</p>
            <p>Adicione seu conteúdo e personalize conforme necessário.</p>
        </div>
        <div class="footer">
            <p>Enviado via xSendMkt</p>
        </div>
    </div>
</body>
</html>`
    });

    // Estado do envio sequencial de listas
    const [isAutoProgressing, setIsAutoProgressing] = useState(false);

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
        // Esta função será integrada com o sistema de logs existente
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

    return (
        <div className="min-h-screen bg-[#1e1e1e] text-gray-100">
            {/* VS Code Style Header */}
            <div className="bg-[#007acc] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Code className="w-6 h-6 text-white" />
                    <h1 className="text-xl font-semibold text-white">xSendMkt</h1>
                    <span className="text-blue-100 text-sm">Email Marketing Campaign</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-blue-100">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{totalEmails}</span>
                        <span>emails</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span>{activeSmtps.length}</span>
                        <span>SMTPs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <List className="w-4 h-4" />
                        <span>{lists.length}</span>
                        <span>listas</span>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-60px)]">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Content Panels */}
                    <div className="flex-1 grid grid-cols-12 gap-0">

                        {/* Email Form - 8 columns */}
                        <div className="col-span-8 bg-[#252526] border-r border-[#3e3e42]">
                            <div className="p-6 space-y-6">

                                {/* Campaign Form */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                        <h2 className="text-lg font-semibold">Configuração da Campanha</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Assunto
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500"
                                                placeholder="Digite o assunto do email..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Remetente
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.sender}
                                                onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                                                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500"
                                                placeholder="seu@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Conteúdo HTML
                                        </label>
                                        <textarea
                                            value={formData.htmlContent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                                            className="w-full h-64 px-3 py-2 bg-[#1e1e1e] border border-[#464647] rounded text-gray-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
                                            placeholder="Digite o conteúdo HTML do email..."
                                        />
                                    </div>
                                </div>

                                {/* Sending Controls */}
                                <div className="bg-[#2d2d30] p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        <h3 className="text-lg font-semibold">Controles de Envio</h3>
                                    </div>

                                    {!state.isActive ? (
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={handleStartSending}
                                                disabled={!isReadyToSend}
                                                className={`flex items-center gap-2 px-6 py-3 rounded font-medium transition-all ${isReadyToSend
                                                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Send className="w-5 h-5" />
                                                Iniciar Envio Sequencial
                                            </button>

                                            {!isReadyToSend && (
                                                <div className="text-sm text-gray-400">
                                                    {!formData.subject.trim() && '• Preencha o assunto '}
                                                    {!formData.sender.trim() && '• Preencha o remetente '}
                                                    {!formData.htmlContent.trim() && '• Preencha o conteúdo '}
                                                    {lists.length === 0 && '• Adicione listas de email '}
                                                    {activeSmtps.length === 0 && '• Configure SMTPs ativos'}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">

                                            {/* Progress Bar */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-300">
                                                        Lista: {state.currentList?.name || 'N/A'} ({(state.currentList?.sent || 0) + (state.currentList?.failed || 0)} / {state.currentList?.total || 0})
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        {(state.currentList?.progress || 0).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-[#3c3c3c] rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${state.currentList?.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="bg-green-900/30 border border-green-700 p-3 rounded">
                                                    <div className="text-xl font-bold text-green-400">{state.globalStats.totalSent}</div>
                                                    <div className="text-xs text-green-300">Enviados</div>
                                                </div>
                                                <div className="bg-red-900/30 border border-red-700 p-3 rounded">
                                                    <div className="text-xl font-bold text-red-400">{state.globalStats.totalFailed}</div>
                                                    <div className="text-xs text-red-300">Falharam</div>
                                                </div>
                                                <div className="bg-blue-900/30 border border-blue-700 p-3 rounded">
                                                    <div className="text-xl font-bold text-blue-400">
                                                        {state.emailsPerSecond.toFixed(1)}
                                                    </div>
                                                    <div className="text-xs text-blue-300">E/s</div>
                                                </div>
                                                <div className="bg-purple-900/30 border border-purple-700 p-3 rounded">
                                                    <div className="text-xl font-bold text-purple-400">
                                                        {Math.round(state.estimatedTimeRemaining / 60)}m
                                                    </div>
                                                    <div className="text-xs text-purple-300">ETA</div>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={handlePauseResume}
                                                    className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
                                                >
                                                    {state.isPaused ? (
                                                        <>
                                                            <Play className="w-4 h-4" />
                                                            Retomar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pause className="w-4 h-4" />
                                                            Pausar
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleStopSending}
                                                    className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
                                                >
                                                    <Square className="w-4 h-4" />
                                                    Parar
                                                </button>

                                                {state.currentEmail && (
                                                    <div className="text-sm text-gray-400">
                                                        <span className="text-gray-500">Enviando:</span>
                                                        <span className="font-mono text-blue-400 ml-2">{state.currentEmail}</span>
                                                    </div>
                                                )}

                                                {state.isPaused && (
                                                    <div className="flex items-center gap-2 text-yellow-400">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Pausado</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - 4 columns */}
                        <div className="col-span-4 bg-[#252526] flex flex-col">

                            {/* Global Stats Panel */}
                            <div className="border-b border-[#3e3e42] p-4">
                                <GlobalStatsPanel
                                    globalStats={state.globalStats}
                                    currentList={state.currentList}
                                    isActive={state.isActive}
                                />
                            </div>

                            {/* Email Lists Section */}
                            <div className="border-b border-[#3e3e42] p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <FolderOpen className="w-4 h-4 text-blue-400" />
                                    <h3 className="font-semibold text-sm">Listas de Email</h3>
                                    <span className="text-xs text-gray-500">({lists.length})</span>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {lists.map((list, index) => (
                                        <div
                                            key={list.id}
                                            className={`flex items-center justify-between p-3 rounded text-sm transition-all ${index === state.currentListIndex && isAutoProgressing
                                                    ? 'bg-blue-900/30 border border-blue-700'
                                                    : state.completedLists.includes(list.id)
                                                        ? 'bg-green-900/20 border border-green-800'
                                                        : 'bg-[#2d2d30] border border-[#3e3e42] hover:border-[#464647]'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate flex items-center gap-2">
                                                    {index === state.currentListIndex && isAutoProgressing && (
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
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
                            <div className="border-b border-[#3e3e42] p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Server className="w-4 h-4 text-green-400" />
                                    <h3 className="font-semibold text-sm">Status SMTP</h3>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {configs.slice(0, 6).map((smtp) => (
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
                                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                    <div className="text-center p-2 bg-green-900/20 rounded">
                                        <div className="font-bold text-green-400">{activeSmtps.length}</div>
                                        <div className="text-green-300">Ativo</div>
                                    </div>
                                    <div className="text-center p-2 bg-yellow-900/20 rounded">
                                        <div className="font-bold text-yellow-400">{standbySmtps.length}</div>
                                        <div className="text-yellow-300">Standby</div>
                                    </div>
                                    <div className="text-center p-2 bg-red-900/20 rounded">
                                        <div className="font-bold text-red-400">{failedSmtps.length}</div>
                                        <div className="text-red-300">Failed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terminal-style Logs Section - Bottom */}
                    <div className="h-80 bg-[#1e1e1e] border-t border-[#3e3e42]">
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

export default NewHomePageVSCode;
