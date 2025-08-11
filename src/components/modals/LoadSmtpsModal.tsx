import { AlertCircle, FileText, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import type { SmtpConfig } from '../../types';

interface LoadSmtpsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (smtps: SmtpConfig[]) => void;
}

const LoadSmtpsModal: React.FC<LoadSmtpsModalProps> = ({ isOpen, onClose, onLoad }) => {
    const [smtpsText, setSmtpsText] = useState('');
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [previewSmtps, setPreviewSmtps] = useState<SmtpConfig[]>([]);

    const parseSmtpsText = (text: string): { smtps: SmtpConfig[]; errors: string[] } => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const smtps: SmtpConfig[] = [];
        const errors: string[] = [];

        lines.forEach((line, index) => {
            try {
                // Format: host:port:username:password or host:port:username:password:secure
                const parts = line.split(':');
                if (parts.length < 4) {
                    errors.push(`Linha ${index + 1}: Formato inválido. Use: host:port:username:password`);
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
                    isActive: true
                };

                smtps.push(smtp);
            } catch (error) {
                errors.push(`Linha ${index + 1}: Erro ao processar linha: ${error}`);
            }
        });

        return { smtps, errors };
    };

    const handleTextChange = (text: string) => {
        setSmtpsText(text);
        if (text.trim()) {
            const { smtps, errors } = parseSmtpsText(text);
            setPreviewSmtps(smtps);
            setParseErrors(errors);
        } else {
            setPreviewSmtps([]);
            setParseErrors([]);
        }
    };

    const handleLoad = () => {
        if (previewSmtps.length > 0 && parseErrors.length === 0) {
            onLoad(previewSmtps);
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
                                            placeholder="Cole ou digite os dados dos SMTPs aqui...&#10;&#10;Formato: host:port:username:password&#10;Exemplo:&#10;smtp.gmail.com:587:user@gmail.com:password&#10;mail.exemplo.com:465:admin:senha123"
                                            rows={12}
                                            className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 backdrop-blur-sm font-mono text-sm"
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
                                        />
                                        <p className="text-xs text-[var(--vscode-descriptionForeground)] mt-2 bg-[var(--vscode-textBlockQuote-background)]/50 p-2 rounded-lg">
                                            Aceita arquivos .txt ou .csv com um SMTP por linha
                                        </p>
                                    </div>

                                    {/* Format Help */}
                                    <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-[var(--vscode-border)]/30 p-4 rounded-xl backdrop-blur-sm">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <FileText className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-[var(--vscode-foreground)] mb-2">
                                                    Formato esperado:
                                                </h4>
                                                <div className="space-y-2">
                                                    <code className="text-sm bg-[var(--vscode-textPreformat-background)]/80 px-3 py-1 rounded border border-[var(--vscode-border)]/30 text-[var(--vscode-textPreformat-foreground)]">
                                                        host:port:username:password
                                                    </code>
                                                    <div className="text-xs text-[var(--vscode-descriptionForeground)] space-y-1 mt-2">
                                                        <div>• Um SMTP por linha</div>
                                                        <div>• Porta 465 = SSL automático</div>
                                                        <div>• Outras portas = TLS/STARTTLS</div>
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
                                                        <div>
                                                            <div className="text-sm font-medium text-[var(--vscode-foreground)]">
                                                                {smtp.host}:{smtp.port}
                                                            </div>
                                                            <div className="text-xs text-[var(--vscode-descriptionForeground)]">
                                                                {smtp.username} • {smtp.secure ? 'SSL' : 'TLS/STARTTLS'}
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
                                {previewSmtps.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>{previewSmtps.length} SMTP(s) pronto(s) para carregar</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 text-[var(--vscode-foreground)] hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 border border-[var(--vscode-border)]/50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleLoad}
                                    disabled={previewSmtps.length === 0 || parseErrors.length > 0}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    Carregar SMTPs
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
