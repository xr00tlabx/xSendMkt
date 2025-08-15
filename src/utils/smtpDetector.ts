interface SmtpProvider {
    domains: string[];
    host: string;
    port: number;
    secure: boolean;
}

// Lista de provedores de email conhecidos
const SMTP_PROVIDERS: SmtpProvider[] = [
    // Gmail
    {
        domains: ['gmail.com', 'googlemail.com'],
        host: 'smtp.gmail.com',
        port: 587,
        secure: false
    },

    // Outlook / Hotmail / Live
    {
        domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false
    },

    // Yahoo
    {
        domains: ['yahoo.com', 'yahoo.com.br', 'yahoo.co.uk', 'ymail.com'],
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false
    },

    // iCloud
    {
        domains: ['icloud.com', 'me.com', 'mac.com'],
        host: 'smtp.mail.me.com',
        port: 587,
        secure: false
    },

    // ProtonMail
    {
        domains: ['protonmail.com', 'protonmail.ch', 'pm.me'],
        host: 'mail.protonmail.ch',
        port: 587,
        secure: false
    },

    // Zoho
    {
        domains: ['zoho.com', 'zohomail.com'],
        host: 'smtp.zoho.com',
        port: 587,
        secure: false
    },

    // GMX
    {
        domains: ['gmx.com', 'gmx.de', 'gmx.net'],
        host: 'mail.gmx.com',
        port: 587,
        secure: false
    },

    // Mail.com
    {
        domains: ['mail.com'],
        host: 'smtp.mail.com',
        port: 587,
        secure: false
    },

    // Yandex
    {
        domains: ['yandex.com', 'yandex.ru', 'ya.ru'],
        host: 'smtp.yandex.com',
        port: 587,
        secure: false
    },

    // AOL
    {
        domains: ['aol.com'],
        host: 'smtp.aol.com',
        port: 587,
        secure: false
    },

    // FastMail
    {
        domains: ['fastmail.com', 'fastmail.fm'],
        host: 'smtp.fastmail.com',
        port: 587,
        secure: false
    },

    // Providers brasileiros
    {
        domains: ['uol.com.br', 'bol.com.br'],
        host: 'smtps.uol.com.br',
        port: 587,
        secure: false
    },

    {
        domains: ['ig.com.br'],
        host: 'smtp.ig.com.br',
        port: 587,
        secure: false
    },

    {
        domains: ['terra.com.br'],
        host: 'smtp.terra.com.br',
        port: 587,
        secure: false
    },

    {
        domains: ['globo.com', 'globomail.com'],
        host: 'smtp.globo.com',
        port: 587,
        secure: false
    },

    // Outros provedores comuns
    {
        domains: ['mail.ru'],
        host: 'smtp.mail.ru',
        port: 587,
        secure: false
    },

    {
        domains: ['163.com', '126.com'],
        host: 'smtp.163.com',
        port: 587,
        secure: false
    },

    {
        domains: ['qq.com'],
        host: 'smtp.qq.com',
        port: 587,
        secure: false
    }
];

export interface SmtpDetectionResult {
    host: string;
    port: number;
    secure: boolean;
    detected: boolean;
    provider?: string;
}

/**
 * Detecta configurações SMTP baseado no domínio do email
 */
export function detectSmtpFromEmail(email: string): SmtpDetectionResult {
    const domain = email.split('@')[1]?.toLowerCase();

    if (!domain) {
        return {
            host: 'smtp.' + domain,
            port: 587,
            secure: false,
            detected: false
        };
    }

    // Procura por provedores conhecidos
    for (const provider of SMTP_PROVIDERS) {
        if (provider.domains.includes(domain)) {
            return {
                host: provider.host,
                port: provider.port,
                secure: provider.secure,
                detected: true,
                provider: domain
            };
        }
    }

    // Se não encontrou um provedor conhecido, tenta deduzir baseado no domínio
    return detectSmtpFromDomain(domain);
}

/**
 * Tenta detectar SMTP baseado apenas no domínio (para domínios personalizados)
 */
function detectSmtpFromDomain(domain: string): SmtpDetectionResult {
    // Padrões comuns para servidores SMTP
    const commonPatterns = [
        `smtp.${domain}`,
        `mail.${domain}`,
        `email.${domain}`,
        `send.${domain}`,
        `outgoing.${domain}`
    ];

    // Por padrão, usa smtp.domain com porta 587 (STARTTLS)
    return {
        host: commonPatterns[0],
        port: 587,
        secure: false,
        detected: false,
        provider: 'auto-detected'
    };
}

/**
 * Valida se um email é válido
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Extrai o domínio de um email
 */
export function extractDomain(email: string): string {
    return email.split('@')[1]?.toLowerCase() || '';
}

/**
 * Verifica se um domínio é de um provedor conhecido
 */
export function isKnownProvider(domain: string): boolean {
    return SMTP_PROVIDERS.some(provider =>
        provider.domains.includes(domain.toLowerCase())
    );
}

/**
 * Busca um provedor SMTP pelo domínio usando DNS MX (simulado - versão futura)
 * Por enquanto, retorna null para implementação futura
 */
export async function lookupMxRecord(_domain: string): Promise<string | null> {
    // TODO: Implementar lookup de MX record em versão futura
    // Esta função pode ser expandida para fazer consultas DNS reais
    return null;
}

/**
 * Detecta SMTP usando subdomínios configurados pelo usuário
 */
export async function detectSmtpWithCustomSubdomains(email: string): Promise<SmtpDetectionResult[]> {
    const domain = email.split('@')[1]?.toLowerCase();

    if (!domain) {
        return [];
    }

    // Primeiro, tenta detectar com provedores conhecidos
    const knownProvider = detectSmtpFromEmail(email);
    const results: SmtpDetectionResult[] = [];

    if (knownProvider.detected) {
        results.push(knownProvider);
    }

    try {
        // Carrega subdomínios das configurações
        const smtpSubdomains = await window.electronAPI?.database?.getSetting('smtp_subdomains');
        const subdomains = (smtpSubdomains || 'smtp.\nmail.\nwebmail.\n@')
            .split('\n')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

        // Gera possíveis hosts baseado nos subdomínios configurados
        for (const subdomain of subdomains) {
            let host: string;

            if (subdomain === '@') {
                // Usar o domínio diretamente
                host = domain;
            } else if (subdomain.endsWith('.')) {
                // Subdomínio + domínio
                host = subdomain + domain;
            } else {
                // Assumir que é um subdomínio completo
                host = subdomain;
            }

            // Adiciona tentativas com porta 587 (STARTTLS) e 465 (SSL)
            if (!results.some(r => r.host === host)) {
                results.push({
                    host,
                    port: 587,
                    secure: false,
                    detected: false,
                    provider: `Custom - ${host}`
                });

                results.push({
                    host,
                    port: 465,
                    secure: true,
                    detected: false,
                    provider: `Custom SSL - ${host}`
                });
            }
        }
    } catch (error) {
        console.warn('Erro ao carregar subdomínios SMTP:', error);
    }

    return results;
}
