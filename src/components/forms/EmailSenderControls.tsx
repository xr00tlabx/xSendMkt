import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Info,
    Mail,
    Pause,
    Play,
    Send,
    Square,
    X,
    Zap
} from 'lucide-react';
import React from 'react';
import { useEmailSender } from '../../hooks';
import type { EmailCampaign, SmtpConfig } from '../../types';
import EmailSenderConfigPanel from './EmailSenderConfigPanel';
import RealTimeStats from './RealTimeStats';
import SmtpStatusPanel from './SmtpStatusPanel';

interface EmailSenderControlsProps {
    campaign: EmailCampaign;
    smtpConfigs: SmtpConfig[];
    availableLists: any[]; // Lista de todas as listas disponíveis
    onComplete?: () => void;
}

const EmailSenderControls: React.FC<EmailSenderControlsProps> = ({
    campaign,
    smtpConfigs,
    availableLists,
    onComplete
}) => {
    const {
        state,
        config,
        setConfig,
        startSending,
        pauseSending,
        resumeSending,
        stopSending,
        canSend
    } = useEmailSender();

    const handleStart = async () => {
        try {
            await startSending(campaign, smtpConfigs);
        } catch (error) {
            console.error('Erro ao iniciar envio:', error);
        }
    };

    const handlePause = () => {
        if (state.isPaused) {
            resumeSending();
        } else {
            pauseSending();
        }
    };

    const handleStop = () => {
        stopSending();
        if (onComplete) {
            onComplete();
        }
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getStatusIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <X className="w-4 h-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const isValidToSend = canSend(campaign, smtpConfigs, availableLists);
    const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive);
    const standbySmtps = smtpConfigs.filter(smtp => smtp.status === 'standby');

    // Debug log
    console.log('🎯 EmailSenderControls - Props recebidas:', {
        campaign: {
            subject: campaign?.subject,
            sender: campaign?.sender,
            htmlContent: campaign?.htmlContent?.substring(0, 50) + '...',
            selectedLists: campaign?.selectedLists
        },
        smtpConfigs: smtpConfigs?.length,
        isValidToSend
    });

    return (
        <div className="space-y-6">
            {/* Configurações */}
            <EmailSenderConfigPanel
                config={config}
                onConfigChange={setConfig}
                disabled={state.isActive}
            />

            {/* Status dos SMTPs */}
            <SmtpStatusPanel smtpConfigs={smtpConfigs} />

            {/* Status e Controles */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Sistema de Envio
                    </h3>

                    <div className="flex items-center gap-2">
                        {!state.isActive ? (
                            <button
                                onClick={handleStart}
                                disabled={!isValidToSend}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isValidToSend
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                                Iniciar Envio
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePause}
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
                                    onClick={handleStop}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
                                >
                                    <Square className="w-4 h-4" />
                                    Parar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Informações sobre o modo automático */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">🚀 Modo Automático Ativado</h4>
                    <p className="text-sm text-blue-700">
                        O sistema irá processar automaticamente todas as listas de emails disponíveis.
                        Não é necessário selecionar listas específicas - o envio será feito de forma organizada e sequencial.
                    </p>
                </div>

                {/* Validação */}
                {!isValidToSend && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Requisitos para envio:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            {!campaign.subject.trim() && <li>• Assunto deve ser preenchido</li>}
                            {!campaign.sender.trim() && <li>• Remetente deve ser preenchido</li>}
                            {!campaign.htmlContent.trim() && <li>• Conteúdo do email deve ser preenchido</li>}
                            {availableLists.length === 0 && <li>• Pelo menos uma lista de emails deve estar disponível</li>}
                            {activeSmtps.length === 0 && <li>• Pelo menos um SMTP deve estar ativo</li>}
                            {!window.electronAPI?.email?.sendSingle && <li>• API do Electron não está disponível</li>}
                        </ul>
                    </div>
                )}

                {/* Estatísticas dos SMTPs */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {state.emailsPerSecond.toFixed(1)}
                        </div>
                        <div className="text-sm text-blue-700">Emails/seg atual</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {config.sendingSpeed}
                        </div>
                        <div className="text-sm text-purple-700">Velocidade alvo</div>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                            {Math.round((state.sentEmails / ((Date.now() - (state.isActive ? Date.now() - 30000 : Date.now())) / 1000)) * 60) || 0}
                        </div>
                        <div className="text-sm text-indigo-700">Emails/min</div>
                    </div>
                </div>
            </div>

            {/* Barra de Progresso */}
            {state.isActive && (
                <>
                    <RealTimeStats state={state} />

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">Progresso do Envio</h4>
                            <span className="text-sm text-gray-600">
                                {state.sentEmails + state.failedEmails} / {state.totalEmails}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${state.progress}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Enviados:</span>
                                <span className="ml-1 font-medium text-green-600">{state.sentEmails}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Falharam:</span>
                                <span className="ml-1 font-medium text-red-600">{state.failedEmails}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Atual:</span>
                                <span className="ml-1 font-medium text-blue-600 truncate block">
                                    {state.currentEmail}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Tempo restante:</span>
                                <span className="ml-1 font-medium">
                                    {formatTime(state.estimatedTimeRemaining)}
                                </span>
                            </div>
                        </div>

                        {state.isPaused && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-yellow-700 text-sm">Envio pausado</span>
                            </div>
                        )}
                    </div>
                </>
            )}            {/* Logs */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Logs de Envio</h4>
                    <span className="text-sm text-gray-500">{state.logs.length} entradas</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                    {state.logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum log ainda</p>
                        </div>
                    ) : (
                        state.logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                            >
                                {getStatusIcon(log.type)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium">{log.message}</span>
                                        {log.email && (
                                            <span className="text-xs text-gray-500">
                                                ({log.email})
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {log.timestamp.toLocaleTimeString()}
                                        {log.smtpId && (
                                            <span className="ml-2">SMTP: {log.smtpId}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Lista de SMTPs em Standby */}
            {standbySmtps.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        SMTPs em Standby
                    </h4>

                    <div className="space-y-2">
                        {standbySmtps.map((smtp) => (
                            <div
                                key={smtp.id}
                                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-medium">{smtp.name}</span>
                                        <span className="ml-2 text-sm text-gray-600">
                                            ({smtp.username})
                                        </span>
                                    </div>
                                    <div className="text-right text-sm">
                                        <div className="text-yellow-600">
                                            Falhas: {smtp.failureCount || 0}
                                        </div>
                                        {smtp.standbyUntil && (
                                            <div className="text-gray-500">
                                                Até: {smtp.standbyUntil.toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {smtp.lastError && (
                                    <div className="mt-2 text-sm text-red-600">
                                        {smtp.lastError}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailSenderControls;
