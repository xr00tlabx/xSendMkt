import { Database, Folder, Mail, Save, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AppSettings {
    listsDirectory: string;
    apiMode: 'mock' | 'real';
    simultaneousEmails: number;
    emailDelay: number;
    autoSave: boolean;
}

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>({
        listsDirectory: '',
        apiMode: 'mock',
        simultaneousEmails: 5,
        emailDelay: 1000,
        autoSave: true
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
            const [
                listsDir,
                apiMode,
                simultaneousEmails,
                emailDelay,
                autoSave
            ] = await Promise.all([
                window.electronAPI?.files?.getListsDirectory() || '',
                window.electronAPI?.database?.getSetting('api_mode') || 'mock',
                window.electronAPI?.database?.getSetting('max_concurrent_emails') || '5',
                window.electronAPI?.database?.getSetting('delay_between_emails') || '1000',
                window.electronAPI?.database?.getSetting('auto_save_campaigns') || 'true'
            ]);

            setSettings({
                listsDirectory: listsDir,
                apiMode: apiMode === 'real' ? 'real' : 'mock',
                simultaneousEmails: parseInt(simultaneousEmails, 10),
                emailDelay: parseInt(emailDelay, 10),
                autoSave: autoSave === 'true'
            });
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectDirectory = async () => {
        try {
            console.log('Tentando selecionar diretório...');
            const result = await window.electronAPI?.files?.selectListsDirectory();
            console.log('Resultado da seleção:', result);
            
            if (result?.success && result.directory) {
                console.log('Diretório selecionado:', result.directory);
                setSettings(prev => ({
                    ...prev,
                    listsDirectory: result.directory || ''
                }));
            } else if (result?.canceled) {
                console.log('Seleção cancelada pelo usuário');
            } else {
                console.log('Falha na seleção:', result);
                alert('Falha ao selecionar diretório. Verifique os logs do console.');
            }
        } catch (error) {
            console.error('Erro ao selecionar diretório:', error);
            alert(`Erro ao selecionar diretório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            console.log('Salvando configurações:', settings);

            // Salvar todas as configurações no banco de dados
            const results = await Promise.all([
                window.electronAPI?.files?.setListsDirectory(settings.listsDirectory),
                window.electronAPI?.database?.setSetting('api_mode', settings.apiMode),
                window.electronAPI?.database?.setSetting('max_concurrent_emails', settings.simultaneousEmails.toString(), 'number'),
                window.electronAPI?.database?.setSetting('delay_between_emails', settings.emailDelay.toString(), 'number'),
                window.electronAPI?.database?.setSetting('auto_save_campaigns', settings.autoSave.toString(), 'boolean')
            ]);

            console.log('Resultados do salvamento:', results);
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Modo da API
                                    </label>
                                    <select
                                        value={settings.apiMode}
                                        onChange={(e) => handleInputChange('apiMode', e.target.value as 'mock' | 'real')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="mock">Mock (Desenvolvimento)</option>
                                        <option value="real">Real (Produção)</option>
                                    </select>
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
