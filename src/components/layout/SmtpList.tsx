import { AlertCircle, CheckCircle, Server } from 'lucide-react';
import React from 'react';
import type { SmtpConfig } from '../../types';

interface SmtpListProps {
    configs: SmtpConfig[];
    loading?: boolean;
    onEdit?: (config: SmtpConfig) => void;
    onToggleActive?: (id: string, active: boolean) => void;
}

const SmtpList: React.FC<SmtpListProps> = ({
    configs,
    loading = false,
    onEdit,
    onToggleActive
}) => {
    const activeConfigs = configs.filter(config => config.isActive);

    return (
        <div className="card">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Server className="h-5 w-5 text-gray-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">SMTP Servers</h2>
                    </div>
                    <div className="text-sm text-gray-600">
                        {activeConfigs.length} of {configs.length} active
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    Emails will be sent using a random active SMTP server
                </p>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                ) : configs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Server className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No SMTP servers configured</p>
                        <p className="text-xs mt-1">Add your first SMTP server to start sending emails</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {configs.map(config => (
                            <div
                                key={config.id}
                                className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${config.isActive
                                        ? 'border-green-200 bg-green-50 hover:border-green-300'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}
                                onClick={() => onEdit?.(config)}
                            >
                                {/* Status indicator */}
                                <div className="absolute top-3 right-3">
                                    {config.isActive ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>

                                {/* SMTP Info */}
                                <div className="pr-8">
                                    <h3 className="font-medium text-gray-900 mb-2">{config.name}</h3>

                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex">
                                            <span className="w-12 font-medium">Host:</span>
                                            <span className="truncate">{config.host}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-12 font-medium">Port:</span>
                                            <span>{config.port}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-12 font-medium">User:</span>
                                            <span className="truncate">{config.username}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-12 font-medium">Secure:</span>
                                            <span>{config.secure ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="mt-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {config.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                {/* Toggle button */}
                                {onToggleActive && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleActive(config.id, !config.isActive);
                                        }}
                                        className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded transition-colors ${config.isActive
                                                ? 'text-red-600 hover:bg-red-100'
                                                : 'text-green-600 hover:bg-green-100'
                                            }`}
                                    >
                                        {config.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmtpList;
