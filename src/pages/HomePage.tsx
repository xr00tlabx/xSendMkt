import React, { useEffect, useRef, useState } from 'react';
import CampaignForm from '../components/forms/CampaignForm';
import Sidebar from '../components/layout/Sidebar';
import { useCampaigns, useEmailLists, useSmtpConfigs } from '../hooks';
import type { EmailCampaign, SmtpConfig } from '../types';


const HomePage: React.FC = () => {
    const { lists, loading: listsLoading } = useEmailLists();
    const { configs, updateConfig, testConfig } = useSmtpConfigs();
    const { campaigns, loading: campaignsLoading, createCampaign, updateCampaign } = useCampaigns();

    const [draftCampaign, setDraftCampaign] = useState<EmailCampaign | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(140);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleSmtpToggle = (id: string, isActive: boolean) => {
        updateConfig(id, { isActive });
    };

    const handleTestSmtp = async (config: SmtpConfig) => {
        try {
            const res = await testConfig(config);
            alert(res.success ? 'Conexão OK' : `Falhou: ${res.message}`);
        } catch (e: any) {
            alert(`Falhou: ${e?.message || e}`);
        }
    };

    const handleTestAllSmtps = async () => {
        try {
            const results = await window.electronAPI.email.testAllSmtps();
            const ok = results.filter(r => r.success).length;
            alert(`Testes concluídos: ${ok}/${results.length} OK`);
        } catch (e) {
            alert('Erro ao testar todos');
        }
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    // Load the latest draft campaign on mount
    useEffect(() => {
        const draft = campaigns.find(c => c.status === 'draft');
        if (draft) {
            setDraftCampaign(draft);
        }
    }, [campaigns]);

    // Update selected campaign when draft campaign changes
    useEffect(() => {
        if (draftCampaign) {
            setSelectedCampaign(draftCampaign);
        }
    }, [draftCampaign]);

    // Test: Add direct event listener for debugging
    useEffect(() => {
        const handleDirectListUpdate = () => {
            console.log('🏠 HomePage: Evento emailListsUpdated capturado diretamente!');
        };

        window.addEventListener('emailListsUpdated', handleDirectListUpdate);

        return () => {
            window.removeEventListener('emailListsUpdated', handleDirectListUpdate);
        };
    }, []);

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

    const handleSaveCampaign = async (data: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (selectedCampaign?.id) {
                const updated = await updateCampaign(selectedCampaign.id, data);
                setSelectedCampaign(updated);
            } else {
                const created = await createCampaign(data);
                setSelectedCampaign(created);
            }
            setDraftCampaign(null);
        } catch (error) {
            console.error('Erro ao salvar campanha:', error);
            alert(`Erro ao salvar campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const totalEmailsInSelectedLists = selectedCampaign?.selectedLists
        ? lists.filter(list => selectedCampaign.selectedLists.includes(list.id))
            .reduce((total, list) => total + list.emails.length, 0)
        : 0;

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                style={{ width: `${sidebarWidth}px` }}
                className="flex-shrink-0 overflow-hidden"
            >
                <Sidebar
                    lists={lists}
                    smtpConfigs={configs}
                    onSmtpToggle={handleSmtpToggle}
                    onTestSmtp={handleTestSmtp}
                    onTestAllSmtps={handleTestAllSmtps}
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
            <div className="flex-1 p-4 overflow-y-auto vscode-scrollbar">
                <CampaignForm
                    campaign={selectedCampaign || undefined}
                    onSave={handleSaveCampaign}
                    loading={campaignsLoading}
                    selectedLists={selectedCampaign?.selectedLists || []}
                    totalEmails={totalEmailsInSelectedLists}
                />
            </div>
        </div>
    );
};

export default HomePage;
