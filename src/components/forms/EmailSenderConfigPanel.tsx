import { Settings, Zap } from 'lucide-react';
import React from 'react';
import type { EmailSenderConfig } from '../../hooks/useEmailSender';

interface EmailSenderConfigPanelProps {
    config: EmailSenderConfig;
    onConfigChange: (config: EmailSenderConfig) => void;
    disabled?: boolean;
}

const EmailSenderConfigPanel: React.FC<EmailSenderConfigPanelProps> = ({
    config,
    onConfigChange,
    disabled = false
}) => {
    const handleSpeedChange = (speed: number) => {
        onConfigChange({
            ...config,
            sendingSpeed: Math.max(0.1, Math.min(10, speed)) // Limit between 0.1 and 10 emails/sec
        });
    };

    const handleRetryToggle = (retryFailedEmails: boolean) => {
        onConfigChange({
            ...config,
            retryFailedEmails
        });
    };

    const handleMaxRetriesChange = (maxRetries: number) => {
        onConfigChange({
            ...config,
            maxRetries: Math.max(1, Math.min(10, maxRetries))
        });
    };

    const handleRotationModeChange = (smtpRotationMode: 'round-robin' | 'least-used' | 'random') => {
        onConfigChange({
            ...config,
            smtpRotationMode
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Configurações de Envio</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Velocidade de Envio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Zap className="w-4 h-4 inline mr-1" />
                        Velocidade de Envio
                    </label>
                    <div className="space-y-2">
                        <input
                            type="range"
                            min="0.1"
                            max="10"
                            step="0.1"
                            value={config.sendingSpeed}
                            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                            disabled={disabled}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0.1/s</span>
                            <span className="font-medium">
                                {config.sendingSpeed} emails/seg
                            </span>
                            <span>10/s</span>
                        </div>
                        <div className="text-xs text-gray-600">
                            Aproximadamente {Math.round(config.sendingSpeed * 60)} emails por minuto
                        </div>
                    </div>
                </div>

                {/* Modo de Rotação SMTP */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rotação de SMTP
                    </label>
                    <select
                        value={config.smtpRotationMode}
                        onChange={(e) => handleRotationModeChange(e.target.value as any)}
                        disabled={disabled}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="least-used">Menos Usado</option>
                        <option value="round-robin">Round Robin</option>
                        <option value="random">Aleatório</option>
                    </select>
                    <div className="text-xs text-gray-600 mt-1">
                        {config.smtpRotationMode === 'least-used' && 'Usa o SMTP que foi menos utilizado'}
                        {config.smtpRotationMode === 'round-robin' && 'Usa os SMTPs em sequência'}
                        {config.smtpRotationMode === 'random' && 'Escolhe aleatoriamente entre os SMTPs ativos'}
                    </div>
                </div>

                {/* Retry Failed Emails */}
                <div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.retryFailedEmails}
                            onChange={(e) => handleRetryToggle(e.target.checked)}
                            disabled={disabled}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Tentar reenviar emails que falharam
                        </span>
                    </label>
                    <div className="text-xs text-gray-600 ml-6">
                        Emails que falharam serão tentados novamente
                    </div>
                </div>

                {/* Max Retries */}
                {config.retryFailedEmails && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Máximo de Tentativas
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={config.maxRetries}
                            onChange={(e) => handleMaxRetriesChange(parseInt(e.target.value) || 1)}
                            disabled={disabled}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                            Quantas vezes tentar reenviar um email que falhou
                        </div>
                    </div>
                )}
            </div>

            {/* Presets */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Presets Rápidos:</h5>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onConfigChange({
                            sendingSpeed: 0.5,
                            retryFailedEmails: true,
                            maxRetries: 3,
                            smtpRotationMode: 'least-used'
                        })}
                        disabled={disabled}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Conservador (0.5/s)
                    </button>
                    <button
                        onClick={() => onConfigChange({
                            sendingSpeed: 1,
                            retryFailedEmails: true,
                            maxRetries: 2,
                            smtpRotationMode: 'least-used'
                        })}
                        disabled={disabled}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Padrão (1/s)
                    </button>
                    <button
                        onClick={() => onConfigChange({
                            sendingSpeed: 3,
                            retryFailedEmails: false,
                            maxRetries: 1,
                            smtpRotationMode: 'round-robin'
                        })}
                        disabled={disabled}
                        className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Rápido (3/s)
                    </button>
                    <button
                        onClick={() => onConfigChange({
                            sendingSpeed: 5,
                            retryFailedEmails: false,
                            maxRetries: 1,
                            smtpRotationMode: 'random'
                        })}
                        disabled={disabled}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Máximo (5/s)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailSenderConfigPanel;
