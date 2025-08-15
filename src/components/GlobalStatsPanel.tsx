import { BarChart3, CheckCircle, List, Mail, TrendingUp } from 'lucide-react';
import React from 'react';

interface GlobalStatsProps {
    globalStats: {
        totalLists: number;
        completedLists: number;
        totalEmails: number;
        totalSent: number;
        totalFailed: number;
    };
    currentList?: {
        id: string;
        name: string;
        progress: number;
        sent: number;
        failed: number;
        total: number;
    };
    isActive: boolean;
}

export const GlobalStatsPanel: React.FC<GlobalStatsProps> = ({
    globalStats,
    currentList,
    isActive
}) => {
    const globalProgress = globalStats.totalEmails > 0
        ? ((globalStats.totalSent + globalStats.totalFailed) / globalStats.totalEmails) * 100
        : 0;

    const listProgress = globalStats.totalLists > 0
        ? (globalStats.completedLists / globalStats.totalLists) * 100
        : 0;

    const successRate = (globalStats.totalSent + globalStats.totalFailed) > 0
        ? (globalStats.totalSent / (globalStats.totalSent + globalStats.totalFailed)) * 100
        : 0;

    return (
        <div className="bg-[#2d2d30] p-4 rounded-lg border border-[#3e3e42]">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-sm text-gray-200">Estatísticas Globais</h3>
                {isActive && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
                )}
            </div>

            {/* Current List Progress */}
            {currentList && (
                <div className="mb-4 p-3 bg-[#1e1e1e] rounded border border-[#3e3e42]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-300 font-medium truncate">
                            Lista Atual: {currentList.name}
                        </span>
                        <span className="text-xs text-gray-400">
                            {currentList.progress.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-[#3c3c3c] rounded-full h-1.5 mb-2">
                        <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${currentList.progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>{currentList.sent + currentList.failed}/{currentList.total}</span>
                        <span>{currentList.sent}✓ {currentList.failed}✗</span>
                    </div>
                </div>
            )}

            {/* Global Progress Bars */}
            <div className="space-y-3">
                {/* Overall Email Progress */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-gray-300">Emails Processados</span>
                        </div>
                        <span className="text-xs text-gray-400">{globalProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#3c3c3c] rounded-full h-1.5">
                        <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{globalStats.totalSent + globalStats.totalFailed}</span>
                        <span>{globalStats.totalEmails}</span>
                    </div>
                </div>

                {/* Lists Progress */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <List className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-gray-300">Listas Concluídas</span>
                        </div>
                        <span className="text-xs text-gray-400">{listProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#3c3c3c] rounded-full h-1.5">
                        <div
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${listProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{globalStats.completedLists}</span>
                        <span>{globalStats.totalLists}</span>
                    </div>
                </div>

                {/* Success Rate */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-gray-300">Taxa de Sucesso</span>
                        </div>
                        <span className="text-xs text-gray-400">{successRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#3c3c3c] rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${successRate >= 90 ? 'bg-green-500' :
                                    successRate >= 70 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`}
                            style={{ width: `${successRate}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{globalStats.totalSent}✓</span>
                        <span>{globalStats.totalFailed}✗</span>
                    </div>
                </div>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-green-900/20 border border-green-700/30 p-2 rounded text-center">
                    <div className="font-bold text-green-400">{globalStats.totalSent}</div>
                    <div className="text-green-300">Enviados</div>
                </div>
                <div className="bg-red-900/20 border border-red-700/30 p-2 rounded text-center">
                    <div className="font-bold text-red-400">{globalStats.totalFailed}</div>
                    <div className="text-red-300">Falharam</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-700/30 p-2 rounded text-center">
                    <div className="font-bold text-blue-400">{globalStats.completedLists}</div>
                    <div className="text-blue-300">Listas OK</div>
                </div>
                <div className="bg-purple-900/20 border border-purple-700/30 p-2 rounded text-center">
                    <div className="font-bold text-purple-400">{globalStats.totalLists - globalStats.completedLists}</div>
                    <div className="text-purple-300">Pendentes</div>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-4 pt-3 border-t border-[#3e3e42]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isActive ? (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-400 font-medium">PROCESSANDO</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                <span className="text-xs text-gray-400 font-medium">INATIVO</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                            {globalStats.completedLists}/{globalStats.totalLists}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalStatsPanel;
