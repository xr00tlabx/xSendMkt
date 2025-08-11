import fs from 'fs/promises';
import path from 'path';
import Database from '../database/index.js';

class FileService {
    constructor() {
        this.listsDirectory = '';
    }

    async init() {
        try {
            // Carregar diretório das listas das configurações
            console.log('Inicializando FileService...');
            const listsDir = await Database.getSetting('lists_directory');
            console.log('Diretório das listas carregado do banco:', listsDir);

            if (listsDir) {
                this.listsDirectory = listsDir;
                console.log('Diretório das listas definido:', this.listsDirectory);
            }
        } catch (error) {
            console.error('Erro ao inicializar FileService:', error);
        }
    }

    // Definir diretório das listas
    async setListsDirectory(directory) {
        try {
            console.log('Tentando definir diretório:', directory);

            // Verificar se o diretório existe
            await fs.access(directory);
            console.log('Diretório existe e é acessível');

            this.listsDirectory = directory;
            const result = await Database.setSetting('lists_directory', directory);
            console.log('Resultado do setSetting:', result);

            return true;
        } catch (error) {
            console.error('Erro ao definir diretório:', error);
            throw new Error(`Diretório não existe ou não é acessível: ${directory}`);
        }
    }

    // Obter diretório das listas
    getListsDirectory() {
        console.log('Retornando diretório atual:', this.listsDirectory);
        return this.listsDirectory;
    }

    // Listar arquivos de email no diretório
    async getEmailLists() {
        if (!this.listsDirectory) {
            return [];
        }

        try {
            const files = await fs.readdir(this.listsDirectory);
            const emailFiles = files.filter(file =>
                file.endsWith('.txt') ||
                file.endsWith('.csv') ||
                file.endsWith('.json')
            );

            const lists = [];
            for (const file of emailFiles) {
                const filePath = path.join(this.listsDirectory, file);
                const stats = await fs.stat(filePath);

                // Contar emails no arquivo
                const emailCount = await this.countEmailsInFile(filePath);

                lists.push({
                    name: file,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime,
                    emailCount
                });
            }

            return lists.sort((a, b) => b.modified - a.modified);
        } catch (error) {
            console.error('Erro ao listar arquivos de email:', error);
            return [];
        }
    }

    // Contar emails em um arquivo
    async countEmailsInFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const emails = this.parseEmailsFromContent(content, path.extname(filePath));
            return emails.length;
        } catch (error) {
            console.error('Erro ao contar emails:', error);
            return 0;
        }
    }

    // Ler emails de um arquivo
    async readEmailsFromFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const extension = path.extname(filePath).toLowerCase();
            return this.parseEmailsFromContent(content, extension);
        } catch (error) {
            console.error('Erro ao ler arquivo de emails:', error);
            return [];
        }
    }

    // Parsear emails baseado no tipo de arquivo
    parseEmailsFromContent(content, extension) {
        const emails = [];

        try {
            switch (extension) {
                case '.txt':
                    // Arquivo de texto simples, um email por linha
                    const lines = content.split('\n');
                    for (const line of lines) {
                        const email = line.trim();
                        if (this.isValidEmail(email)) {
                            emails.push({
                                email: email,
                                name: this.extractNameFromEmail(email)
                            });
                        }
                    }
                    break;

                case '.csv':
                    // Arquivo CSV, primeira coluna email, segunda nome (opcional)
                    const csvLines = content.split('\n');
                    for (let i = 0; i < csvLines.length; i++) {
                        const line = csvLines[i].trim();
                        if (!line) continue;

                        // Skip header se for a primeira linha e não for um email
                        if (i === 0 && !this.isValidEmail(line.split(',')[0])) {
                            continue;
                        }

                        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
                        if (columns.length > 0 && this.isValidEmail(columns[0])) {
                            emails.push({
                                email: columns[0],
                                name: columns[1] || this.extractNameFromEmail(columns[0])
                            });
                        }
                    }
                    break;

                case '.json':
                    // Arquivo JSON
                    const jsonData = JSON.parse(content);
                    if (Array.isArray(jsonData)) {
                        for (const item of jsonData) {
                            if (typeof item === 'string' && this.isValidEmail(item)) {
                                emails.push({
                                    email: item,
                                    name: this.extractNameFromEmail(item)
                                });
                            } else if (typeof item === 'object' && item.email && this.isValidEmail(item.email)) {
                                emails.push({
                                    email: item.email,
                                    name: item.name || this.extractNameFromEmail(item.email)
                                });
                            }
                        }
                    }
                    break;

                default:
                    throw new Error(`Tipo de arquivo não suportado: ${extension}`);
            }
        } catch (error) {
            console.error('Erro ao parsear emails:', error);
        }

        return emails;
    }

    // Validar formato de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Extrair nome do email (parte antes do @)
    extractNameFromEmail(email) {
        return email.split('@')[0].replace(/[._-]/g, ' ').split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Salvar lista de emails
    async saveEmailList(filename, emails, format = 'txt') {
        if (!this.listsDirectory) {
            throw new Error('Diretório de listas não configurado');
        }

        const filePath = path.join(this.listsDirectory, filename);
        let content = '';

        switch (format) {
            case 'txt':
                content = emails.map(email =>
                    typeof email === 'string' ? email : email.email
                ).join('\n');
                break;

            case 'csv':
                content = 'Email,Nome\n';
                content += emails.map(email => {
                    if (typeof email === 'string') {
                        return `"${email}","${this.extractNameFromEmail(email)}"`;
                    } else {
                        return `"${email.email}","${email.name || this.extractNameFromEmail(email.email)}"`;
                    }
                }).join('\n');
                break;

            case 'json':
                const jsonEmails = emails.map(email => {
                    if (typeof email === 'string') {
                        return {
                            email: email,
                            name: this.extractNameFromEmail(email)
                        };
                    } else {
                        return {
                            email: email.email,
                            name: email.name || this.extractNameFromEmail(email.email)
                        };
                    }
                });
                content = JSON.stringify(jsonEmails, null, 2);
                break;

            default:
                throw new Error(`Formato não suportado: ${format}`);
        }

        await fs.writeFile(filePath, content, 'utf-8');
        return filePath;
    }

    // Deletar arquivo de lista
    async deleteEmailList(filename) {
        if (!this.listsDirectory) {
            throw new Error('Diretório de listas não configurado');
        }

        const filePath = path.join(this.listsDirectory, filename);

        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            return false;
        }
    }

    // Limpar todas as listas
    async clearAllLists() {
        if (!this.listsDirectory) {
            throw new Error('Diretório de listas não configurado');
        }

        try {
            const files = await fs.readdir(this.listsDirectory);
            const emailFiles = files.filter(file =>
                file.endsWith('.txt') ||
                file.endsWith('.csv') ||
                file.endsWith('.json')
            );

            for (const file of emailFiles) {
                const filePath = path.join(this.listsDirectory, file);
                await fs.unlink(filePath);
            }

            return true;
        } catch (error) {
            console.error('Erro ao limpar listas:', error);
            return false;
        }
    }

    // Mesclar múltiplas listas
    async mergeLists(filenames, outputFilename, format = 'txt') {
        const allEmails = new Set(); // Usar Set para remover duplicatas

        for (const filename of filenames) {
            const filePath = path.join(this.listsDirectory, filename);
            const emails = await this.readEmailsFromFile(filePath);

            emails.forEach(emailData => {
                allEmails.add(typeof emailData === 'string' ? emailData : emailData.email);
            });
        }

        const mergedEmails = Array.from(allEmails);
        return await this.saveEmailList(outputFilename, mergedEmails, format);
    }

    // Filtrar emails por domínio
    filterEmailsByDomain(emails, domains, exclude = false) {
        const domainSet = new Set(domains.map(d => d.toLowerCase()));

        return emails.filter(emailData => {
            const email = typeof emailData === 'string' ? emailData : emailData.email;
            const domain = email.split('@')[1]?.toLowerCase();

            if (exclude) {
                return !domainSet.has(domain);
            } else {
                return domainSet.has(domain);
            }
        });
    }

    // Validar e limpar lista de emails
    async validateAndCleanList(filePath) {
        const emails = await this.readEmailsFromFile(filePath);
        const validEmails = [];
        const invalidEmails = [];

        for (const emailData of emails) {
            const email = typeof emailData === 'string' ? emailData : emailData.email;

            if (this.isValidEmail(email)) {
                validEmails.push(emailData);
            } else {
                invalidEmails.push(email);
            }
        }

        return {
            valid: validEmails,
            invalid: invalidEmails,
            totalOriginal: emails.length,
            totalValid: validEmails.length,
            totalInvalid: invalidEmails.length
        };
    }
}

export default new FileService();
