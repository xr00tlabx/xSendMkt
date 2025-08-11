import { BarChart3, Clock, Mail, TrendingUp } from 'lucide-react';
import React from 'react';

const StatisticsPage: React.FC = () => {
    // Mock statistics data
    const stats = {
        totalCampaigns: 12,
        totalEmailsSent: 2548,
        successRate: 96.5,
        averageOpenRate: 24.3,
        recentCampaigns: [
            { name: 'Summer Sale 2024', sent: 1200, delivered: 1180, opened: 295, date: '2024-08-10' },
            { name: 'Product Launch', sent: 800, delivered: 785, opened: 180, date: '2024-08-08' },
            { name: 'Newsletter #15', sent: 450, delivered: 442, opened: 98, date: '2024-08-05' },
        ]
    };

    return (
        <div className="flex-1 p-6">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-[var(--vscode-text)]">Statistics</h1>
                <p className="text-sm text-[var(--vscode-textSecondary)] mt-1">Track your email campaign performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-[var(--vscode-activityBar-background)] rounded-lg border border-[var(--vscode-border)]">
                            <Mail className="h-6 w-6 text-[var(--vscode-symbolIcon-moduleDefault)]" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-[var(--vscode-textSecondary)]">Total Campaigns</p>
                            <p className="text-2xl font-bold text-[var(--vscode-text)]">{stats.totalCampaigns}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-[var(--vscode-activityBar-background)] rounded-lg border border-[var(--vscode-border)]">
                            <TrendingUp className="h-6 w-6 text-[var(--vscode-symbolIcon-stringDefault)]" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-[var(--vscode-textSecondary)]">Emails Sent</p>
                            <p className="text-2xl font-bold text-[var(--vscode-text)]">{stats.totalEmailsSent.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-[var(--vscode-activityBar-background)] rounded-lg border border-[var(--vscode-border)]">
                            <BarChart3 className="h-6 w-6 text-[var(--vscode-symbolIcon-numberDefault)]" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-[var(--vscode-textSecondary)]">Success Rate</p>
                            <p className="text-2xl font-bold text-[var(--vscode-text)]">{stats.successRate}%</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-[var(--vscode-activityBar-background)] rounded-lg border border-[var(--vscode-border)]">
                            <Clock className="h-6 w-6 text-[var(--vscode-symbolIcon-functionDefault)]" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-[var(--vscode-textSecondary)]">Avg. Open Rate</p>
                            <p className="text-2xl font-bold text-[var(--vscode-text)]">{stats.averageOpenRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Campaigns Table */}
            <div className="card">
                <div className="p-6 border-b border-[var(--vscode-border)]">
                    <h2 className="text-lg font-semibold text-[var(--vscode-text)]">Recent Campaigns</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--vscode-border)]">
                        <thead className="bg-[var(--vscode-activityBar-background)]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--vscode-textSecondary)] uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--vscode-textSecondary)] uppercase tracking-wider">
                                    Sent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--vscode-textSecondary)] uppercase tracking-wider">
                                    Delivered
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--vscode-textSecondary)] uppercase tracking-wider">
                                    Opened
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--vscode-textSecondary)] uppercase tracking-wider">
                                    Open Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--vscode-textSecondary)] uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-[var(--vscode-surface)] divide-y divide-[var(--vscode-border)]">
                            {stats.recentCampaigns.map((campaign, index) => {
                                const openRate = ((campaign.opened / campaign.delivered) * 100).toFixed(1);
                                const deliveryRate = ((campaign.delivered / campaign.sent) * 100).toFixed(1);

                                return (
                                    <tr key={index} className="hover:bg-[var(--vscode-hover)]">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-[var(--vscode-text)]">{campaign.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[var(--vscode-text)]">{campaign.sent.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[var(--vscode-text)]">{campaign.delivered.toLocaleString()}</div>
                                            <div className="text-xs text-[var(--vscode-textSecondary)]">{deliveryRate}% delivery</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[var(--vscode-text)]">{campaign.opened.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${parseFloat(openRate) > 25 ? 'bg-[var(--vscode-symbolIcon-stringDefault)] text-white' :
                                                parseFloat(openRate) > 15 ? 'bg-[var(--vscode-symbolIcon-functionDefault)] text-white' :
                                                    'bg-[var(--vscode-symbolIcon-operatorDefault)] text-white'
                                                }`}>
                                                {openRate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--vscode-textSecondary)]">
                                            {new Date(campaign.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
