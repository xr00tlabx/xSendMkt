import { Activity, BarChart3, Clock, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { EmailSenderState } from '../../hooks/useEmailSender';

interface RealTimeStatsProps {
    state: EmailSenderState;
}

const RealTimeStats: React.FC<RealTimeStatsProps> = ({ state }) => {
    const [sessionStats, setSessionStats] = useState({
        startTime: null as Date | null,
        peakSpeed: 0,
        averageSpeed: 0,
        totalTimeSending: 0
    });

    // Atualizar estatísticas da sessão
    useEffect(() => {
        if (state.isActive && !sessionStats.startTime) {
            setSessionStats(prev => ({
                ...prev,
                startTime: new Date()
            }));
        }

        if (!state.isActive && sessionStats.startTime) {
            setSessionStats(prev => ({
                ...prev,
                startTime: null
            }));
        }
    }, [state.isActive, sessionStats.startTime]);

    // Atualizar velocidades
    useEffect(() => {
        if (state.isActive && state.emailsPerSecond > 0) {
            setSessionStats(prev => ({
                ...prev,
                peakSpeed: Math.max(prev.peakSpeed, state.emailsPerSecond),
                averageSpeed: prev.averageSpeed === 0
                    ? state.emailsPerSecond
                    : (prev.averageSpeed + state.emailsPerSecond) / 2
            }));
        }
    }, [state.emailsPerSecond, state.isActive]);

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    const getSessionDuration = (): string => {
        if (!sessionStats.startTime) return '0s';
        const duration = (Date.now() - sessionStats.startTime.getTime()) / 1000;
        return formatDuration(duration);
    };

    const getSuccessRate = (): number => {
        const total = state.sentEmails + state.failedEmails;
        if (total === 0) return 0;
        return (state.sentEmails / total) * 100;
    };

    const getEfficiency = (): number => {
        if (state.sendingSpeed === 0) return 0;
        return (state.emailsPerSecond / state.sendingSpeed) * 100;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">Estatísticas em Tempo Real</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Taxa de Sucesso */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {getSuccessRate().toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-700">Taxa de Sucesso</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {state.sentEmails}/{state.sentEmails + state.failedEmails}
                    </div>
                </div>

                {/* Velocidade Pico */}
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                        {sessionStats.peakSpeed.toFixed(1)}
                    </div>
                    <div className="text-sm text-orange-700">Pico (emails/s)</div>
                    <div className="text-xs text-gray-500 mt-1">
                        <TrendingUp className="w-3 h-3 inline" /> Máximo atingido
                    </div>
                </div>

                {/* Eficiência */}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                        {getEfficiency().toFixed(0)}%
                    </div>
                    <div className="text-sm text-blue-700">Eficiência</div>
                    <div className="text-xs text-gray-500 mt-1">
                        <Activity className="w-3 h-3 inline" /> Atual vs. Alvo
                    </div>
                </div>

                {/* Tempo da Sessão */}
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                        {getSessionDuration()}
                    </div>
                    <div className="text-sm text-purple-700">Tempo Ativo</div>
                    <div className="text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 inline" /> Sessão atual
                    </div>
                </div>
            </div>

            {/* Barra de progresso adicional para eficiência */}
            {state.isActive && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Eficiência do Sistema</span>
                        <span className="text-sm text-gray-600">{getEfficiency().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getEfficiency() >= 80 ? 'bg-green-500' :
                                    getEfficiency() >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(100, getEfficiency())}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {getEfficiency() >= 80 ? '✅ Excelente performance' :
                            getEfficiency() >= 60 ? '⚠️ Performance moderada' :
                                '❌ Performance baixa - verifique SMTPs'}
                    </div>
                </div>
            )}

            {/* Estimativa de conclusão */}
            {state.isActive && state.estimatedTimeRemaining > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                        Previsão de Conclusão
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                        {formatDuration(state.estimatedTimeRemaining)}
                    </div>
                    <div className="text-xs text-gray-500">
                        Aproximadamente às {new Date(Date.now() + state.estimatedTimeRemaining * 1000).toLocaleTimeString()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeStats;
