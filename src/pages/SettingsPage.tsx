import { Database, Folder, Mail, Save, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AppSettings {
    listsDirectory: string;
    simultaneousEmails: number;
    emailDelay: number;
    autoSave: boolean;
    smtpTimeoutMs: number;
    smtpSubdomains: string;
}

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>({
        listsDirectory: '',
        simultaneousEmails: 5,
        emailDelay: 1000,
        autoSave: true,
        smtpTimeoutMs: 10000,
        smtpSubdomains: 'smtp.\nmail.\nwebmail.\n@'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Carregar configurações ao montar o componente
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);

            // Carregar configurações do banco de dados
            const listsDir = await window.electronAPI?.files?.getListsDirectory();
            const simultaneousEmails = await window.electronAPI?.database?.getSetting('max_concurrent_emails');
            const emailDelay = await window.electronAPI?.database?.getSetting('delay_between_emails');
            const autoSave = await window.electronAPI?.database?.getSetting('auto_save_campaigns');
            const smtpTimeoutMs = await window.electronAPI?.database?.getSetting('smtp_timeout_ms');
            const smtpSubdomains = await window.electronAPI?.database?.getSetting('smtp_subdomains');

            setSettings({
                listsDirectory: listsDir || '',
                simultaneousEmails: parseInt(simultaneousEmails || '5', 10),
                emailDelay: parseInt(emailDelay || '1000', 10),
                autoSave: (autoSave === 'true' || autoSave === true),
                smtpTimeoutMs: parseInt(smtpTimeoutMs || '10000', 10),
                smtpSubdomains: smtpSubdomains || 'smtp.\nmail.\nwebmail.\n@'
            });
        } catch (error) {
            // console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectDirectory = async () => {
        try {
            if (!window.electronAPI?.files?.selectListsDirectory) {
                throw new Error('selectListsDirectory não está disponível');
            }
            
            const result = await window.electronAPI.files.selectListsDirectory();
            
            if (result?.success && result.directory) {
                setSettings(prev => ({
                    ...prev,
                    listsDirectory: result.directory || ''
                }));
            } else if (result?.canceled) {
                // Seleção cancelada pelo usuário - comportamento normal
            } else {
                alert('Falha ao selecionar diretório. Verifique os logs do console.');
            }
        } catch (error) {
            // console.error('Erro ao selecionar diretório:', error);
            alert(`Erro ao selecionar diretório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);

            // Salvar diretório das listas
            if (settings.listsDirectory) {
                await window.electronAPI?.files?.setListsDirectory(settings.listsDirectory);
            }

            // Salvar configurações no banco de dados
            await window.electronAPI?.database?.setSetting('max_concurrent_emails', settings.simultaneousEmails.toString(), 'number');
            await window.electronAPI?.database?.setSetting('delay_between_emails', settings.emailDelay.toString(), 'number');
            await window.electronAPI?.database?.setSetting('auto_save_campaigns', settings.autoSave.toString(), 'boolean');
            await window.electronAPI?.database?.setSetting('smtp_timeout_ms', settings.smtpTimeoutMs.toString(), 'number');
            await window.electronAPI?.database?.setSetting('smtp_subdomains', settings.smtpSubdomains, 'string');

            alert('Configurações salvas com sucesso!');
        } catch (error) {
            // console.error('Erro ao salvar configurações:', error);
            alert(`Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (key: keyof AppSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-gray-600">Carregando configurações...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Configurações Gerais */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Configurações Gerais
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Diretório das Listas
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={settings.listsDirectory}
                                            onChange={(e) => handleInputChange('listsDirectory', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Selecione o diretório..."
                                        />
                                        <button
                                            onClick={selectDirectory}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Folder className="h-4 w-4" />
                                            Selecionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configurações de Email */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Configurações de Email
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emails Simultâneos
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={settings.simultaneousEmails}
                                        onChange={(e) => handleInputChange('simultaneousEmails', parseInt(e.target.value, 10))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delay entre Envios (ms)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.emailDelay}
                                        onChange={(e) => handleInputChange('emailDelay', parseInt(e.target.value, 10))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timeout SMTP (ms)
                                    </label>
                                    <input
                                        type="number"
                                        min="1000"
                                        step="500"
                                        value={settings.smtpTimeoutMs}
                                        onChange={(e) => handleInputChange('smtpTimeoutMs', parseInt(e.target.value, 10))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subdomínios SMTP Servers
                                    </label>
                                    <textarea
                                        value={settings.smtpSubdomains}
                                        onChange={(e) => handleInputChange('smtpSubdomains', e.target.value)}
                                        rows={6}
                                        placeholder="smtp.&#10;mail.&#10;webmail.&#10;@"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Um subdomínio por linha. Usado para detectar automaticamente servidores SMTP quando apenas email e senha forem fornecidos. O símbolo "@" representa o domínio completo.
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="autoSave"
                                        checked={settings.autoSave}
                                        onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="autoSave" className="ml-2 text-sm text-gray-700">
                                        Auto-salvamento de campanhas
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            onClick={() => loadSettings()}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
