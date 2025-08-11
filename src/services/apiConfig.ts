import type { ApiConfig } from '../types';

// Configuration for API mock toggle
export const apiConfig: ApiConfig = {
    useMock: true, // Set to false to use real API
    baseUrl: 'http://localhost:3001/api'
};

export const toggleMockApi = (useMock: boolean) => {
    apiConfig.useMock = useMock;
    console.log(`API Mock ${useMock ? 'enabled' : 'disabled'}`);
};
