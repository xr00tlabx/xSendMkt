import { autoUpdater } from 'electron-updater';
import { app, dialog, Notification } from 'electron';
import log from 'electron-log';

class AutoUpdaterService {
    constructor() {
        // Configurar logging
        log.transports.file.level = 'info';
        autoUpdater.logger = log;

        // Configurações do auto-updater
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Quando uma nova versão é encontrada
        autoUpdater.on('update-available', (info) => {
            log.info('Update available:', info);
            
            const notification = new Notification({
                title: 'xSendMkt - Atualização Disponível',
                body: `Nova versão ${info.version} disponível. Clique para baixar.`,
                icon: app.getPath('userData') + '/icon.png'
            });

            notification.on('click', () => {
                this.showUpdateDialog(info);
            });

            notification.show();
        });

        // Quando não há atualizações
        autoUpdater.on('update-not-available', () => {
            log.info('Update not available');
        });

        // Erro na verificação de updates
        autoUpdater.on('error', (err) => {
            log.error('Error in auto-updater:', err);
        });

        // Progresso do download
        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
            log_message += ` - Downloaded ${progressObj.percent}%`;
            log_message += ` (${progressObj.transferred}/${progressObj.total})`;
            log.info(log_message);

            // Você pode emitir este progresso para a janela principal se necessário
            // mainWindow.webContents.send('download-progress', progressObj);
        });

        // Download concluído
        autoUpdater.on('update-downloaded', (info) => {
            log.info('Update downloaded:', info);
            this.showRestartDialog();
        });
    }

    async showUpdateDialog(info) {
        const result = await dialog.showMessageBox({
            type: 'info',
            title: 'Atualização Disponível',
            message: `Nova versão ${info.version} do xSendMkt está disponível!`,
            detail: 'Deseja baixar e instalar a atualização agora?',
            buttons: ['Baixar Agora', 'Baixar em Segundo Plano', 'Cancelar'],
            defaultId: 0,
            cancelId: 2
        });

        if (result.response === 0) {
            // Baixar agora
            autoUpdater.downloadUpdate();
            this.showDownloadDialog();
        } else if (result.response === 1) {
            // Baixar em segundo plano
            autoUpdater.downloadUpdate();
        }
    }

    async showDownloadDialog() {
        await dialog.showMessageBox({
            type: 'info',
            title: 'Baixando Atualização',
            message: 'A atualização está sendo baixada em segundo plano.',
            detail: 'Você será notificado quando o download for concluído.',
            buttons: ['OK']
        });
    }

    async showRestartDialog() {
        const result = await dialog.showMessageBox({
            type: 'info',
            title: 'Atualização Pronta',
            message: 'A atualização foi baixada com sucesso!',
            detail: 'O aplicativo precisa ser reiniciado para aplicar a atualização. Deseja reiniciar agora?',
            buttons: ['Reiniciar Agora', 'Reiniciar ao Fechar'],
            defaultId: 0,
            cancelId: 1
        });

        if (result.response === 0) {
            // Reiniciar agora
            autoUpdater.quitAndInstall();
        }
        // Se escolher "Reiniciar ao Fechar", a atualização será aplicada quando o app for fechado
        // devido ao autoInstallOnAppQuit = true
    }

    // Método para verificar updates manualmente
    checkForUpdates() {
        autoUpdater.checkForUpdatesAndNotify();
    }

    // Método para forçar download de update
    downloadUpdate() {
        autoUpdater.downloadUpdate();
    }

    // Método para instalar update (fecha o app)
    quitAndInstall() {
        autoUpdater.quitAndInstall();
    }
}

export default AutoUpdaterService;
