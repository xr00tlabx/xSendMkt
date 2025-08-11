// CORREÇÃO PARA O PROBLEMA DO SIDEBAR NÃO ATUALIZAR
// Aplique estas mudanças no arquivo src/hooks/index.ts

// 1. ADICIONAR useCallback na importação do React:
import { useCallback, useEffect, useState } from 'react';

// 2. MODIFICAR a função fetchLists no useEmailLists para usar useCallback:

export const useEmailLists = () => {
    const [lists, setLists] = useState < EmailList[] > ([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    // Estabilizar fetchLists com useCallback
    const fetchLists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getEmailLists();
            console.log('Carregando listas do backend:', data);
            // Convert from electron EmailList[] to app EmailList[]
            const convertedLists = data.map(list => ({
                id: list.name, // Use name as ID
                name: list.name,
                emails: Array(list.emailCount).fill(''), // Create array with correct length for count
                createdAt: list.modified,
                updatedAt: list.modified
            }));
            console.log('Listas convertidas:', convertedLists);
            setLists(convertedLists);
        } catch (err) {
            console.error('Erro ao buscar listas:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch email lists');
        } finally {
            setLoading(false);
        }
    }, []); // Array vazio para que a função não mude entre renders

    // 3. MODIFICAR o useEffect para usar a função estabilizada:
    useEffect(() => {
        fetchLists();

        // Escutar eventos de atualização de listas
        const handleListsUpdate = () => {
            console.log('🔄 Evento emailListsUpdated recebido, recarregando listas...');
            fetchLists();
        };

        window.addEventListener('emailListsUpdated', handleListsUpdate);

        return () => {
            window.removeEventListener('emailListsUpdated', handleListsUpdate);
        };
    }, [fetchLists]); // fetchLists agora é uma dependência estável

    // Resto das funções permanecem iguais...

    return {
        lists,
        loading,
        error,
        createList,
        updateList,
        deleteList,
        refetch: fetchLists
    };
};

// ADICIONE TAMBÉM logs na função notifyEmailListsUpdate para debug:
export const notifyEmailListsUpdate = () => {
    console.log('📢 Disparando evento emailListsUpdated...');
    const event = new CustomEvent('emailListsUpdated');
    window.dispatchEvent(event);
    console.log('✅ Evento emailListsUpdated disparado');
};
