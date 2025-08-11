import React, { useEffect, useState } from 'react';
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

    // Load the latest draft campaign on mount
    useEffect(() => {
        const draftCampaign = campaigns.find(c => c.status === 'draft');
        if (draftCampaign) {
            setCurrentCampaign(draftCampaign);
            setSelectedLists(draftCampaign.selectedLists);
        }
    }, [campaigns]);

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

    const loading = listsLoading || smtpLoading || campaignsLoading;

    return (
        <div className="flex h-full w-full min-h-0 min-w-0 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                lists={lists}
                selectedLists={selectedLists}
                onListToggle={handleListToggle}
                smtpConfigs={configs}
                onSmtpToggle={handleSmtpToggle}
                loading={listsLoading}
            />

            {/* Main Campaign Editor */}
            <div className="flex-1 overflow-hidden min-w-0 min-h-0 w-full">
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
