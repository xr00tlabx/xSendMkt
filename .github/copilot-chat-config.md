# 💬 GitHub Copilot Chat Configuration - xSendMkt

## 🎯 Optimized Chat Commands for xSendMkt Development

### 📋 Project Context Commands

#### Get Project Overview
```
@workspace Can you explain the overall architecture of this Electron + React email marketing application?
```

#### Understand Current Implementation
```
@workspace Show me how SMTP configuration and bulk email sending is currently implemented
```

#### Performance Analysis
```
@workspace Analyze the performance optimizations in the SMTP bulk import feature and suggest improvements
```

### 🔧 Development Assistance Commands

#### TypeScript Help
```
@workspace Help me create proper TypeScript interfaces for [specific feature]

@workspace Review this code for TypeScript strict mode compliance

@workspace Generate type definitions for this Electron IPC communication
```

#### React Component Generation
```
@workspace Create a React component for [feature] following the project's patterns with proper TypeScript typing

@workspace Optimize this React component for performance using React.memo and hooks

@workspace Create a responsive form component using Tailwind CSS that matches the VS Code theme
```

#### Electron Development
```
@workspace Create an IPC handler for [operation] with proper error handling and type safety

@workspace Help me implement secure Electron preload script for [functionality]

@workspace Review this Electron main process code for security best practices
```

### 🚀 Performance Optimization Commands

#### Performance Review
```
@workspace Analyze this code for potential performance bottlenecks and memory leaks

@workspace Suggest optimizations for handling large datasets (1000+ emails) efficiently

@workspace How can I implement virtual scrolling for this email list component?
```

#### Memory Management
```
@workspace Review this code for memory leaks and suggest cleanup strategies

@workspace How can I optimize memory usage during bulk email processing?

@workspace Implement garbage collection hints and memory cleanup for this feature
```

### 🧪 Testing Commands

#### Test Generation
```
@workspace Generate comprehensive Jest unit tests for this service class

@workspace Create Playwright E2E tests for the complete email campaign workflow

@workspace Write integration tests for this Electron IPC communication
```

#### Test Review
```
@workspace Review my test coverage and suggest additional test cases

@workspace How can I mock Electron APIs in my Jest tests?

@workspace Create performance tests for this bulk processing feature
```

### 🔒 Security Commands

#### Security Review
```
@workspace Review this code for security vulnerabilities and suggest improvements

@workspace How can I securely store SMTP credentials in this Electron app?

@workspace Implement input validation and sanitization for this form
```

#### Electron Security
```
@workspace Review my Electron security configuration and suggest improvements

@workspace How can I implement secure IPC communication for sensitive data?

@workspace Check this preload script for security best practices
```

### 🎨 UI/UX Commands

#### Component Styling
```
@workspace Style this component to match the VS Code theme using Tailwind CSS

@workspace Create a responsive layout for this email configuration panel

@workspace Implement loading states and error handling for this UI component
```

#### Accessibility
```
@workspace Add proper ARIA labels and accessibility features to this component

@workspace Review this UI for accessibility compliance

@workspace Implement keyboard navigation for this interface
```

### 📊 Code Analysis Commands

#### Code Quality
```
@workspace Refactor this code to follow better patterns and reduce complexity

@workspace How can I extract reusable logic from this component into custom hooks?

@workspace Review this code for maintainability and suggest improvements
```

#### Architecture Review
```
@workspace How can I better organize this code following the project's file structure?

@workspace Suggest improvements to this service class architecture

@workspace Review the data flow in this feature and suggest optimizations
```

### 🐛 Debugging Commands

#### Error Analysis
```
@workspace Help me debug this TypeScript error: [error message]

@workspace Why is this React component re-rendering unnecessarily?

@workspace Analyze this Electron crash and suggest fixes
```

#### Performance Debugging
```
@workspace This operation is slow, help me identify the bottleneck

@workspace Why is this component causing memory leaks?

@workspace Analyze the performance of this database query
```

### 📚 Documentation Commands

#### Code Documentation
```
@workspace Add comprehensive JSDoc comments to this class

@workspace Generate API documentation for these Electron IPC channels

@workspace Create usage examples for this custom hook
```

#### Project Documentation
```
@workspace Help me update the README with new feature information

@workspace Create user documentation for this new feature

@workspace Generate technical documentation for this implementation
```

### 🔄 Refactoring Commands

#### Code Improvement
```
@workspace Refactor this class-based component to use React hooks

@workspace Convert this JavaScript code to TypeScript with proper typing

@workspace Extract common patterns from these components into reusable utilities
```

#### Performance Refactoring
```
@workspace Refactor this code to use React.memo and optimize re-renders

@workspace Implement caching strategy for this expensive operation

@workspace Optimize this database query for better performance
```

### 📦 Dependency Management

#### Package Analysis
```
@workspace Review my package.json and suggest optimizations or security updates

@workspace Help me choose the best library for [specific functionality]

@workspace Analyze bundle size and suggest ways to reduce it
```

### 🚀 Feature Development

#### Feature Planning
```
@workspace Help me plan the implementation of [new feature] following the project's architecture

@workspace Break down this complex feature into smaller, manageable tasks

@workspace Suggest the best approach to implement [specific functionality]
```

#### Integration Help
```
@workspace How can I integrate [new technology/library] into this Electron + React app?

@workspace Help me implement real-time updates for this feature

@workspace How can I add offline support to this functionality?
```

## 🎯 Best Practices for Copilot Chat

### Context Providing
Always include relevant context when asking questions:
- Mention the specific technology stack (Electron + React + TypeScript)
- Reference existing performance requirements
- Include file paths and component names
- Mention any constraints or requirements

### Specific Prompts
Use specific, actionable prompts:
```
✅ Good: "Create a TypeScript interface for SMTP configuration with validation"
❌ Vague: "Help with email stuff"
```

### Follow-up Questions
Use follow-up questions to refine solutions:
```
@workspace How can I make this implementation more performant?
@workspace What security considerations should I add?
@workspace How would you test this functionality?
```

### Project-Aware Requests
Reference project-specific patterns:
```
@workspace Following the existing patterns in this codebase, how should I implement [feature]?
@workspace Using the same architecture as the SMTP configuration, create [new feature]
```

## 📋 Quick Reference Commands

### Most Used Commands
1. `@workspace Explain this code` - Understand existing implementation
2. `@workspace Create [component] with TypeScript` - Generate new code
3. `@workspace Optimize this for performance` - Improve existing code
4. `@workspace Review for security issues` - Security analysis
5. `@workspace Generate tests for this` - Test creation
6. `@workspace Fix this TypeScript error` - Debug issues
7. `@workspace Refactor to use hooks` - Code modernization
8. `@workspace Add error handling` - Improve robustness

### Emergency Debugging
```
@workspace This code is causing a memory leak, help me fix it
@workspace The app crashes when I do [action], help me debug
@workspace This performance issue is blocking release, urgent help needed
```

---

**Pro Tip**: Always start your questions with `@workspace` to give Copilot full context of your project structure and existing code patterns.
