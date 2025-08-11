# Contributing to xSendMkt

Thank you for your interest in contributing to xSendMkt! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git
- VS Code (recommended)

### Setup Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd xSendMkt

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Prettier with default settings
- **Linting**: ESLint with React and TypeScript rules
- **Naming**: PascalCase for components, camelCase for functions/variables

### Component Development
- Use functional components with hooks
- Define TypeScript interfaces for all props
- Follow existing component structure and patterns
- Implement proper loading and error states

### Styling Approach
- **Primary**: TailwindCSS utility classes
- **Theme**: VS Code dark theme variables
- **Responsive**: Mobile-first with `md:` breakpoints
- **Layout**: Flexbox with proper overflow handling

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── modals/         # Modal dialogs
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

### Key Patterns
- **API Layer**: Mock/Real API toggle for development
- **Custom Hooks**: Data fetching and state management
- **Responsive Layout**: Full-height viewport with resizable panels
- **Theme System**: CSS custom properties for VS Code styling

## 🎯 Feature Development

### Adding New Features
1. **Plan**: Discuss feature in issues before implementation
2. **Types**: Define TypeScript interfaces in `src/types/`
3. **Mock Data**: Add test data to `src/services/mockApi.ts`
4. **Components**: Build following existing patterns
5. **Integration**: Test with both mock and real API modes

### UI/UX Guidelines
- Maintain VS Code-like appearance and behavior
- Ensure all interactive elements have loading states
- Implement proper keyboard navigation
- Test responsive behavior on different screen sizes

## 🧪 Testing

### Manual Testing Checklist
- [ ] All features work in mock API mode
- [ ] Layout is responsive and fills viewport
- [ ] Resizable panels function correctly
- [ ] Loading states appear during actions
- [ ] Error states are handled gracefully
- [ ] TypeScript compiles without errors

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## 📝 Pull Request Process

### Before Submitting
1. **Branch**: Create feature branch from `main`
2. **Code**: Follow existing patterns and style
3. **Test**: Verify all functionality works
4. **Clean**: Remove console.logs and debug code

### PR Requirements
- Clear title and description
- Reference related issues
- Include screenshots for UI changes
- Ensure CI checks pass
- Request review from maintainers

### Commit Messages
Use conventional commit format:
```
feat: add email template library
fix: resolve monaco editor resize issue
docs: update API documentation
style: improve button hover states
```

## 🐛 Bug Reports

### Issue Template
```
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

### Proposal Format
- **Problem**: What issue does this solve?
- **Solution**: Proposed implementation approach
- **Alternatives**: Other options considered
- **Impact**: How this affects existing users

## 🎨 Design Contributions

### UI/UX Improvements
- Maintain VS Code theme consistency
- Consider accessibility requirements
- Ensure responsive design
- Follow existing component patterns

### Assets and Icons
- Use Lucide React icon library
- Maintain consistent sizing (h-4 w-4 for most icons)
- Follow circular badge pattern for action buttons

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Language Service](https://code.visualstudio.com/docs/languages/typescript)

## 🤝 Community

### Getting Help
- Open an issue for bugs or questions
- Join discussions for feature planning
- Check existing issues before creating new ones

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow GitHub's community guidelines

## 🚀 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Deployment
- `main` branch deploys to production
- Feature branches for development
- Release tags for version tracking

Thank you for contributing to xSendMkt! 🎉
