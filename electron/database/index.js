import { app } from 'electron';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.initPromise = null;
    }

    async init() {
        // Se já estiver inicializado, retorna a conexão existente
        if (this.initialized && this.db) {
            return this.db;
        }

        // Se já estiver inicializando, aguarda a promessa existente
        if (this.initPromise) {
            return this.initPromise;
        }

        // Cria uma nova promessa de inicialização
        this.initPromise = this._performInit();
        return this.initPromise;
    }

    async _performInit() {
        try {
            const dbPath = path.join(app.getPath('userData'), 'xsendmkt.db');

            this.db = await open({
                filename: dbPath,
                driver: sqlite3.Database
            });

            await this.createTables();
            this.initialized = true;
            this.initPromise = null; // Limpa a promessa após sucesso
            return this.db;
        } catch (error) {
            this.initPromise = null; // Limpa a promessa em caso de erro
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    async createTables() {
        // Tabela de configurações
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                type TEXT DEFAULT 'string',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de SMTPs
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS smtps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                host TEXT NOT NULL,
                port INTEGER NOT NULL,
                secure BOOLEAN DEFAULT 0,
                username TEXT,
                password TEXT,
                from_email TEXT,
                from_name TEXT,
                is_active BOOLEAN DEFAULT 1,
                last_used DATETIME,
                success_count INTEGER DEFAULT 0,
                error_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de campanhas
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                subject TEXT NOT NULL,
                html_content TEXT,
                text_content TEXT,
                status TEXT DEFAULT 'draft',
                total_emails INTEGER DEFAULT 0,
                sent_emails INTEGER DEFAULT 0,
                failed_emails INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                sent_at DATETIME
            )
        `);

        // Tabela de logs de envio
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS email_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id INTEGER,
                smtp_id INTEGER,
                recipient_email TEXT NOT NULL,
                status TEXT NOT NULL,
                error_message TEXT,
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
                FOREIGN KEY (smtp_id) REFERENCES smtps (id)
            )
        `);

        // Inserir configurações padrão se não existirem
        await this.initDefaultSettings();
    }

    async initDefaultSettings() {
        const defaultSettings = [
            { key: 'lists_directory', value: '', type: 'string' },
            { key: 'max_concurrent_emails', value: '5', type: 'number' },
            { key: 'delay_between_emails', value: '1000', type: 'number' },
            { key: 'auto_save_campaigns', value: 'true', type: 'boolean' }
        ];

        for (const setting of defaultSettings) {
            await this.db.run(
                'INSERT OR IGNORE INTO settings (key, value, type) VALUES (?, ?, ?)',
                [setting.key, setting.value, setting.type]
            );
        }
    }

    // Métodos para configurações
    async getSetting(key) {
        try {
            await this.ensureConnection();
            const result = await this.db.get('SELECT * FROM settings WHERE key = ?', [key]);
            if (!result) return null;

            // Converter o valor para o tipo correto
            switch (result.type) {
                case 'number':
                    return Number(result.value);
                case 'boolean':
                    return result.value === 'true';
                case 'json':
                    return JSON.parse(result.value);
                default:
                    return result.value;
            }
        } catch (error) {
            console.error('Error getting setting:', error);
            return null;
        }
    }

    async setSetting(key, value, type = 'string') {
        try {
            await this.ensureConnection();
            let stringValue = value;
            if (type === 'json') {
                stringValue = JSON.stringify(value);
            } else if (type === 'boolean') {
                stringValue = value ? 'true' : 'false';
            } else {
                stringValue = String(value);
            }

            await this.db.run(
                `INSERT OR REPLACE INTO settings (key, value, type, updated_at) 
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [key, stringValue, type]
            );
            return true;
        } catch (error) {
            console.error('Error setting setting:', error);
            return false;
        }
    }

    async getAllSettings() {
        try {
            const results = await this.db.all('SELECT * FROM settings ORDER BY key');
            const settings = {};
            
            for (const result of results) {
                switch (result.type) {
                    case 'number':
                        settings[result.key] = Number(result.value);
                        break;
                    case 'boolean':
                        settings[result.key] = result.value === 'true';
                        break;
                    case 'json':
                        settings[result.key] = JSON.parse(result.value);
                        break;
                    default:
                        settings[result.key] = result.value;
                }
            }
            
            return settings;
        } catch (error) {
            console.error('Error getting all settings:', error);
            return {};
        }
    }

    // Métodos para SMTPs
    async addSmtp(smtpData) {
        try {
            const result = await this.db.run(
                `INSERT INTO smtps (name, host, port, secure, username, password, from_email, from_name, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
                [
                    smtpData.name,
                    smtpData.host,
                    smtpData.port,
                    smtpData.secure ? 1 : 0,
                    smtpData.username,
                    smtpData.password,
                    smtpData.from_email,
                    smtpData.from_name,
                    smtpData.is_active ? 1 : 0
                ]
            );
            return result.lastID;
        } catch (error) {
            console.error('Error adding SMTP:', error);
            throw error;
        }
    }

    async getAllSmtps() {
        try {
            const results = await this.db.all('SELECT * FROM smtps ORDER BY name');
            return results.map(smtp => ({
                ...smtp,
                secure: smtp.secure === 1
            }));
        } catch (error) {
            console.error('Error getting SMTPs:', error);
            return [];
        }
    }

    async updateSmtp(id, smtpData) {
        try {
            // Load current row
            const current = await this.db.get('SELECT * FROM smtps WHERE id = ?', [id]);
            if (!current) return false;

            // Merge keeping existing values when not provided
            const merged = {
                ...current,
                ...smtpData,
                secure: smtpData.secure !== undefined ? (smtpData.secure ? 1 : 0) : current.secure,
                is_active: smtpData.is_active !== undefined ? (smtpData.is_active ? 1 : 0) : current.is_active
            };

            await this.db.run(
                `UPDATE smtps SET 
                 name = ?, host = ?, port = ?, secure = ?, 
                 username = ?, password = ?, from_email = ?, from_name = ?, is_active = ?,
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    merged.name,
                    merged.host,
                    merged.port,
                    merged.secure,
                    merged.username,
                    merged.password,
                    merged.from_email,
                    merged.from_name,
                    merged.is_active,
                    id
                ]
            );
            return true;
        } catch (error) {
            console.error('Error updating SMTP:', error);
            return false;
        }
    }

    async deleteSmtp(id) {
        try {
            await this.db.run('DELETE FROM smtps WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error deleting SMTP:', error);
            return false;
        }
    }

    async clearAllSmtps() {
        try {
            await this.db.run('DELETE FROM smtps');
            return true;
        } catch (error) {
            console.error('Error clearing SMTPs:', error);
            return false;
        }
    }

    // Métodos para campanhas
    async saveCampaign(campaignData) {
        try {
            if (campaignData.id) {
                // Atualizar campanha existente
                await this.db.run(
                    `UPDATE campaigns SET 
                     name = ?, subject = ?, html_content = ?, text_content = ?,
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [
                        campaignData.name,
                        campaignData.subject,
                        campaignData.html_content,
                        campaignData.text_content,
                        campaignData.id
                    ]
                );
                return campaignData.id;
            } else {
                // Criar nova campanha
                const result = await this.db.run(
                    `INSERT INTO campaigns (name, subject, html_content, text_content)
                     VALUES (?, ?, ?, ?)`,
                    [
                        campaignData.name,
                        campaignData.subject,
                        campaignData.html_content,
                        campaignData.text_content
                    ]
                );
                return result.lastID;
            }
        } catch (error) {
            console.error('Error saving campaign:', error);
            throw error;
        }
    }

    async getCampaign(id) {
        try {
            return await this.db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
        } catch (error) {
            console.error('Error getting campaign:', error);
            return null;
        }
    }

    async getAllCampaigns() {
        try {
            return await this.db.all('SELECT * FROM campaigns ORDER BY created_at DESC');
        } catch (error) {
            console.error('Error getting campaigns:', error);
            return [];
        }
    }

    // Métodos para logs
    async logEmail(campaignId, smtpId, recipientEmail, status, errorMessage = null) {
        try {
            await this.db.run(
                `INSERT INTO email_logs (campaign_id, smtp_id, recipient_email, status, error_message)
                 VALUES (?, ?, ?, ?, ?)`,
                [campaignId, smtpId, recipientEmail, status, errorMessage]
            );
        } catch (error) {
            console.error('Error logging email:', error);
        }
    }

    async getEmailLogs(campaignId = null, limit = 100) {
        try {
            let query = `
                SELECT el.*, c.name as campaign_name, s.name as smtp_name 
                FROM email_logs el
                LEFT JOIN campaigns c ON el.campaign_id = c.id
                LEFT JOIN smtps s ON el.smtp_id = s.id
            `;
            let params = [];

            if (campaignId) {
                query += ' WHERE el.campaign_id = ?';
                params.push(campaignId);
            }

            query += ' ORDER BY el.sent_at DESC LIMIT ?';
            params.push(limit);

            return await this.db.all(query, params);
        } catch (error) {
            console.error('Error getting email logs:', error);
            return [];
        }
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
            this.initialized = false;
            this.initPromise = null;
            console.log('Database connection closed');
        }
    }

    // Método para verificar se a conexão está ativa
    isConnected() {
        return this.initialized && this.db !== null;
    }

    // Método para garantir que a conexão está ativa
    async ensureConnection() {
        if (!this.isConnected()) {
            await this.init();
        }
        return this.db;
    }
}

export default new Database();
