import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Server,
    Zap
} from 'lucide-react';
import React from 'react';
import type { SmtpConfig } from '../../types';

interface SmtpStatusPanelProps {
    smtpConfigs: SmtpConfig[];
}

const SmtpStatusPanel: React.FC<SmtpStatusPanelProps> = ({ smtpConfigs }) => {
    const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive && smtp.status !== 'standby');
    const standbySmtps = smtpConfigs.filter(smtp => smtp.status === 'standby');
    const failedSmtps = smtpConfigs.filter(smtp => smtp.status === 'failed');
    const inactiveSmtps = smtpConfigs.filter(smtp => !smtp.isActive);

    const getStatusIcon = (smtp: SmtpConfig) => {
        if (!smtp.isActive) return <Server className="w-4 h-4 text-gray-500" />;
        if (smtp.status === 'standby') return <Clock className="w-4 h-4 text-yellow-500" />;
        if (smtp.status === 'failed') return <AlertTriangle className="w-4 h-4 text-red-500" />;
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    };

    const formatTimeRemaining = (standbyUntil?: Date): string => {
        if (!standbyUntil) return '';
        const now = new Date();
        const diff = standbyUntil.getTime() - now.getTime();
        if (diff <= 0) return 'Pronto';

        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Status dos SMTPs</h4>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{activeSmtps.length}</div>
                    <div className="text-xs text-green-700">Ativos</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{standbySmtps.length}</div>
                    <div className="text-xs text-yellow-700">Standby</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{failedSmtps.length}</div>
                    <div className="text-xs text-red-700">Falharam</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-600">{inactiveSmtps.length}</div>
                    <div className="text-xs text-gray-700">Inativos</div>
                </div>
            </div>

            {/* Lista detalhada */}
            <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Detalhamento:</h5>
                <div className="max-h-40 overflow-y-auto space-y-1">
                    {smtpConfigs.map((smtp) => (
                        <div
                            key={smtp.id}
                            className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getStatusIcon(smtp)}
                                <span className="text-sm font-medium truncate">
                                    {smtp.name}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                    ({smtp.username})
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                {smtp.failureCount && smtp.failureCount > 0 && (
                                    <span className="text-red-600">
                                        {smtp.failureCount} falhas
                                    </span>
                                )}

                                {smtp.status === 'standby' && smtp.standbyUntil && (
                                    <span className="text-yellow-600">
                                        {formatTimeRemaining(smtp.standbyUntil)}
                                    </span>
                                )}

                                {smtp.lastUsed && (
                                    <span className="text-gray-500">
                                        {smtp.lastUsed.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {smtpConfigs.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum SMTP configurado</p>
                </div>
            )}
        </div>
    );
};

export default SmtpStatusPanel;
