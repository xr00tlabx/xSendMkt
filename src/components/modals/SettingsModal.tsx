import { Loader2, Play, Settings, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { AppSettings, ProxyTestResult } from '../../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [settings, setSettings] = useState<AppSettings>({
        threads: 10,
        timeout: 30,
        proxies: []
    });
    const [proxiesText, setProxiesText] = useState('');
    const [testThreads, setTestThreads] = useState(5);
    const [isTestingProxies, setIsTestingProxies] = useState(false);
    const [proxyTestResults, setProxyTestResults] = useState<ProxyTestResult[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Load settings from localStorage or default values
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings(parsed);
                setProxiesText(parsed.proxies.join('\n'));
            }
        }
    }, [isOpen]);

    const handleSave = () => {
        const proxies = proxiesText
            .split('\n')
            .map(proxy => proxy.trim())
            .filter(proxy => proxy.length > 0);

        const updatedSettings = { ...settings, proxies };
        setSettings(updatedSettings);

        // Save to localStorage
        localStorage.setItem('appSettings', JSON.stringify(updatedSettings));

        onSave(updatedSettings);
        onClose();
    };

    const testProxies = async () => {
        if (!proxiesText.trim()) return;

        setIsTestingProxies(true);
        setProxyTestResults([]);

        const proxies = proxiesText
            .split('\n')
            .map(proxy => proxy.trim())
            .filter(proxy => proxy.length > 0);

        // Simulate proxy testing with controlled concurrency
        const testProxy = async (proxy: string): Promise<ProxyTestResult> => {
            return new Promise((resolve) => {
                // Simulate test delay
                const delay = Math.random() * 3000 + 1000; // 1-4 seconds
                setTimeout(() => {
                    const success = Math.random() > 0.3; // 70% success rate
                    resolve({
                        proxy,
                        status: success ? 'success' : 'failed',
                        responseTime: success ? Math.floor(Math.random() * 2000 + 500) : undefined,
                        error: success ? undefined : 'Connection timeout'
                    });
                }, delay);
            });
        };

        // Test proxies in batches based on testThreads
        const results: ProxyTestResult[] = [];
        for (let i = 0; i < proxies.length; i += testThreads) {
            const batch = proxies.slice(i, i + testThreads);
            const batchResults = await Promise.all(batch.map(testProxy));
            results.push(...batchResults);
            setProxyTestResults([...results]);
        }

        setIsTestingProxies(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-6xl bg-gradient-to-br from-[var(--vscode-editor-background)] to-[var(--vscode-sideBar-background)] rounded-2xl shadow-2xl border border-[var(--vscode-border)]/50 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-[var(--vscode-border)]/50">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Settings className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--vscode-foreground)]">
                                        Configurações
                                    </h2>
                                    <p className="text-sm text-[var(--vscode-descriptionForeground)]">
                                        Configure as opções do sistema
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                                <X className="h-5 w-5 text-[var(--vscode-foreground)]" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-b from-transparent to-[var(--vscode-sideBar-background)]/20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* General Settings */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-[var(--vscode-foreground)]">
                                        Configurações Gerais
                                    </h3>
                                </div>

                                <div className="space-y-6 p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-[var(--vscode-border)]/30 backdrop-blur-sm">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-3">
                                            Threads
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={settings.threads}
                                            onChange={(e) => setSettings({ ...settings, threads: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm"
                                        />
                                        <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-2 bg-[var(--vscode-textBlockQuote-background)]/50 p-2 rounded-lg">
                                            Número de threads simultâneas para envio de emails
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-3">
                                            Timeout (segundos)
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="300"
                                            value={settings.timeout}
                                            onChange={(e) => setSettings({ ...settings, timeout: parseInt(e.target.value) || 30 })}
                                            className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm"
                                        />
                                        <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-2 bg-[var(--vscode-textBlockQuote-background)]/50 p-2 rounded-lg">
                                            Timeout para conexões SMTP
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Proxy Settings */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-[var(--vscode-foreground)]">
                                        Configurações de Proxy
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-[var(--vscode-border)]/30 backdrop-blur-sm">
                                        <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-3">
                                            Lista de Proxies
                                        </label>
                                        <textarea
                                            value={proxiesText}
                                            onChange={(e) => setProxiesText(e.target.value)}
                                            placeholder="Digite um proxy por linha&#10;Exemplo:&#10;http://proxy1:8080&#10;http://user:pass@proxy2:3128&#10;socks5://proxy3:1080"
                                            rows={8}
                                            className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm font-mono text-sm"
                                        />
                                        <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-2 bg-[var(--vscode-textBlockQuote-background)]/50 p-2 rounded-lg">
                                            Um proxy por linha. Suporte para HTTP, HTTPS e SOCKS5
                                        </p>
                                    </div>

                                    <div className="flex items-end space-x-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-3">
                                                Threads para Teste
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={testThreads}
                                                onChange={(e) => setTestThreads(parseInt(e.target.value) || 5)}
                                                className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={testProxies}
                                            disabled={isTestingProxies || !proxiesText.trim()}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                                        >
                                            {isTestingProxies ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Play className="h-5 w-5" />
                                            )}
                                            <span className="font-medium">Testar Proxies</span>
                                        </button>
                                    </div>

                                    {/* Proxy Test Results */}
                                    {proxyTestResults.length > 0 && (
                                        <div className="p-6 bg-gradient-to-br from-green-500/5 to-red-500/5 rounded-2xl border border-[var(--vscode-border)]/30 backdrop-blur-sm">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-red-500 rounded-full"></div>
                                                <h4 className="text-sm font-medium text-[var(--vscode-foreground)]">
                                                    Resultados dos Testes
                                                </h4>
                                            </div>
                                            <div className="max-h-40 overflow-y-auto bg-[var(--vscode-editor-background)]/50 rounded-xl border border-[var(--vscode-border)]/30">
                                                {proxyTestResults.map((result, index) => (
                                                    <div
                                                        key={index}
                                                        className={`px-4 py-3 border-b border-[var(--vscode-border)]/20 last:border-b-0 transition-all duration-200 ${result.status === 'success'
                                                                ? 'hover:bg-green-500/10'
                                                                : 'hover:bg-red-500/10'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-mono text-[var(--vscode-foreground)] truncate flex-1 mr-4">
                                                                {result.proxy}
                                                            </span>
                                                            <div className="flex items-center space-x-3">
                                                                {result.responseTime && (
                                                                    <div className="text-center">
                                                                        <div className="text-xs text-[var(--vscode-descriptionForeground)]">Tempo</div>
                                                                        <div className="text-xs font-mono text-[var(--vscode-foreground)]">
                                                                            {result.responseTime}ms
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <span
                                                                    className={`text-xs px-3 py-1 rounded-full font-medium border ${result.status === 'success'
                                                                            ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                                                            : 'bg-red-500/20 border-red-500/30 text-red-400'
                                                                        }`}
                                                                >
                                                                    {result.status === 'success' ? 'OK' : 'FALHOU'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {result.error && (
                                                            <p className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 mt-2">{result.error}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[var(--vscode-editor-background)]/80 backdrop-blur-sm border-t border-[var(--vscode-border)]/50 p-6">
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-[var(--vscode-foreground)] hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 border border-[var(--vscode-border)]/50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
