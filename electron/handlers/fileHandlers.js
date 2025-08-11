import { BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import FileService from '../services/fileService.js';

export function setupFileHandlers(getMainWindow) {
    // Directory selection
    ipcMain.handle('file:select-lists-directory', async () => {
        try {
            // Get the currently focused window, or fallback to main window
            const focusedWindow = BrowserWindow.getFocusedWindow();
            const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
            const parentWindow = focusedWindow || mainWindow;
            
            if (!parentWindow) {
                return { success: false, error: 'Nenhuma janela disponível' };
            }

            const result = await dialog.showOpenDialog(parentWindow, {
                title: 'Selecionar Diretório das Listas de Email',
                properties: ['openDirectory'],
                buttonLabel: 'Selecionar'
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const directory = result.filePaths[0];

                // Tentar definir o diretório
                await FileService.setListsDirectory(directory);
                return { success: true, directory };
            }

            return { success: false, canceled: true };
        } catch (error) {
            console.error('Error selecting directory:', error);
            return { success: false, error: error.message };
        }
    });

    // Set lists directory
    ipcMain.handle('file:set-lists-directory', async (event, directory) => {
        try {
            await FileService.setListsDirectory(directory);
            return { success: true };
        } catch (error) {
            console.error('Error setting lists directory:', error);
            return { success: false, error: error.message };
        }
    });

    // Get lists directory
    ipcMain.handle('file:get-lists-directory', async () => {
        try {
            return FileService.getListsDirectory();
        } catch (error) {
            console.error('Error getting lists directory:', error);
            throw error;
        }
    });

    // Check for .txt files in the configured directory
    ipcMain.handle('file:check-txt-files', async () => {
        try {
            return await FileService.checkForTxtFiles();
        } catch (error) {
            console.error('Error checking for txt files:', error);
            return {
                hasDirectory: false,
                hasTxtFiles: false,
                message: 'Erro ao verificar arquivos de lista'
            };
        }
    });

    // Get email lists
    ipcMain.handle('file:get-email-lists', async () => {
        try {
            return await FileService.getEmailLists();
        } catch (error) {
            console.error('Error getting email lists:', error);
            throw error;
        }
    });

    // Read emails from file
    ipcMain.handle('file:read-emails', async (event, filename) => {
        try {
            const filePath = FileService.getListsDirectory();
            if (!filePath) {
                throw new Error('Diretório de listas não configurado');
            }

            const fullPath = path.join(filePath, filename);
            return await FileService.readEmailsFromFile(fullPath);
        } catch (error) {
            console.error('Error reading emails:', error);
            throw error;
        }
    });

    // Save email list
    ipcMain.handle('file:save-email-list', async (event, filename, emails, format = 'txt') => {
        try {
            return await FileService.saveEmailList(filename, emails, format);
        } catch (error) {
            console.error('Error saving email list:', error);
            throw error;
        }
    });

    // Delete email list
    ipcMain.handle('file:delete-email-list', async (event, filename) => {
        try {
            return await FileService.deleteEmailList(filename);
        } catch (error) {
            console.error('Error deleting email list:', error);
            throw error;
        }
    });

    // Clear all lists
    ipcMain.handle('file:clear-all-lists', async () => {
        try {
            return await FileService.clearAllLists();
        } catch (error) {
            console.error('Error clearing all lists:', error);
            throw error;
        }
    });

    // Merge lists
    ipcMain.handle('file:merge-lists', async (event, filenames, outputFilename, format = 'txt') => {
        try {
            return await FileService.mergeLists(filenames, outputFilename, format);
        } catch (error) {
            console.error('Error merging lists:', error);
            throw error;
        }
    });

    // Validate and clean list
    ipcMain.handle('file:validate-and-clean-list', async (event, filename) => {
        try {
            const filePath = FileService.getListsDirectory();
            if (!filePath) {
                throw new Error('Diretório de listas não configurado');
            }

            const fullPath = path.join(filePath, filename);
            return await FileService.validateAndCleanList(fullPath);
        } catch (error) {
            console.error('Error validating and cleaning list:', error);
            throw error;
        }
    });

    // Filter emails by domain
    ipcMain.handle('file:filter-emails-by-domain', async (event, emails, domains, exclude = false) => {
        try {
            return FileService.filterEmailsByDomain(emails, domains, exclude);
        } catch (error) {
            console.error('Error filtering emails by domain:', error);
            throw error;
        }
    });

    // Select and import file
    ipcMain.handle('file:select-and-import', async () => {
        try {
            // Get the currently focused window, or fallback to main window
            const focusedWindow = BrowserWindow.getFocusedWindow();
            const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
            const parentWindow = focusedWindow || mainWindow;

            if (!parentWindow) {
                return { success: false, error: 'Nenhuma janela disponível' };
            }

            const result = await dialog.showOpenDialog(parentWindow, {
                title: 'Importar Lista de Emails',
                properties: ['openFile'],
                filters: [
                    { name: 'Arquivos de Email', extensions: ['txt', 'csv', 'json'] },
                    { name: 'Arquivos de Texto', extensions: ['txt'] },
                    { name: 'Arquivos CSV', extensions: ['csv'] },
                    { name: 'Arquivos JSON', extensions: ['json'] },
                    { name: 'Todos os Arquivos', extensions: ['*'] }
                ],
                buttonLabel: 'Importar'
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                const emails = await FileService.readEmailsFromFile(filePath);

                return {
                    success: true,
                    filePath,
                    emails,
                    count: emails.length
                };
            }

            return { success: false, canceled: true };
        } catch (error) {
            console.error('Error selecting and importing file:', error);
            return { success: false, error: error.message };
        }
    });
}
