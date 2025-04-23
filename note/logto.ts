import LogtoClient from '@logto/node';
import { LogtoConfig } from '@logto/node';

export const logtoConfig: LogtoConfig = {
    endpoint: process.env.LOGTO_ENDPOINT || 'http://localhost:3001',
    appId: process.env.LOGTO_APP_ID || '',
    appSecret: process.env.LOGTO_APP_SECRET || '',
    resources: [process.env.BASE_URL || 'http://localhost:4000'],
};

const storage = {
    getItem: async (key: string) => {
        return process.env[key] || null;
    },
    setItem: async (key: string, value: string) => {
        process.env[key] = value;
    },
    removeItem: async (key: string) => {
        delete process.env[key];
    },
};

export const logto = new LogtoClient(logtoConfig, {
    navigate: (url: string) => {
        console.log('Navigate to:', url);
    },
    storage,
}); 