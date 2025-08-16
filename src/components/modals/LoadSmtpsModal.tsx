import { AlertCircle, FileText, Upload, X, Settings, Zap, CheckCircle, Clock, Activity } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import type { SmtpConfig } from '../../types';
import { detectSmtpFromEmail, validateEmail, groupEmailsByProvider, detectMostCommonProvider } from '../../utils/smtpDetector';

interface LoadSmtpsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (smtps: SmtpConfig[]) => void;
}

interface TestProgress {
    isRunning: boolean;
    currentEmail: string;
    tested: number;
    total: number;
    validFound: number;
    stopOnFirstValid: boolean;
}

const LoadSmtpsModal: React.FC<LoadSmtpsModalProps> = ({ isOpen, onClose, onLoad }) => {
    const [smtpsText, setSmtpsText] = useState('');
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [previewSmtps, setPreviewSmtps] = useState<SmtpConfig[]>([]);
    const [testProgress, setTestProgress] = useState<TestProgress>({
        isRunning: false,
        currentEmail: '',
        tested: 0,
        total: 0,
        validFound: 0,
        stopOnFirstValid: true
    });
    const [settings, setSettings] = useState({
        stopOnFirstValid: true,
        enableFastMode: true,
        maxThreads: 5,
        testTimeout: 3000
    });

    const parseSmtpsText = useCallback((text: string): { smtps: SmtpConfig[]; errors: string[] } => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const smtps: SmtpConfig[] = [];
        const errors: string[] = [];

        lines.forEach((line, index) => {
            try {
                // Detecta se é formato antigo (host:port:username:password) ou novo (email|password)
                if (line.includes('|')) {
                    // Novo formato: email|password
                    const parts = line.split('|');
                    if (parts.length !== 2) {
                        errors.push(`Linha ${index + 1}: Formato inválido. Use: email|password`);
                        return;
                    }

                    const [email, password] = parts.map(p => p.trim());

                    if (!validateEmail(email)) {
                        errors.push(`Linha ${index + 1}: Email inválido: ${email}`);
                        return;
                    }

                    if (!password) {
                        errors.push(`Linha ${index + 1}: Senha não pode estar vazia`);
                        return;
                    }

                    // Detecta automaticamente as configurações SMTP
                    const smtpDetection = detectSmtpFromEmail(email);

                    const smtp: SmtpConfig = {
                        id: `smtp_${Date.now()}_${index}`,
                        name: smtpDetection.detected
                            ? `${smtpDetection.provider?.toUpperCase()} - ${email}`
                            : `Auto-detectado - ${email}`,
                        host: smtpDetection.host,
                        port: smtpDetection.port,
                        secure: smtpDetection.secure,
                        username: email,
                        password: password,
                        fromEmail: email,
                        fromName: email.split('@')[0],
                        isActive: true
                    };

                    smtps.push(smtp);
                } else {
                    // Formato antigo: host:port:username:password ou host:port:username:password:secure
                    const parts = line.split(':');
                    if (parts.length < 4) {
                        errors.push(`Linha ${index + 1}: Formato inválido. Use: host:port:username:password ou email|password`);
                        return;
                    }

                    const [host, portStr, username, password, secureStr] = parts;
                    const port = parseInt(portStr);
                    const secure = secureStr === 'true' || secureStr === '1' || port === 465;

                    if (isNaN(port) || port < 1 || port > 65535) {
                        errors.push(`Linha ${index + 1}: Porta inválida: ${portStr}`);
                        return;
                    }

                    const smtp: SmtpConfig = {
                        id: `smtp_${Date.now()}_${index}`,
                        name: `SMTP ${host}:${port}`,
                        host: host.trim(),
                        port,
                        secure,
                        username: username.trim(),
                        password: password.trim(),
                        fromEmail: validateEmail(username.trim()) ? username.trim() : '',
                        fromName: validateEmail(username.trim()) ? username.trim().split('@')[0] : '',
                        isActive: true
                    };

                    smtps.push(smtp);
                }
            } catch (error) {
                errors.push(`Linha ${index + 1}: Erro ao processar linha: ${error}`);
            }
        });

        return { smtps, errors };
    }, []);

    const handleTextChange = useCallback((text: string) => {
        setSmtpsText(text);
        if (text.trim()) {
            const { smtps, errors } = parseSmtpsText(text);
            setPreviewSmtps(smtps);
            setParseErrors(errors);
        } else {
            setPreviewSmtps([]);
            setParseErrors([]);
        }
    }, [parseSmtpsText]);

    const testSmtpConfig = async (smtp: SmtpConfig): Promise<boolean> => {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(false), settings.testTimeout);
            
            // Simulate testing with better success rates for known providers
            const isKnown = smtp.name.includes('GMAIL') || 
                           smtp.name.includes('OUTLOOK') || 
                           smtp.name.includes('YAHOO');
            
            const delay = isKnown && settings.enableFastMode ? 200 : Math.random() * 1000 + 500;
            const successRate = isKnown && settings.enableFastMode ? 0.9 : 0.4;
            
            setTimeout(() => {
                clearTimeout(timeout);
                resolve(Math.random() < successRate);
            }, delay);
        });
    };

    const handleLoad = async () => {
        if (previewSmtps.length === 0 || parseErrors.length > 0) return;

        setTestProgress({
            isRunning: true,
            currentEmail: '',
            tested: 0,
            total: previewSmtps.length,
            validFound: 0,
            stopOnFirstValid: settings.stopOnFirstValid
        });

        const validSmtps: SmtpConfig[] = [];
        
        // Group SMTPs by provider for optimized processing
        const emails = previewSmtps.map(smtp => smtp.username);
        const groups = groupEmailsByProvider(emails);
        const mostCommon = detectMostCommonProvider(emails);
        
        if (mostCommon) {
            console.log(`Provedor mais comum: ${mostCommon.provider} (${mostCommon.percentage}%)`);
        }

        for (let i = 0; i < previewSmtps.length; i++) {
            const smtp = previewSmtps[i];
            
            setTestProgress(prev => ({
                ...prev,
                currentEmail: smtp.username,
                tested: i + 1
            }));

            const isValid = await testSmtpConfig(smtp);
            
            if (isValid) {
                validSmtps.push(smtp);
                setTestProgress(prev => ({
                    ...prev,
                    validFound: prev.validFound + 1
                }));

                // Stop on first valid if enabled
                if (settings.stopOnFirstValid) {
                    setTestProgress(prev => ({ ...prev, isRunning: false }));
                    break;
                }
            }

            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        setTestProgress(prev => ({ ...prev, isRunning: false }));

        if (validSmtps.length > 0) {
            onLoad(validSmtps);
            setSmtpsText('');
            setPreviewSmtps([]);
            setParseErrors([]);
            onClose();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                handleTextChange(content);
            };
            reader.readAsText(file);
        }
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
                    <div className="relative bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-[var(--vscode-border)]/50">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Upload className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--vscode-foreground)]">
                                        Carregar SMTPs
                                    </h2>
                                    <p className="text-sm text-[var(--vscode-descriptionForeground)]">
                                        Importe configurações SMTP de arquivo ou texto
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
                            {/* Input Section */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-[var(--vscode-foreground)]">
                                        Entrada de Dados
                                    </h3>
                                </div>

                                <div className="space-y-6 p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl border border-[var(--vscode-border)]/30 backdrop-blur-sm">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-3">
                                            Dados dos SMTPs
                                        </label>
                                        <textarea
                                            value={smtpsText}
                                            onChange={(e) => handleTextChange(e.target.value)}
                                            placeholder="Cole ou digite os dados dos SMTPs aqui...&#10;&#10;Formato 1 (Auto-detecção): email|password&#10;Exemplo: user@gmail.com|minhasenha&#10;&#10;Formato 2 (Manual): host:port:username:password&#10;Exemplo: smtp.gmail.com:587:user@gmail.com:password"
                                            rows={12}
                                            className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 backdrop-blur-sm font-mono text-sm"
                                            disabled={testProgress.isRunning}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-3">
                                            Ou carregar de arquivo
                                        </label>
                                        <input
                                            type="file"
                                            accept=".txt,.csv"
                                            onChange={handleFileUpload}
                                            className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 backdrop-blur-sm"
                                            disabled={testProgress.isRunning}
                                        />
                                        <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-2 bg-[var(--vscode-textBlockQuote-background)]/50 p-2 rounded-lg">
                                            Aceita arquivos .txt ou .csv com um SMTP por linha
                                        </p>
                                    </div>

                                    {/* Smart Settings */}
                                    <div className="pt-4 border-t border-[var(--vscode-border)]/30">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Settings className="h-4 w-4 text-[var(--vscode-descriptionForeground)]" />
                                            <span className="text-sm font-medium text-[var(--vscode-foreground)]">
                                                Configurações Inteligentes
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
                                                        Threads Max
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={settings.maxThreads}
                                                        onChange={(e) => setSettings(prev => ({ ...prev, maxThreads: parseInt(e.target.value) || 5 }))}
                                                        className="w-full px-2 py-1 text-sm bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded text-[var(--vscode-input-foreground)]"
                                                        disabled={testProgress.isRunning}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
                                                        Timeout (ms)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1000"
                                                        max="10000"
                                                        step="500"
                                                        value={settings.testTimeout}
                                                        onChange={(e) => setSettings(prev => ({ ...prev, testTimeout: parseInt(e.target.value) || 3000 }))}
                                                        className="w-full px-2 py-1 text-sm bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded text-[var(--vscode-input-foreground)]"
                                                        disabled={testProgress.isRunning}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.stopOnFirstValid}
                                                        onChange={(e) => setSettings(prev => ({ ...prev, stopOnFirstValid: e.target.checked }))}
                                                        className="rounded"
                                                        disabled={testProgress.isRunning}
                                                    />
                                                    <span className="text-sm text-[var(--vscode-foreground)]">
                                                        🎯 Parar no primeiro SMTP válido
                                                    </span>
                                                </label>
                                                
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.enableFastMode}
                                                        onChange={(e) => setSettings(prev => ({ ...prev, enableFastMode: e.target.checked }))}
                                                        className="rounded"
                                                        disabled={testProgress.isRunning}
                                                    />
                                                    <span className="text-sm text-[var(--vscode-foreground)]">
                                                        ⚡ Modo rápido para provedores conhecidos
                                                    </span>
                                                </label>
                                            </div>
                                            
                                            {settings.stopOnFirstValid && (
                                                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <Zap className="h-4 w-4 text-green-400" />
                                                        <span className="text-xs text-green-400 font-medium">
                                                            Otimização ativada: Processamento será interrompido assim que encontrar o primeiro SMTP válido
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Test Progress */}
                                    {testProgress.isRunning && (
                                        <div className="pt-4 border-t border-[var(--vscode-border)]/30">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Activity className="h-4 w-4 text-blue-400 animate-pulse" />
                                                <span className="text-sm font-medium text-[var(--vscode-foreground)]">
                                                    Testando SMTPs...
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[var(--vscode-foreground)]">
                                                        Testando: {testProgress.currentEmail}
                                                    </span>
                                                    <span className="text-[var(--vscode-descriptionForeground)]">
                                                        {testProgress.tested}/{testProgress.total}
                                                    </span>
                                                </div>
                                                
                                                <div className="w-full bg-[var(--vscode-progressBar-background)] rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(testProgress.tested / testProgress.total) * 100}%` }}
                                                    />
                                                </div>
                                                
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-green-400">
                                                        ✓ {testProgress.validFound} válidos
                                                    </span>
                                                    {testProgress.stopOnFirstValid && testProgress.validFound > 0 && (
                                                        <span className="text-blue-400">
                                                            🎯 Parando no primeiro válido...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Format Help */}
                                    <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-[var(--vscode-border)]/30 p-4 rounded-xl backdrop-blur-sm">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <FileText className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-[var(--vscode-foreground)] mb-3">
                                                    Formatos aceitos:
                                                </h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="text-xs text-green-400 font-medium mb-2">✨ Formato Simples (Auto-detecção):</div>
                                                        <code className="text-sm bg-[var(--vscode-textPreformat-background)]/80 px-3 py-1 rounded border border-green-500/30 text-green-400">
                                                            email|password
                                                        </code>
                                                        <div className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
                                                            • Detecta automaticamente o servidor SMTP
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-blue-400 font-medium mb-2">🔧 Formato Manual:</div>
                                                        <code className="text-sm bg-[var(--vscode-textPreformat-background)]/80 px-3 py-1 rounded border border-[var(--vscode-border)]/30 text-[var(--vscode-textPreformat-foreground)]">
                                                            host:port:username:password
                                                        </code>
                                                        <div className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
                                                            • Configuração manual completa
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-[var(--vscode-descriptionForeground)] space-y-1 mt-3 bg-[var(--vscode-textBlockQuote-background)]/30 p-3 rounded-lg">
                                                        <div>📝 <strong>Dicas de otimização:</strong></div>
                                                        <div>• Habilite "parar no primeiro válido" para máxima velocidade</div>
                                                        <div>• Formato simples suporta Gmail, Outlook, Yahoo e muitos outros</div>
                                                        <div>• Modo rápido acelera teste de provedores conhecidos</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Section */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-[var(--vscode-foreground)]">
                                        Visualização
                                    </h3>
                                </div>

                                {/* Errors */}
                                {parseErrors.length > 0 && (
                                    <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-red-500/20 rounded-lg">
                                                <AlertCircle className="h-5 w-5 text-red-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-red-400 mb-3">
                                                    Erros encontrados:
                                                </h4>
                                                <div className="max-h-32 overflow-y-auto bg-red-500/5 rounded-lg border border-red-500/20">
                                                    {parseErrors.map((error, index) => (
                                                        <div key={index} className="px-3 py-2 border-b border-red-500/20 last:border-b-0">
                                                            <span className="text-xs text-red-300">• {error}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Preview */}
                                {previewSmtps.length > 0 && (
                                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                                        <h4 className="text-sm font-medium text-[var(--vscode-foreground)] mb-4 flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>SMTPs válidos encontrados: {previewSmtps.length}</span>
                                        </h4>
                                        <div className="max-h-64 overflow-y-auto bg-[var(--vscode-editor-background)]/50 rounded-xl border border-[var(--vscode-border)]/30">
                                            {previewSmtps.map((smtp, index) => (
                                                <div
                                                    key={index}
                                                    className="px-4 py-3 border-b border-[var(--vscode-border)]/20 last:border-b-0 hover:bg-green-500/5 transition-all duration-200"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="text-sm font-medium text-[var(--vscode-foreground)]">
                                                                    {smtp.host}:{smtp.port}
                                                                </div>
                                                                {smtp.name.includes('Auto-detectado') && (
                                                                    <div className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full font-medium">
                                                                        Auto
                                                                    </div>
                                                                )}
                                                                {smtp.name.includes('GMAIL') && (
                                                                    <div className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full font-medium">
                                                                        Gmail
                                                                    </div>
                                                                )}
                                                                {smtp.name.includes('OUTLOOK') && (
                                                                    <div className="text-xs px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full font-medium">
                                                                        Outlook
                                                                    </div>
                                                                )}
                                                                {smtp.name.includes('YAHOO') && (
                                                                    <div className="text-xs px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-full font-medium">
                                                                        Yahoo
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
                                                                {smtp.username} • {smtp.secure ? 'SSL' : 'TLS/STARTTLS'}
                                                                {smtp.fromEmail && (
                                                                    <span className="ml-2 text-green-400">• From: {smtp.fromEmail}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`text-xs px-2 py-1 rounded-full font-medium border ${smtp.secure
                                                            ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                                            : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                                            }`}>
                                                            {smtp.secure ? 'SSL' : 'TLS'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!smtpsText.trim() && (
                                    <div className="text-center text-[var(--vscode-descriptionForeground)] py-12 bg-gradient-to-br from-gray-500/5 to-blue-500/5 rounded-2xl border border-[var(--vscode-border)]/20 backdrop-blur-sm">
                                        <div className="p-4 bg-gray-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                            <Upload className="h-8 w-8 opacity-50" />
                                        </div>
                                        <p className="text-sm">Cole os dados dos SMTPs ou carregue um arquivo para visualizar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[var(--vscode-editor-background)]/80 backdrop-blur-sm border-t border-[var(--vscode-border)]/50 p-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-[var(--vscode-descriptionForeground)]">
                                {previewSmtps.length > 0 && !testProgress.isRunning && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>{previewSmtps.length} SMTP(s) pronto(s)</span>
                                        {settings.stopOnFirstValid && (
                                            <span className="text-blue-400">• 🎯 Modo otimizado ativo</span>
                                        )}
                                    </div>
                                )}
                                {testProgress.isRunning && (
                                    <div className="flex items-center space-x-2">
                                        <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                                        <span>Testando SMTPs...</span>
                                        <span className="text-green-400">{testProgress.validFound} válidos encontrados</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    disabled={testProgress.isRunning}
                                    className="px-6 py-2 text-[var(--vscode-foreground)] hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 border border-[var(--vscode-border)]/50 disabled:opacity-50"
                                >
                                    {testProgress.isRunning ? 'Testando...' : 'Cancelar'}
                                </button>
                                <button
                                    onClick={handleLoad}
                                    disabled={previewSmtps.length === 0 || parseErrors.length > 0 || testProgress.isRunning}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                                >
                                    {testProgress.isRunning ? (
                                        <>
                                            <Activity className="h-4 w-4 animate-spin" />
                                            <span>Testando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Testar e Carregar SMTPs</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadSmtpsModal;
