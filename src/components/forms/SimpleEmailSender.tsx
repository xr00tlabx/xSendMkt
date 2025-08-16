import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    List,
    Mail,
    Pause,
    Play,
    Send,
    Settings,
    Square,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useEmailSender } from '../../hooks';
import EmailListSelector from './EmailListSelector';
import type { EmailCampaign, EmailList, EmailSendLog, SmtpConfig } from '../../types';

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
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
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
    const selectedListData = lists.filter(list => selectedLists.includes(list.id));
    const allSelectedEmails = selectedListData.flatMap(list => list.emails);
    const uniqueEmails = [...new Set(allSelectedEmails)];
    const totalEmails = uniqueEmails.length;
    const isValidToSend = canSend(
        { 
            id: 'temp',
            ...formData, 
            selectedLists: selectedLists, 
            status: 'draft', 
            totalEmails, 
            sentEmails: 0, 
            failedEmails: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        } as EmailCampaign,
        smtpConfigs,
        selectedListData
    );

    const handleStart = async () => {
        if (!isValidToSend) return;
        
        // Salvar campanha primeiro
        const campaignData = {
            ...formData,
            selectedLists: selectedLists,
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
                        lists={lists}
                        selectedLists={selectedLists}
                        onSelectionChange={setSelectedLists}
                        totalEmails={totalEmails}
                    />
                )}
                
                {activeTab === 'config' && (
                    <ConfigTab
                        lists={lists}
                        smtpConfigs={smtpConfigs}
                    />
                )}
                
                {activeTab === 'logs' && (
                    <LogsTab state={state} smtpConfigs={smtpConfigs} />
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
    lists: EmailList[];
    selectedLists: string[];
    onSelectionChange: (selected: string[]) => void;
    totalEmails: number;
}> = ({ formData, setFormData, state, isValidToSend, onStart, onPause, onStop, lists, selectedLists, onSelectionChange, totalEmails }) => {
    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            {/* Seleção de Listas de Email */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Destinatários</h3>
                <EmailListSelector
                    lists={lists}
                    selectedLists={selectedLists}
                    onSelectionChange={onSelectionChange}
                    showStats={true}
                />
                {selectedLists.length === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Selecione pelo menos uma lista de emails para continuar
                        </p>
                    </div>
                )}
            </div>

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
                                {selectedLists.length === 0 
                                    ? 'Selecione pelo menos uma lista de emails'
                                    : totalEmails === 0
                                    ? 'As listas selecionadas não possuem emails válidos'
                                    : 'Preencha todos os campos para habilitar o envio'
                                }
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
                            <div key={smtp.id} className={`p-4 border rounded-lg ${smtp.status === 'standby' ? 'border-yellow-300 bg-yellow-50' :
                                    smtp.status === 'failed' ? 'border-red-300 bg-red-50' :
                                        smtp.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-3 h-3 rounded-full mt-1 ${smtp.status === 'standby' ? 'bg-yellow-500' :
                                                smtp.status === 'failed' ? 'bg-red-500' :
                                                    smtp.isActive ? 'bg-green-500' : 'bg-gray-300'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="font-medium">{smtp.name}</div>
                                            <div className="text-sm text-gray-600">{smtp.username}</div>
                                            {smtp.status === 'standby' && smtp.lastError && (
                                                <div className="text-xs text-yellow-700 mt-1">
                                                    {smtp.failureCount} falha(s): {smtp.lastError}
                                                </div>
                                            )}
                                            {smtp.status === 'failed' && smtp.lastError && (
                                                <div className="text-xs text-red-700 mt-1">
                                                    Falhou: {smtp.lastError}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        {smtp.status === 'standby' && (
                                            <div className="flex items-center gap-1 text-yellow-600">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-medium">Standby</span>
                                            </div>
                                        )}
                                        {smtp.status === 'failed' && (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Falhou</span>
                                            </div>
                                        )}
                                        {smtp.isActive && smtp.status !== 'standby' && smtp.status !== 'failed' && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Ativo</span>
                                            </div>
                                        )}
                                        {smtp.status === 'standby' && smtp.standbyUntil && (
                                            <div className="text-xs text-yellow-600">
                                                {new Date(smtp.standbyUntil) > new Date()
                                                    ? `${Math.ceil((smtp.standbyUntil.getTime() - Date.now()) / 60000)} min`
                                                    : 'Pronto'
                                                }
                                            </div>
                                        )}
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

// Tab de Logs
const LogsTab: React.FC<{
    state: any;
    smtpConfigs: SmtpConfig[];
}> = ({ state, smtpConfigs }) => {
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

    const formatTimeRemaining = (standbyUntil: Date) => {
        const now = new Date();
        const diff = standbyUntil.getTime() - now.getTime();
        if (diff <= 0) return "Pronto para ativar";

        const minutes = Math.ceil(diff / 60000);
        if (minutes < 60) return `${minutes} min restante(s)`;

        const hours = Math.ceil(minutes / 60);
        return `${hours}h ${minutes % 60}min restante(s)`;
    };

    const standbySmtps = smtpConfigs.filter(smtp => smtp.status === 'standby');
    const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive && smtp.status !== 'standby');
    const failedSmtps = smtpConfigs.filter(smtp => smtp.status === 'failed');

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Status dos SMTPs */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos SMTPs</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-green-800">Ativos</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600 mt-2">{activeSmtps.length}</div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium text-yellow-800">Em Standby</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 mt-2">{standbySmtps.length}</div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="font-medium text-red-800">Falhados</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600 mt-2">{failedSmtps.length}</div>
                    </div>
                </div>

                {/* Detalhes dos SMTPs em Standby */}
                {standbySmtps.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">SMTPs em Standby:</h4>
                        <div className="space-y-2">
                            {standbySmtps.map(smtp => (
                                <div key={smtp.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{smtp.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {smtp.failureCount} falha(s) • {smtp.lastError}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-yellow-600">
                                                {smtp.standbyUntil ? formatTimeRemaining(smtp.standbyUntil) : 'Calculando...'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Logs de Envio */}
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
                            {state.logs.map((log: EmailSendLog) => {
                                const smtp = smtpConfigs.find(s => s.id === log.smtpId);
                                return (
                                    <div
                                        key={log.id}
                                        className={`p-4 rounded-lg border-l-4 ${log.type === 'success' ? 'border-green-500 bg-green-50' :
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
                                                {smtp && <span>SMTP: {smtp.name}</span>}
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
    );
};

export default SimpleEmailSender;
