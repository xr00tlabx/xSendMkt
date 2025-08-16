# 🤖 GitHub Copilot Instructions - xSendMkt Project

## 📋 Project Overview
xSendMkt é um sistema profissional de marketing por email desenvolvido com Electron, React e TypeScript. O projeto foca em performance, usabilidade e recursos nativos desktop.

## 🎯 Current Focus Areas

### 🚀 v1.1.0 - Electron Native Features (Current Sprint)
**Priority Tasks:**
1. **SMTP Bulk Import Optimization** ✅ - Melhorar performance de importação de 1000+ emails (COMPLETED - 94% faster)
2. **Memory Leak Fixes** - Corrigir vazamentos durante envio sequencial
3. **Domain Validation** - Implementar validação robusta de domínios
4. **Native Menu System** - Menu nativo do Electron com shortcuts

### 🏗️ Architecture Patterns
- **Frontend:** React 18+ com TypeScript, Tailwind CSS, estilo VS Code
- **Backend:** Electron Main Process com handlers modulares
- **Database:** SQLite para dados locais, eventual cloud sync
- **State Management:** React hooks customizados, Context API
- **Testing:** Jest + Testing Library para frontend, electron-test para e2e

## 🔧 Development Guidelines

### Code Style & TypeScript Best Practices
```typescript
// ✅ Preferred patterns - ALWAYS use strict typing
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

// ✅ Component naming: PascalCase with proper typing
const EmailSenderPanel: React.FC<{
  config: SmtpConfig;
  onTest: (config: SmtpConfig) => Promise<TestResult>;
}> = ({ config, onTest }) => {
  // JSX with proper typing
};

// ✅ Custom hooks with complete type definitions
const useEmailSender = (): {
  configs: SmtpConfig[];
  loading: boolean;
  sendBulkEmails: (emails: string[]) => Promise<void>;
} => {
  // Clear, typed state management
};

// File structure: feature-based organization
src/
  components/
    email/         # Email-related components
    layout/        # Layout components
    modals/        # Modal components
  hooks/           # Custom hooks
  services/        # API and business logic
  types/           # TypeScript definitions
```

### Performance Best Practices
- **Lazy loading** para componentes pesados
- **React.memo** para componentes que re-renderizam frequentemente
- **useCallback/useMemo** para funções e computações caras
- **Virtualization** para listas grandes de emails/SMTPs
- **Web Workers** para operações CPU-intensivas

### Electron Integration
```typescript
// ✅ Proper IPC communication
window.electronAPI?.email?.sendBulkEmails(emails);

// ✅ Type-safe preload script
interface ElectronAPI {
  email: {
    sendBulkEmails: (emails: Email[]) => Promise<Result>;
    testSmtpConfig: (config: SmtpConfig) => Promise<TestResult>;
  };
  database: {
    saveConfig: (config: any) => Promise<void>;
    getSettings: () => Promise<Settings>;
  };
}
```

## 🎨 UI/UX Patterns

### VS Code Theme Integration
```css
/* ✅ Use CSS variables for theme consistency */
.vscode-panel {
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-border);
  color: var(--vscode-text);
}
```

## 📊 Project Management Integration

### Issue Creation
Quando sugerir melhorias, sempre considere:
- **Milestone apropriado** (v1.1.0, v1.2.0, etc.)
- **Story points** estimados (1, 2, 3, 5, 8)
- **Labels corretos** (bug, enhancement, task, etc.)
- **Prioridade** baseada no impact/urgency
- Statistics and analytics dashboard
- API mock toggle for development/production

## Development Guidelines

1. Use TypeScript interfaces for all data types
2. Follow component composition patterns
3. Use custom hooks for data fetching and state management
4. Implement responsive design with TailwindCSS
5. Use Lucide React for icons
6. Maintain separation between mock and real API services

## API Configuration

The application supports both mock and real API modes:
- Mock mode: Uses local mock data with simulated delays
- Real mode: Connects to actual backend API
- Toggle available in header for easy switching

## Component Structure

- `/components/layout`: Header, Sidebar, Layout components
- `/components/forms`: Form components for campaigns, lists, SMTP
- `/components/modals`: Modal dialogs for various actions
- `/pages`: Main page components for routing
- `/services`: API services (mock, real, and unified)
- `/hooks`: Custom React hooks for data management
- `/types`: TypeScript type definitions
- `/utils`: Utility functions
