import { ipcMain } from 'electron';
import EmailService from '../services/emailService.js';

export function setupEmailHandlers() {
    // Test SMTP connection
    ipcMain.handle('email:test-smtp', async (event, smtpConfig) => {
        try {
            return await EmailService.testSmtp(smtpConfig);
        } catch (error) {
            console.error('Error testing SMTP:', error);
            return { success: false, message: error.message };
        }
    });

    // Test all SMTPs
    ipcMain.handle('email:test-all-smtps', async () => {
        try {
            return await EmailService.testAllSmtps();
        } catch (error) {
            console.error('Error testing all SMTPs:', error);
            throw error;
        }
    });

    // Send single email
    ipcMain.handle('email:send-single', async (event, emailData, smtpId) => {
        try {
            return await EmailService.sendEmail(emailData, smtpId);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    });

    // Send test email
    ipcMain.handle('email:send-test', async (event, smtpId, testEmail) => {
        try {
            return await EmailService.sendTestEmail(smtpId, testEmail);
        } catch (error) {
            console.error('Error sending test email:', error);
            throw error;
        }
    });

    // Add emails to queue
    ipcMain.handle('email:add-to-queue', async (event, emails, campaignId = null) => {
        try {
            EmailService.addToQueue(emails, campaignId);
            return { success: true };
        } catch (error) {
            console.error('Error adding emails to queue:', error);
            throw error;
        }
    });

    // Queue control
    ipcMain.handle('email:pause-queue', async () => {
        try {
            EmailService.pauseQueue();
            return { success: true };
        } catch (error) {
            console.error('Error pausing queue:', error);
            throw error;
        }
    });

    ipcMain.handle('email:resume-queue', async () => {
        try {
            EmailService.resumeQueue();
            return { success: true };
        } catch (error) {
            console.error('Error resuming queue:', error);
            throw error;
        }
    });

    ipcMain.handle('email:clear-queue', async () => {
        try {
            EmailService.clearQueue();
            return { success: true };
        } catch (error) {
            console.error('Error clearing queue:', error);
            throw error;
        }
    });

    // Get queue status
    ipcMain.handle('email:get-queue-status', async () => {
        try {
            return EmailService.getQueueStatus();
        } catch (error) {
            console.error('Error getting queue status:', error);
            throw error;
        }
    });
}
