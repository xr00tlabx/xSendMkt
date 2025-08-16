import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EmailValidationResult {
    email: string;
    isValid: boolean;
    error?: string;
}

interface EmailValidatorProps {
    emails: string[];
    onValidationComplete: (validEmails: string[], invalidEmails: EmailValidationResult[]) => void;
    showPreview?: boolean;
    maxPreview?: number;
}

const EmailValidator: React.FC<EmailValidatorProps> = ({
    emails,
    onValidationComplete,
    showPreview = true,
    maxPreview = 10
}) => {
    const [validationResults, setValidationResults] = useState<EmailValidationResult[]>([]);
    const [isValidating, setIsValidating] = useState(false);

    const validateEmail = (email: string): EmailValidationResult => {
        const trimmedEmail = email.trim();
        
        if (!trimmedEmail) {
            return { email: trimmedEmail, isValid: false, error: 'Email vazio' };
        }

        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(trimmedEmail)) {
            return { email: trimmedEmail, isValid: false, error: 'Formato inválido' };
        }

        // Additional validations
        if (trimmedEmail.length > 254) {
            return { email: trimmedEmail, isValid: false, error: 'Email muito longo' };
        }

        const [localPart, domain] = trimmedEmail.split('@');
        
        if (localPart.length > 64) {
            return { email: trimmedEmail, isValid: false, error: 'Parte local muito longa' };
        }

        if (domain.length > 253) {
            return { email: trimmedEmail, isValid: false, error: 'Domínio muito longo' };
        }

        // Check for consecutive dots
        if (trimmedEmail.includes('..')) {
            return { email: trimmedEmail, isValid: false, error: 'Pontos consecutivos' };
        }

        return { email: trimmedEmail, isValid: true };
    };

    useEffect(() => {
        if (emails.length === 0) {
            setValidationResults([]);
            onValidationComplete([], []);
            return;
        }

        setIsValidating(true);
        
        // Validate emails with a small delay to prevent blocking UI
        const validateEmails = async () => {
            const results: EmailValidationResult[] = [];
            const uniqueEmails = new Set<string>();
            
            for (const email of emails) {
                const result = validateEmail(email);
                
                // Check for duplicates
                if (result.isValid) {
                    const lowerEmail = result.email.toLowerCase();
                    if (uniqueEmails.has(lowerEmail)) {
                        result.isValid = false;
                        result.error = 'Email duplicado';
                    } else {
                        uniqueEmails.add(lowerEmail);
                    }
                }
                
                results.push(result);
            }
            
            setValidationResults(results);
            
            const validEmails = results
                .filter(result => result.isValid)
                .map(result => result.email);
            
            const invalidEmails = results.filter(result => !result.isValid);
            
            onValidationComplete(validEmails, invalidEmails);
            setIsValidating(false);
        };

        const timeout = setTimeout(validateEmails, 100);
        return () => clearTimeout(timeout);
    }, [emails, onValidationComplete]);

    const validCount = validationResults.filter(result => result.isValid).length;
    const invalidCount = validationResults.length - validCount;
    const duplicateCount = validationResults.filter(result => result.error === 'Email duplicado').length;

    return (
        <div className="space-y-4">
            {/* Validation Stats */}
            <div className="flex items-center justify-between p-3 bg-[var(--vscode-editor-background)] border border-[var(--vscode-border)] rounded">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-[var(--vscode-text)]">
                            {validCount} válidos
                        </span>
                    </div>
                    
                    {invalidCount > 0 && (
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-[var(--vscode-text)]">
                                {invalidCount} inválidos
                            </span>
                        </div>
                    )}
                    
                    {duplicateCount > 0 && (
                        <div className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-[var(--vscode-text)]">
                                {duplicateCount} duplicados
                            </span>
                        </div>
                    )}
                </div>

                {isValidating && (
                    <div className="text-xs text-[var(--vscode-text-muted)]">
                        Validando...
                    </div>
                )}
            </div>

            {/* Email Preview */}
            {showPreview && validationResults.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[var(--vscode-text)]">
                        Preview dos Emails
                    </h4>
                    
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {validationResults.slice(0, maxPreview).map((result, index) => (
                            <div
                                key={index}
                                className={`
                                    flex items-center justify-between p-2 rounded text-sm
                                    ${result.isValid 
                                        ? 'bg-green-500 bg-opacity-10 text-green-400' 
                                        : 'bg-red-500 bg-opacity-10 text-red-400'
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-2">
                                    {result.isValid ? (
                                        <CheckCircle className="h-3 w-3" />
                                    ) : (
                                        <AlertTriangle className="h-3 w-3" />
                                    )}
                                    <span className="font-mono">{result.email}</span>
                                </div>
                                
                                {!result.isValid && result.error && (
                                    <span className="text-xs opacity-75">
                                        {result.error}
                                    </span>
                                )}
                            </div>
                        ))}
                        
                        {validationResults.length > maxPreview && (
                            <div className="text-xs text-[var(--vscode-text-muted)] text-center py-2">
                                ... e mais {validationResults.length - maxPreview} emails
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Invalid Emails Summary */}
            {invalidCount > 0 && (
                <div className="p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-[var(--vscode-text)]">
                            Emails com problemas encontrados
                        </span>
                    </div>
                    
                    <div className="text-xs text-[var(--vscode-text-muted)]">
                        {invalidCount} emails serão ignorados durante o envio. 
                        Verifique os formatos e remova duplicatas se necessário.
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailValidator;
