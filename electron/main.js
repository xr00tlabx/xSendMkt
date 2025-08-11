import { app, BrowserWindow, dialog, ipcMain, Menu, Notification } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Import services and handlers
import Database from './database/index.js';
import { setupDatabaseHandlers } from './handlers/databaseHandlers.js';
import { setupEmailHandlers } from './handlers/emailHandlers.js';
import { setupFileHandlers } from './handlers/fileHandlers.js';
import { setupWindowHandlers } from './handlers/windowHandlers.js';
import EmailService from './services/emailService.js';
import FileService from './services/fileService.js';
import { getPreloadPath, isDev } from './utils/index.js';
import {
    closeAllModalWindows,
    createCampaignWindow,
    createEmailListsWindow,
    createLoadSmtpsWindow,
    createSettingsWindow,
    createSmtpManagerWindow,
    createStatisticsWindow,
    createTestSmtpsWindow
} from './utils/windowManager.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let mainWindow;

async function initializeServices() {
    try {
        // Initialize database
        await Database.init();

        // Initialize email service
        await EmailService.init();

        // Initialize file service
        await FileService.init();

    } catch (error) {
        console.error('Error initializing services:', error);

        // Show error dialog
        dialog.showErrorBox(
            'Erro de Inicialização',
            `Falha ao inicializar os serviços do aplicativo:\n\n${error.message}\n\nO aplicativo será fechado.`
        );

        app.quit();
    }
}

function setupIpcHandlers() {
    // Setup all IPC handlers
    setupDatabaseHandlers();
    setupEmailHandlers();
    // Pass mainWindow to handlers that need it
    setupFileHandlers(() => mainWindow);
    setupWindowHandlers(() => mainWindow);
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: getPreloadPath()
        },
        titleBarStyle: 'default',
        icon: path.join(__dirname, '../public/icon.png'), // You'll need to add an icon
        show: false, // Don't show until ready-to-show
        autoHideMenuBar: false
    });

    // Load the app
    const startUrl = isDev 
        ? 'http://localhost:55624' 
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Open DevTools in development
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Emitted when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle window controls
    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-unmaximized');
    });

    // Window event handlers
    mainWindow.on('close', async (event) => {
        // Close all modal windows first
        closeAllModalWindows();

        // Clean up services before closing
        try {
            EmailService.closeAllTransporters();
            await Database.close();
            console.log('Services cleaned up successfully');
        } catch (error) {
            console.error('Error cleaning up services:', error);
        }
    });
}

// Create application menu
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Campaign',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        createCampaignWindow(mainWindow);
                    }
                },
                {
                    label: 'Save Campaign',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('menu-save-campaign');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Statistics',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => {
                        createStatisticsWindow(mainWindow);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Lista',
            submenu: [
                {
                    label: 'Gerenciar Listas',
                    accelerator: 'CmdOrCtrl+L',
                    click: () => {
                        createEmailListsWindow(mainWindow);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Zerar Lista',
                    click: async () => {
                        const result = await dialog.showMessageBox(mainWindow, {
                            type: 'warning',
                            buttons: ['Cancelar', 'Zerar'],
                            defaultId: 0,
                            title: 'Confirmar',
                            message: 'Tem certeza que deseja zerar todas as listas?',
                            detail: 'Esta ação não pode ser desfeita.'
                        });

                        if (result.response === 1) {
                            try {
                                await FileService.clearAllLists();
                                new Notification({
                                    title: 'xSendMkt',
                                    body: 'Todas as listas foram zeradas com sucesso!'
                                }).show();
                            } catch (error) {
                                dialog.showErrorBox('Erro', `Erro ao zerar listas: ${error.message}`);
                            }
                        }
                    }
                }
            ]
        },
        {
            label: 'SMTPs',
            submenu: [
                {
                    label: 'Gerenciar SMTPs',
                    accelerator: 'CmdOrCtrl+M',
                    click: () => {
                        createSmtpManagerWindow(mainWindow);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Carregar SMTPs',
                    click: () => {
                        createLoadSmtpsWindow(mainWindow);
                    }
                },
                {
                    label: 'Testar SMTPs',
                    click: () => {
                        createTestSmtpsWindow(mainWindow);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Zerar Lista',
                    click: async () => {
                        const result = await dialog.showMessageBox(mainWindow, {
                            type: 'warning',
                            buttons: ['Cancelar', 'Zerar'],
                            defaultId: 0,
                            title: 'Confirmar',
                            message: 'Tem certeza que deseja zerar todos os SMTPs?',
                            detail: 'Esta ação não pode ser desfeita.'
                        });

                        if (result.response === 1) {
                            try {
                                await Database.clearAllSmtps();
                                new Notification({
                                    title: 'xSendMkt',
                                    body: 'Todos os SMTPs foram zerados com sucesso!'
                                }).show();
                            } catch (error) {
                                dialog.showErrorBox('Erro', `Erro ao zerar SMTPs: ${error.message}`);
                            }
                        }
                    }
                }
            ]
        },
        {
            label: 'Configurações',
            submenu: [
                {
                    label: 'Abrir Configurações',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        createSettingsWindow(mainWindow);
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });

        // Window menu
        template[5].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
    // Initialize services first
    await initializeServices();

    // Create window
    createWindow();

    // Setup IPC handlers
    setupIpcHandlers();

    // Create menu
    createMenu();

    // Em desenvolvimento, abrir configurações automaticamente para teste
    if (isDev) {
        setTimeout(() => {
            console.log('Abrindo configurações automaticamente para desenvolvimento...');
            createSettingsWindow(mainWindow);
        }, 2000);
    }

    app.on('activate', () => {
        // On macOS, re-create window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Cleanup before quit
app.on('before-quit', async () => {
    try {
        // Close all modal windows
        closeAllModalWindows();

        // Clean up services
        EmailService.closeAllTransporters();
        await Database.close();
        console.log('Application cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, url) => {
        event.preventDefault();
        require('electron').shell.openExternal(url);
    });
});

// Prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, url) => {
        if (url !== contents.getURL()) {
            event.preventDefault();
        }
    });
});

// Legacy IPC handlers (keeping for compatibility)
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
});

ipcMain.handle('show-notification', async (event, { title, body }) => {
    new Notification({ title, body }).show();
});
