# 🤖 GitHub Copilot Coding Agent Configuration - xSendMkt

## 📋 Project Context
xSendMkt é um sistema profissional de marketing por email desenvolvido com **Electron + React + TypeScript**. O agente de codificação deve seguir as diretrizes específicas deste projeto para maximizar a produtividade.

## 🎯 Current Development Focus (v1.1.0)

### 🔥 High Priority Tasks
1. **SMTP Bulk Import Optimization** ✅ (Completed - 94% performance improvement)
2. **Memory Leak Fixes** - Corrigir vazamentos durante envio sequencial 
3. **Domain Validation Enhancement** - Melhorar robustez da validação
4. **Native Menu System** - Implementar menu nativo do Electron

### 🚀 Next Priority (v1.2.0)
- **Email Template Editor** - Editor WYSIWYG avançado
- **Campaign Analytics** - Dashboard de métricas detalhadas
- **A/B Testing** - Sistema de testes A/B para campanhas
- **Cloud Sync** - Sincronização de dados na nuvem

## 🏗️ Technical Architecture

### Stack Overview
```typescript
// Frontend Stack
React 18+ + TypeScript + Tailwind CSS + Vite
// Desktop Framework  
Electron 37+ with native menu integration
// Database
SQLite3 with migration support
// State Management
React Hooks + Context API (avoid Redux unless necessary)
// Testing
Jest + Testing Library + Playwright for E2E
```

### File Structure Standards
```
src/
├── components/          # React components
│   ├── email/          # Email-specific components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── modals/         # Modal dialogs
├── hooks/              # Custom React hooks
├── pages/              # Main page components
├── services/           # Business logic & API calls
├── types/              # TypeScript definitions
└── utils/              # Utility functions

electron/
├── handlers/           # IPC handlers (modular)
├── services/           # Electron services
├── database/           # Database operations
└── utils/              # Electron utilities
```

## 🔧 Coding Standards & Patterns

### TypeScript Best Practices
```typescript
// ✅ Always use strict typing
interface SmtpConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
}

// ✅ Use proper React component typing
const EmailSenderPanel: React.FC<{
  config: SmtpConfig;
  onTest: (config: SmtpConfig) => Promise<TestResult>;
}> = ({ config, onTest }) => {
  // Component implementation
};

// ✅ Custom hooks with proper typing
const useEmailSender = (): {
  configs: SmtpConfig[];
  loading: boolean;
  sendBulkEmails: (emails: string[]) => Promise<void>;
} => {
  // Hook implementation
};
```

### Performance Optimization Patterns
```typescript
// ✅ Use React.memo for expensive components
const EmailList = React.memo<Props>(({ emails }) => {
  // Heavy rendering logic
});

// ✅ Use useCallback for event handlers
const handleEmailSend = useCallback(async (email: string) => {
  await sendEmail(email);
}, [sendEmail]);

// ✅ Use useMemo for heavy computations
const processedEmails = useMemo(() => {
  return emails.filter(email => isValidEmail(email));
}, [emails]);
```

### Electron IPC Communication
```typescript
// ✅ Type-safe IPC in preload script
interface ElectronAPI {
  email: {
    sendBulkEmails: (emails: Email[]) => Promise<BulkResult>;
    testSmtpConfig: (config: SmtpConfig) => Promise<TestResult>;
    saveConfig: (config: SmtpConfig) => Promise<void>;
  };
  database: {
    getConfigs: () => Promise<SmtpConfig[]>;
    saveSettings: (settings: AppSettings) => Promise<void>;
  };
  file: {
    saveToFile: (data: any, path: string) => Promise<void>;
    readFromFile: (path: string) => Promise<any>;
  };
}

// ✅ Usage in React components
const { data: configs } = useQuery('smtp-configs', 
  () => window.electronAPI.email.getConfigs()
);
```

## 🎨 UI/UX Guidelines

### VS Code Theme Integration
```css
/* ✅ Always use CSS variables for theming */
.email-panel {
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-border);
  color: var(--vscode-text);
}

.button-primary {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.input-field {
  background-color: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border);
  color: var(--vscode-input-foreground);
}
```

### Component Design Patterns
```typescript
// ✅ Use consistent component structure
const EmailCampaignForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CampaignData>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = useCallback(async (data: CampaignData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      setErrors(validateForm(data));
    } finally {
      setLoading(false);
    }
  }, [onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form implementation */}
    </form>
  );
};
```

## 🔍 Testing Standards

### Unit Testing
```typescript
// ✅ Test React components
describe('EmailSenderPanel', () => {
  it('should display SMTP configs correctly', () => {
    const configs = [mockSmtpConfig];
    render(<EmailSenderPanel configs={configs} />);
    expect(screen.getByText(configs[0].name)).toBeInTheDocument();
  });
});

// ✅ Test custom hooks
describe('useEmailSender', () => {
  it('should send emails successfully', async () => {
    const { result } = renderHook(() => useEmailSender());
    await act(async () => {
      await result.current.sendBulkEmails(['test@example.com']);
    });
    expect(result.current.loading).toBe(false);
  });
});
```

### E2E Testing with Playwright
```typescript
// ✅ Test critical user flows
test('should complete bulk email import successfully', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('[data-testid="smtp-config-tab"]');
  await page.fill('[data-testid="bulk-email-input"]', 'test@gmail.com:password');
  await page.click('[data-testid="start-import-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## 📊 Performance Monitoring

### Key Metrics to Track
- **Bulk Import Performance**: Target <2 minutes for 1000+ emails
- **Memory Usage**: Monitor for leaks during sequential operations  
- **UI Responsiveness**: Keep main thread responsive during heavy operations
- **Database Performance**: Optimize SQLite queries for large datasets

### Performance Optimization Checklist
- [ ] Use Web Workers for CPU-intensive tasks
- [ ] Implement virtual scrolling for large lists
- [ ] Cache frequently accessed data
- [ ] Use lazy loading for heavy components
- [ ] Optimize bundle size with code splitting

## 🐛 Error Handling Patterns

### Frontend Error Handling
```typescript
// ✅ Use error boundaries for React
class EmailErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Email component error:', error, errorInfo);
    // Log to external service if needed
  }
}

// ✅ Handle async errors properly
const handleAsyncOperation = async () => {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error: error.message };
  }
};
```

### Electron Error Handling
```typescript
// ✅ Handle IPC errors gracefully
ipcMain.handle('send-bulk-emails', async (event, emails) => {
  try {
    const results = await emailService.sendBulkEmails(emails);
    return { success: true, results };
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    return { success: false, error: error.message };
  }
});
```

## 🚀 Deployment & Release Process

### Version Management
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md for each release
- Tag releases with `v` prefix (e.g., `v1.1.0`)

### Build Process
```bash
# Development build
npm run build

# Production build for all platforms
npm run dist

# Platform-specific builds
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

## 📝 Documentation Standards

### Code Documentation
```typescript
/**
 * Sends bulk emails using the configured SMTP settings
 * @param emails - Array of email addresses to send to
 * @param template - Email template configuration
 * @param options - Additional sending options
 * @returns Promise resolving to send results
 */
async function sendBulkEmails(
  emails: string[],
  template: EmailTemplate,
  options: SendOptions = {}
): Promise<BulkSendResult> {
  // Implementation
}
```

### API Documentation
- Document all IPC channels and their parameters
- Provide examples for complex operations
- Maintain up-to-date README with setup instructions

## 🔧 Development Tools Integration

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- Electron Debug
- GitLens
- ESLint + Prettier

### Debugging Configuration
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Electron Main",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/electron/main.js",
      "console": "integratedTerminal"
    }
  ]
}
```

## 🎯 Code Review Guidelines

### What to Look For
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Performance optimizations applied
- [ ] Accessibility considerations
- [ ] Security best practices
- [ ] Test coverage for new features
- [ ] Documentation updates

### Security Checklist
- [ ] Validate all user inputs
- [ ] Sanitize data before database operations
- [ ] Use secure electron settings
- [ ] Avoid exposing sensitive data in logs
- [ ] Implement proper authentication for SMTP

---

**Note for Copilot Coding Agent**: This configuration should guide all code generation, refactoring, and feature implementation. Always prioritize type safety, performance, and maintainability when making changes to the xSendMkt codebase.
