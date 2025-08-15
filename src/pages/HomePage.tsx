import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Mail,
    Pause,
    Play,
    Send,
    Server,
    Square,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useEmailLists, useEmailSender, useSmtpConfigs } from '../hooks';
import type { EmailCampaign } from '../types';


const HomePage: React.FC = () => {
    const { lists } = useEmailLists();
    const { configs } = useSmtpConfigs();
    const { state, startSending, pauseSending, resumeSending, stopSending, canSend } = useEmailSender();

    // Estado do formulário
    const [formData, setFormData] = useState({
        subject: '',
        sender: '',
        htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email</title>
</head>
<body>
    <h2>Olá!</h2>
    <p>Sua mensagem aqui...</p>
</body>
</html>`
    });

    // Estatísticas
    const totalEmails = lists.reduce((total, list) => total + list.emails.length, 0);
    const activeSmtps = configs.filter(smtp => smtp.isActive);
    const standbySmtps = configs.filter(smtp => smtp.status === 'standby');

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

    // Função para iniciar envio
    const handleStartSending = async () => {
        try {
            const campaign: EmailCampaign = {
                id: Date.now().toString(),
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
            };

            await startSending(campaign, configs);
        } catch (error) {
            console.error('Erro ao iniciar envio:', error);
        }
    };

    // Função para pausar/retomar
    const handlePauseResume = () => {
        if (state.isPaused) {
            resumeSending();
        } else {
            pauseSending();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header com estatísticas */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Mail className="w-8 h-8 text-blue-600" />
                            xSendMkt
                        </h1>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{totalEmails}</span>
                                <span className="text-gray-500">emails</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-green-500" />
                                <span className="font-medium">{activeSmtps.length}</span>
                                <span className="text-gray-500">SMTPs ativos</span>
                            </div>
                            {standbySmtps.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                    <span className="font-medium">{standbySmtps.length}</span>
                                    <span className="text-gray-500">em standby</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    
                    {/* Formulário de Email - 70% */}
                    <div className="col-span-8 space-y-6">
                        
                        {/* Dados básicos */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Dados do Email</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assunto
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Digite o assunto do email..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remetente
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.sender}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Conteúdo HTML
                                </label>
                                <textarea
                                    value={formData.htmlContent}
                                    onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    placeholder="Digite o conteúdo HTML do email..."
                                />
                            </div>
                        </div>

                        {/* Controles de Envio */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Controles de Envio</h2>
                            
                            {!state.isActive ? (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleStartSending}
                                        disabled={!isReadyToSend}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all ${
                                            isReadyToSend
                                                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <Send className="w-5 h-5" />
                                        Iniciar Envio
                                    </button>
                                    
                                    {!isReadyToSend && (
                                        <div className="text-sm text-gray-600">
                                            {!formData.subject.trim() && 'Preencha o assunto. '}
                                            {!formData.sender.trim() && 'Preencha o remetente. '}
                                            {!formData.htmlContent.trim() && 'Preencha o conteúdo. '}
                                            {lists.length === 0 && 'Adicione listas de email. '}
                                            {activeSmtps.length === 0 && 'Configure SMTPs ativos.'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    
                                    {/* Barra de Progresso */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Progresso: {state.sentEmails + state.failedEmails} / {state.totalEmails}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {state.progress.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                                style={{ width: `${state.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Estatísticas de Envio */}
                                    <div className="grid grid-cols-4 gap-4 text-center">
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">{state.sentEmails}</div>
                                            <div className="text-sm text-green-700">Enviados</div>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600">{state.failedEmails}</div>
                                            <div className="text-sm text-red-700">Falharam</div>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {state.emailsPerSecond.toFixed(1)}
                                            </div>
                                            <div className="text-sm text-blue-700">Emails/seg</div>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {Math.round(state.estimatedTimeRemaining / 60)}m
                                            </div>
                                            <div className="text-sm text-purple-700">Restante</div>
                                        </div>
                                    </div>

                                    {/* Controles */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handlePauseResume}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
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
                                            onClick={stopSending}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
                                        >
                                            <Square className="w-4 h-4" />
                                            Parar
                                        </button>

                                        {state.currentEmail && (
                                            <div className="text-sm text-gray-600">
                                                Enviando para: <span className="font-mono">{state.currentEmail}</span>
                                            </div>
                                        )}

                                        {state.isPaused && (
                                            <div className="flex items-center gap-2 text-yellow-600">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-medium">Pausado</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logs e Status - 30% */}
                    <div className="col-span-4 space-y-6">
                        
                        {/* Status dos SMTPs */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-500" />
                                Status SMTPs
                            </h3>
                            
                            <div className="space-y-3">
                                {configs.slice(0, 5).map((smtp) => (
                                    <div key={smtp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{smtp.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{smtp.username}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {smtp.isActive ? (
                                                smtp.status === 'standby' ? (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-xs text-yellow-600">Standby</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                        <span className="text-xs text-green-600">Ativo</span>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-500">Inativo</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {configs.length > 5 && (
                                    <div className="text-center text-sm text-gray-500">
                                        +{configs.length - 5} SMTPs
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Logs de Envio */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Logs de Envio</h3>
                            
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {state.logs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Nenhum log ainda</p>
                                    </div>
                                ) : (
                                    state.logs.slice(0, 50).map((log) => (
                                        <div
                                            key={log.id}
                                            className={`p-3 rounded-lg text-sm ${
                                                log.type === 'success' ? 'bg-green-50 text-green-800' :
                                                log.type === 'error' ? 'bg-red-50 text-red-800' :
                                                log.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                                                'bg-blue-50 text-blue-800'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{log.message}</div>
                                                    {log.email && (
                                                        <div className="text-xs opacity-75 truncate">
                                                            {log.email}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs opacity-75 ml-2 flex-shrink-0">
                                                    {log.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
