import pkg from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const { app } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

export const paths = {
    userData: app.getPath('userData'),
    appData: app.getPath('appData'),
    desktop: app.getPath('desktop'),
    documents: app.getPath('documents'),
    downloads: app.getPath('downloads'),
    pictures: app.getPath('pictures'),
    home: app.getPath('home'),
    temp: app.getPath('temp')
};

export function getAssetPath(assetPath) {
    if (isDev) {
        return path.join(__dirname, '../../public', assetPath);
    }
    return path.join(__dirname, '../dist', assetPath);
}

export function getPreloadPath() {
    return path.join(__dirname, '../preload.js');
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(date);
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function sanitizeFilename(filename) {
    // Remove caracteres inválidos para nomes de arquivo
    return filename.replace(/[<>:"/\\|?*]/g, '_').trim();
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export function extractDomain(email) {
    return email.split('@')[1]?.toLowerCase();
}

export function getDomainStats(emails) {
    const domains = {};

    emails.forEach(email => {
        const emailStr = typeof email === 'string' ? email : email.email;
        const domain = extractDomain(emailStr);

        if (domain) {
            domains[domain] = (domains[domain] || 0) + 1;
        }
    });

    return Object.entries(domains)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count);
}

export function logError(context, error) {
    console.error(`[${context}] Error:`, error);

    // Em produção, você pode enviar para um serviço de logging
    if (!isDev) {
        // TODO: Implementar logging para produção
    }
}

export function logInfo(context, message, data = null) {
    console.log(`[${context}] ${message}`, data ? data : '');
}

export const emailTemplates = {
    test: {
        subject: 'Teste SMTP - xSendMkt',
        html: `
            <h2>Teste de Conexão SMTP</h2>
            <p>Este é um email de teste enviado pelo xSendMkt.</p>
            <p><strong>Data/Hora:</strong> {{datetime}}</p>
            <p><strong>SMTP ID:</strong> {{smtp_id}}</p>
        `,
        text: `
            Teste de Conexão SMTP
            
            Este é um email de teste enviado pelo xSendMkt.
            Data/Hora: {{datetime}}
            SMTP ID: {{smtp_id}}
        `
    }
};

export function parseTemplate(template, variables) {
    let result = template;

    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    });

    return result;
}
