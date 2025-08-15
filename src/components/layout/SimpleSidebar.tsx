import React from 'react';
import { 
    List, 
    Server,
    CheckCircle,
    AlertCircle,
    Clock,
    Mail
} from 'lucide-react';
import type { EmailList, SmtpConfig } from '../../types';

interface SimpleSidebarProps {
    lists: EmailList[];
    smtpConfigs: SmtpConfig[];
    loading?: boolean;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
    lists,
    smtpConfigs,
    loading = false
}) => {
    const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive);
    const standbySmtps = smtpConfigs.filter(smtp => smtp.status === 'standby');
    const totalEmails = lists.reduce((total, list) => total + list.emails.length, 0);

    if (loading) {
        return (
            <div className="w-64 bg-white border-r border-gray-200 p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    xSendMkt
                </h2>
            </div>

            {/* Stats Overview */}
            <div className="p-4 space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Listas</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{lists.length}</span>
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                        {totalEmails.toLocaleString()} emails total
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">SMTPs Ativos</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">{activeSmtps.length}</span>
                    </div>
                </div>

                {standbySmtps.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-900">Em Standby</span>
                            </div>
                            <span className="text-lg font-bold text-yellow-600">{standbySmtps.length}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Lists View */}
            <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Listas Disponíveis</h3>
                
                {lists.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma lista</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {lists.slice(0, 10).map((list) => ( // Mostrar apenas 10 primeiras
                            <div key={list.id} className="p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {list.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {list.emails.length.toLocaleString()} emails
                                </div>
                            </div>
                        ))}
                        
                        {lists.length > 10 && (
                            <div className="text-xs text-gray-500 text-center py-2">
                                +{lists.length - 10} listas adicionais
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick SMTP Status */}
            <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Status SMTP</h3>
                
                {smtpConfigs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        <Server className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">Nenhum SMTP</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {smtpConfigs.slice(0, 5).map((smtp) => ( // Mostrar apenas 5 primeiros
                            <div key={smtp.id} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    smtp.isActive && smtp.status !== 'standby' 
                                        ? 'bg-green-500' 
                                        : smtp.status === 'standby'
                                        ? 'bg-yellow-500'
                                        : 'bg-gray-300'
                                }`} />
                                <span className="text-xs text-gray-600 truncate flex-1">
                                    {smtp.name}
                                </span>
                                {smtp.status === 'standby' && (
                                    <Clock className="w-3 h-3 text-yellow-500" />
                                )}
                            </div>
                        ))}
                        
                        {smtpConfigs.length > 5 && (
                            <div className="text-xs text-gray-500 text-center">
                                +{smtpConfigs.length - 5} SMTPs
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleSidebar;
