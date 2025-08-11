import React, { useEffect, useRef, useState } from 'react';
import CampaignForm from '../components/forms/CampaignForm';
import Sidebar from '../components/layout/Sidebar';
import { useCampaigns, useEmailLists, useSmtpConfigs } from '../hooks';
import type { EmailCampaign } from '../types';

const HomePage: React.FC = () => {
    const { lists, loading: listsLoading } = useEmailLists();
    const { configs, loading: smtpLoading, updateConfig } = useSmtpConfigs();
    const { campaigns, loading: campaignsLoading, createCampaign, updateCampaign, sendCampaign, pauseCampaign } = useCampaigns();

    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Load the latest draft campaign on mount
    useEffect(() => {
        const draftCampaign = campaigns.find(c => c.status === 'draft');
        if (draftCampaign) {
            setCurrentCampaign(draftCampaign);
            setSelectedLists(draftCampaign.selectedLists);
        }
    }, [campaigns]);

    // Handle resize functionality
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const newWidth = e.clientX;
            if (newWidth >= 100 && newWidth <= 500) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    const totalEmails = lists
        .filter(list => selectedLists.includes(list.id))
        .reduce((total, list) => total + list.emails.length, 0);

    const handleListToggle = (listId: string) => {
        setSelectedLists(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    };

    const handleSaveCampaign = async (data: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (currentCampaign?.id) {
                const updated = await updateCampaign(currentCampaign.id, data);
                setCurrentCampaign(updated);
            } else {
                const created = await createCampaign(data);
                setCurrentCampaign(created);
            }
        } catch (error) {
            console.error('Failed to save campaign:', error);
        }
    };

    const handleSendCampaign = async (id: string) => {
        try {
            const updated = await sendCampaign(id);
            setCurrentCampaign(updated);
        } catch (error) {
            console.error('Failed to send campaign:', error);
        }
    };

    const handlePauseCampaign = async (id: string) => {
        try {
            const updated = await pauseCampaign(id);
            setCurrentCampaign(updated);
        } catch (error) {
            console.error('Failed to pause campaign:', error);
        }
    };

    const handleSmtpToggle = async (id: string, active: boolean) => {
        try {
            await updateConfig(id, { isActive: active });
        } catch (error) {
            console.error('Failed to update SMTP config:', error);
        }
    };

    const handleResizeStart = () => {
        setIsResizing(true);
    };

    const loading = listsLoading || smtpLoading || campaignsLoading;

    return (
        <div className="flex h-full w-full min-h-0 min-w-0 overflow-hidden">
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                style={{ width: `${sidebarWidth}px` }}
                className="flex-shrink-0 overflow-hidden"
            >
                <Sidebar
                    lists={lists}
                    selectedLists={selectedLists}
                    onListToggle={handleListToggle}
                    smtpConfigs={configs}
                    onSmtpToggle={handleSmtpToggle}
                    loading={listsLoading}
                />
            </div>

            {/* Resize Handle */}
            <div
                className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors duration-200"
                style={{ backgroundColor: isResizing ? 'var(--vscode-focusBorder)' : 'var(--vscode-border)' }}
                onMouseDown={handleResizeStart}
            />

            {/* Main Campaign Editor */}
            <div className="flex-1 overflow-hidden min-w-0 min-h-0">
                <CampaignForm
                    campaign={currentCampaign || undefined}
                    onSave={handleSaveCampaign}
                    onSend={handleSendCampaign}
                    onPause={handlePauseCampaign}
                    loading={loading}
                    selectedLists={selectedLists}
                    totalEmails={totalEmails}
                />
            </div>
        </div>
    );
};

export default HomePage;
