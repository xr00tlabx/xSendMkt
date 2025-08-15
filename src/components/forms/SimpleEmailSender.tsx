import React, { useState } from 'react';
import { 
    Mail, 
    Settings, 
    List, 
    Activity,
    Send,
    Pause,
    Play,
    Square,
    AlertCircle,
    CheckCircle,
    Clock,
    Users
} from 'lucide-react';
import { useEmailSender } from '../../hooks';
import type { EmailCampaign, SmtpConfig, EmailList, EmailSendLog } from '../../types';

interface FormData {
    subject: string;
    sender: string;
    htmlContent: string;
}

interface SimpleEmailSenderProps {
    lists: EmailList[];
    smtpConfigs: SmtpConfig[];
    onSave: (data: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const SimpleEmailSender: React.FC<SimpleEmailSenderProps> = ({
    lists,
    smtpConfigs,
    onSave
}) => {
    const [activeTab, setActiveTab] = useState<'compose' | 'config' | 'logs'>('compose');
    const [formData, setFormData] = useState<FormData>({
        subject: '',
        sender: '',
        htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Campaign</title>
</head>
<body>
    <h1>Sua mensagem aqui</h1>
    <p>Escreva o conteúdo do seu email aqui...</p>
</body>
</html>`
    });

    const {
        state,
        startSending,
        pauseSending,
        resumeSending,
        stopSending,
        canSend
    } = useEmailSender();

    const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive);
    const totalEmails = lists.reduce((total, list) => total + list.emails.length, 0);
    const isValidToSend = canSend(
        { 
            id: 'temp',
            ...formData, 
            selectedLists: [], 
            status: 'draft', 
            totalEmails, 
            sentEmails: 0, 
            failedEmails: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        } as EmailCampaign,
        smtpConfigs,
        lists
    );

    const handleStart = async () => {
        if (!isValidToSend) return;
        
        // Salvar campanha primeiro
        const campaignData = {
            ...formData,
            selectedLists: [],
            status: 'draft' as const,
            totalEmails,
            sentEmails: 0,
            failedEmails: 0
        };
        
        onSave(campaignData);
        
        // Iniciar envio
        const fullCampaign: EmailCampaign = {
            id: 'temp-' + Date.now(),
            ...campaignData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await startSending(fullCampaign, smtpConfigs);
    };

    const handlePause = () => {
        if (state.isPaused) {
            resumeSending();
        } else {
            pauseSending();
        }
    };

    const tabs = [
        { id: 'compose', label: 'Compor Email', icon: Mail },
        { id: 'config', label: 'Configuração', icon: Settings },
        { id: 'logs', label: 'Logs', icon: Activity }
    ];

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header com Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex space-x-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-600">{totalEmails} emails</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{activeSmtps.length} SMTPs ativos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo das Tabs */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'compose' && (
                    <ComposeTab
                        formData={formData}
                        setFormData={setFormData}
                        state={state}
                        isValidToSend={isValidToSend}
                        onStart={handleStart}
                        onPause={handlePause}
                        onStop={stopSending}
                    />
                )}
                
                {activeTab === 'config' && (
                    <ConfigTab
                        lists={lists}
                        smtpConfigs={smtpConfigs}
                    />
                )}
                
                {activeTab === 'logs' && (
                    <LogsTab state={state} />
                )}
            </div>
        </div>
    );
};

// Tab de Composição de Email
const ComposeTab: React.FC<{
    formData: any;
    setFormData: (data: any) => void;
    state: any;
    isValidToSend: boolean;
    onStart: () => void;
    onPause: () => void;
    onStop: () => void;
}> = ({ formData, setFormData, state, isValidToSend, onStart, onPause, onStop }) => {
    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            {/* Campos do Email */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Dados do Email</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assunto
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData((prev: FormData) => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            onChange={(e) => setFormData((prev: FormData) => ({ ...prev, sender: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="nome@empresa.com"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conteúdo HTML
                    </label>
                    <textarea
                        value={formData.htmlContent}
                        onChange={(e) => setFormData((prev: FormData) => ({ ...prev, htmlContent: e.target.value }))}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="Cole aqui o HTML do seu email..."
                    />
                </div>
            </div>

            {/* Controles de Envio */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Controles de Envio</h3>
                
                {!state.isActive ? (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onStart}
                            disabled={!isValidToSend}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                isValidToSend
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <Send className="w-5 h-5" />
                            Iniciar Envio
                        </button>
                        
                        {!isValidToSend && (
                            <div className="text-sm text-gray-500">
                                Preencha todos os campos para habilitar o envio
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progresso</span>
                                <span>{state.sentEmails + state.failedEmails} / {state.totalEmails}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${state.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{state.sentEmails}</div>
                                <div className="text-sm text-green-700">Enviados</div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{state.failedEmails}</div>
                                <div className="text-sm text-red-700">Falharam</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {state.emailsPerSecond.toFixed(1)}
                                </div>
                                <div className="text-sm text-blue-700">Emails/seg</div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onPause}
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
                                onClick={onStop}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
                            >
                                <Square className="w-4 h-4" />
                                Parar
                            </button>

                            {state.isPaused && (
                                <div className="flex items-center gap-2 text-yellow-600 ml-4">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Envio pausado</span>
                                </div>
                            )}
                        </div>

                        {/* Current Email */}
                        {state.currentEmail && (
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Enviando para:</span> {state.currentEmail}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Tab de Configuração
const ConfigTab: React.FC<{
    lists: EmailList[];
    smtpConfigs: SmtpConfig[];
}> = ({ lists, smtpConfigs }) => {
    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Listas de Email */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Listas de Email</h3>
                
                {lists.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma lista encontrada</p>
                        <p className="text-sm">Vá para a página "Listas" para adicionar listas de email</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.map((list) => (
                            <div key={list.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <List className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium">{list.name}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {list.emails.length} emails
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SMTPs */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações SMTP</h3>
                
                {smtpConfigs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum SMTP configurado</p>
                        <p className="text-sm">Vá para a página "SMTP" para configurar servidores de email</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {smtpConfigs.map((smtp) => (
                            <div key={smtp.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        smtp.isActive ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                    <div>
                                        <div className="font-medium">{smtp.name}</div>
                                        <div className="text-sm text-gray-600">{smtp.username}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {smtp.status === 'standby' && (
                                        <div className="flex items-center gap-1 text-yellow-600">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">Standby</span>
                                        </div>
                                    )}
                                    {smtp.isActive && smtp.status !== 'standby' && (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm">Ativo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Tab de Logs
const LogsTab: React.FC<{
    state: any;
}> = ({ state }) => {
    const getLogIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            default:
                return <Activity className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Logs de Envio</h3>
                    <span className="text-sm text-gray-500">{state.logs.length} entradas</span>
                </div>
                
                {state.logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum log ainda</p>
                        <p className="text-sm">Os logs aparecerão aqui quando você iniciar um envio</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {state.logs.map((log: EmailSendLog) => (
                            <div
                                key={log.id}
                                className={`p-4 rounded-lg border-l-4 ${
                                    log.type === 'success' ? 'border-green-500 bg-green-50' :
                                    log.type === 'error' ? 'border-red-500 bg-red-50' :
                                    log.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                                    'border-blue-500 bg-blue-50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {getLogIcon(log.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">
                                            {log.message}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                            <span>{log.timestamp.toLocaleTimeString()}</span>
                                            {log.email && <span>Para: {log.email}</span>}
                                            {log.smtpId && <span>SMTP: {log.smtpId}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleEmailSender;
