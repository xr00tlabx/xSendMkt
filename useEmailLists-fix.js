// Correção para o useEmailLists hook
// O problema é que fetchLists não está estabilizada no useEffect

// Solução: usar useCallback para estabilizar fetchLists
import { useCallback, useEffect, useState } from 'react';

export const useEmailLists = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estabilizar fetchLists com useCallback
    const fetchLists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getEmailLists();
            const convertedLists = data.map(list => ({
                id: list.name,
                name: list.name,
                emails: Array(list.emailCount).fill(''),
                createdAt: list.modified,
                updatedAt: list.modified
            }));
            setLists(convertedLists);
            console.log('Listas carregadas:', convertedLists.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch email lists');
            console.error('Erro ao carregar listas:', err);
        } finally {
            setLoading(false);
        }
    }, []); // Array vazio garante que a função não mude

    // ... resto das funções...

    useEffect(() => {
        fetchLists();

        const handleListsUpdate = () => {
            console.log('Evento emailListsUpdated recebido, recarregando listas...');
            fetchLists();
        };

        window.addEventListener('emailListsUpdated', handleListsUpdate);

        return () => {
            window.removeEventListener('emailListsUpdated', handleListsUpdate);
        };
    }, [fetchLists]); // fetchLists agora é estável

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
