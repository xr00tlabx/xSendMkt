import nodemailer from 'nodemailer';
import Database from '../database/index.js';

class EmailService {
    constructor() {
        this.transporters = new Map();
        this.sendingQueue = [];
        this.isProcessing = false;
        this.maxConcurrent = 5;
        this.delayBetweenEmails = 1000;
    }

    async init() {
        // Carregar configurações do banco
        const settings = await Database.getAllSettings();
        this.maxConcurrent = settings.max_concurrent_emails || 5;
        this.delayBetweenEmails = settings.delay_between_emails || 1000;
    }

    // Criar transporter para um SMTP específico
    createTransporter(smtpConfig) {
        const config = {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure, // true para 465, false para outras portas
            auth: {
                user: smtpConfig.username,
                pass: smtpConfig.password
            },
            pool: true, // Usar pool de conexões
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000, // 1 segundo
            rateLimit: 5 // 5 emails por segundo
        };

        return nodemailer.createTransporter(config);
    }

    // Obter ou criar transporter para um SMTP
    async getTransporter(smtpId) {
        if (this.transporters.has(smtpId)) {
            return this.transporters.get(smtpId);
        }

        // Buscar configuração do SMTP no banco
        const smtps = await Database.getAllSmtps();
        const smtp = smtps.find(s => s.id === smtpId);

        if (!smtp) {
            throw new Error(`SMTP com ID ${smtpId} não encontrado`);
        }

        const transporter = this.createTransporter(smtp);
        this.transporters.set(smtpId, transporter);

        return transporter;
    }

    // Testar conexão SMTP
    async testSmtp(smtpConfig) {
        try {
            const transporter = this.createTransporter(smtpConfig);
            await transporter.verify();
            return { success: true, message: 'Conexão SMTP válida' };
        } catch (error) {
            return {
                success: false,
                message: `Erro na conexão SMTP: ${error.message}`
            };
        }
    }

    // Testar todos os SMTPs
    async testAllSmtps() {
        const smtps = await Database.getAllSmtps();
        const results = [];

        for (const smtp of smtps) {
            const result = await this.testSmtp(smtp);
            results.push({
                id: smtp.id,
                name: smtp.name,
                ...result
            });
        }

        return results;
    }

    // Enviar email único
    async sendEmail(emailData, smtpId) {
        try {
            const transporter = await this.getTransporter(smtpId);
            const smtps = await Database.getAllSmtps();
            const smtp = smtps.find(s => s.id === smtpId);

            const mailOptions = {
                from: `"${smtp.from_name}" <${smtp.from_email}>`,
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text
            };

            const info = await transporter.sendMail(mailOptions);

            // Log do sucesso
            if (emailData.campaignId) {
                await Database.logEmail(
                    emailData.campaignId,
                    smtpId,
                    emailData.to,
                    'sent'
                );
            }

            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };
        } catch (error) {
            // Log do erro
            if (emailData.campaignId) {
                await Database.logEmail(
                    emailData.campaignId,
                    smtpId,
                    emailData.to,
                    'failed',
                    error.message
                );
            }

            throw error;
        }
    }

    // Adicionar emails à fila de envio
    addToQueue(emails, campaignId = null) {
        const emailsWithCampaign = emails.map(email => ({
            ...email,
            campaignId
        }));

        this.sendingQueue.push(...emailsWithCampaign);

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    // Processar fila de envio
    async processQueue() {
        if (this.isProcessing || this.sendingQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const smtps = await Database.getAllSmtps();
        const activeSmtps = smtps.filter(smtp => smtp.is_active);

        if (activeSmtps.length === 0) {
            console.error('Nenhum SMTP ativo encontrado');
            this.isProcessing = false;
            return;
        }

        let currentSmtpIndex = 0;
        const processing = [];

        while (this.sendingQueue.length > 0 && processing.length < this.maxConcurrent) {
            const email = this.sendingQueue.shift();
            const smtp = activeSmtps[currentSmtpIndex % activeSmtps.length];

            const promise = this.sendEmail(email, smtp.id)
                .then(result => {
                    console.log(`Email enviado para ${email.to}: ${result.messageId}`);
                    return { success: true, email: email.to, result };
                })
                .catch(error => {
                    console.error(`Erro ao enviar email para ${email.to}:`, error.message);
                    return { success: false, email: email.to, error: error.message };
                });

            processing.push(promise);
            currentSmtpIndex++;
        }

        // Aguardar o batch atual
        await Promise.all(processing);

        // Delay antes do próximo batch
        if (this.sendingQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delayBetweenEmails));
            // Continuar processando
            await this.processQueue();
        } else {
            this.isProcessing = false;
        }
    }

    // Pausar o envio
    pauseQueue() {
        this.isProcessing = false;
    }

    // Retomar o envio
    resumeQueue() {
        if (!this.isProcessing && this.sendingQueue.length > 0) {
            this.processQueue();
        }
    }

    // Limpar fila
    clearQueue() {
        this.sendingQueue = [];
        this.isProcessing = false;
    }

    // Obter status da fila
    getQueueStatus() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.sendingQueue.length,
            maxConcurrent: this.maxConcurrent,
            delayBetweenEmails: this.delayBetweenEmails
        };
    }

    // Enviar email de teste
    async sendTestEmail(smtpId, testEmail) {
        const testData = {
            to: testEmail,
            subject: 'Teste SMTP - xSendMkt',
            html: `
                <h2>Teste de Conexão SMTP</h2>
                <p>Este é um email de teste enviado pelo xSendMkt.</p>
                <p><strong>Data/Hora:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>SMTP ID:</strong> ${smtpId}</p>
            `,
            text: `
                Teste de Conexão SMTP
                
                Este é um email de teste enviado pelo xSendMkt.
                Data/Hora: ${new Date().toLocaleString()}
                SMTP ID: ${smtpId}
            `
        };

        return await this.sendEmail(testData, smtpId);
    }

    // Limpar transporters
    closeAllTransporters() {
        for (const [id, transporter] of this.transporters) {
            if (transporter && typeof transporter.close === 'function') {
                transporter.close();
            }
        }
        this.transporters.clear();
    }
}

export default new EmailService();
