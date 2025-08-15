import pkg from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPreloadPath, isDev } from '../utils/index.js';
const { BrowserWindow } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store references to modal windows
const modalWindows = new Map();

export function createModalWindow(windowId, options = {}) {
    // Close existing window if open
    if (modalWindows.has(windowId)) {
        const existingWindow = modalWindows.get(windowId);
        if (!existingWindow.isDestroyed()) {
            existingWindow.close();
        }
        modalWindows.delete(windowId);
    }

    const defaultOptions = {
        width: 700,
        height: 550,
        minWidth: 500,
        minHeight: 350,
        modal: false, // Changed to false to avoid conflicts
        parent: null, // Remove parent to make it independent
        resizable: true,
        maximizable: true,
        minimizable: true,
        autoHideMenuBar: true,
        show: false,
        titleBarStyle: 'default', // VS Code style title bar
        titleBarOverlay: {
            color: '#2d2d30',
            symbolColor: '#cccccc',
            height: 30
        },
        frame: true,
        backgroundColor: '#1e1e1e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: getPreloadPath()
        }
    };

    const windowOptions = { ...defaultOptions, ...options };
    const modalWindow = new BrowserWindow(windowOptions);

    // Load the app with specific route
    const baseUrl = isDev
        ? 'http://localhost:55624'
        : `file://${path.join(__dirname, '../../dist/index.html')}`;

    // Add timestamp to force new instance and prevent conflicts
    const timestamp = Date.now();
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = options.route
        ? `${baseUrl}${separator}t=${timestamp}#${options.route}`
        : `${baseUrl}${separator}t=${timestamp}`;

    // console.log(`Creating modal window ${windowId} with URL: ${url}`);
    modalWindow.loadURL(url);    // Show window when ready
    modalWindow.once('ready-to-show', () => {
        modalWindow.show();

        // Open DevTools in development for debugging
        if (isDev) {
            modalWindow.webContents.openDevTools();
        }
    });    // Remove from map when closed
    modalWindow.on('closed', () => {
        modalWindows.delete(windowId);
    });

    // Store reference
    modalWindows.set(windowId, modalWindow);

    return modalWindow;
}

export function getModalWindow(windowId) {
    return modalWindows.get(windowId);
}

export function closeModalWindow(windowId) {
    const window = modalWindows.get(windowId);
    if (window && !window.isDestroyed()) {
        window.close();
    }
}

export function closeAllModalWindows() {
    for (const [windowId, window] of modalWindows) {
        if (!window.isDestroyed()) {
            window.close();
        }
    }
    modalWindows.clear();
}

// Specific modal windows
export function createSettingsWindow(parent) {
    return createModalWindow('settings', {
        title: 'Configurações - xSendMkt',
        width: 900,
        height: 700,
        route: '/settings'
    });
}

export function createSmtpManagerWindow(parent) {
    return createModalWindow('smtp-manager', {
        title: 'Gerenciar SMTPs - xSendMkt',
        width: 1000,
        height: 800,
        route: '/smtp-config'
    });
}

export function createEmailListsWindow(parent) {
    return createModalWindow('email-lists', {
        title: 'Gerenciar Listas de Email - xSendMkt',
        width: 1000,
        height: 800,
        route: '/email-lists'
    });
}

export function createStatisticsWindow(parent) {
    return createModalWindow('statistics', {
        title: 'Estatísticas - xSendMkt',
        width: 1200,
        height: 800,
        route: '/statistics'
    });
}

export function createCampaignWindow(parent, campaignId = null) {
    const route = campaignId ? `/campaign/${campaignId}` : '/campaign/new';
    return createModalWindow('campaign', {
        title: 'Campanha - xSendMkt',
        width: 1200,
        height: 900,
        route
    });
}
