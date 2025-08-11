# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-10

### Added
- **Campaign Editor**: Monaco Editor with HTML editing and live preview
- **Split View Interface**: Resizable editor/preview panels (50/50 initial split)
- **Sidebar Management**: Email lists and SMTP servers in accordion format
- **Resizable Panels**: Vertical (editor/preview) and horizontal (logs) resizers
- **Action Buttons**: Save, Send, Pause with circular badge icons and loading states
- **Real-time Logs**: Bottom panel with campaign activity tracking
- **Status Bar**: Campaign progress, lists count, and recipients display
- **API Toggle**: Mock/Live API switching for development and production
- **VS Code Theme**: Dark theme with custom CSS properties
- **Responsive Design**: Full-height layout that adapts to window size
- **TypeScript**: Full type safety with strict mode enabled
- **Loading States**: Spinners and disabled states for all async actions

### Technical Features
- React 18 + TypeScript + Vite development environment
- TailwindCSS for utility-first styling
- Monaco Editor integration with VS Code dark theme
- Custom hooks for API integration (`useEmailLists`, `useCampaigns`, `useSmtpConfigs`)
- Mock API service with simulated delays for development
- Modular component architecture
- Responsive flexbox layout with proper overflow handling

### UI/UX Improvements
- Removed navigation header for focused campaign editing
- Email lists sidebar with individual selection (no select all/clear)
- SMTP servers with toggle active/inactive functionality
- Form controls (subject, sender) integrated into top bar
- Preview without shadows for flush layout
- Logs panel with clear functionality and scrolling
- Progress indicators and validation states

### Development Tools
- ESLint configuration for React and TypeScript
- Prettier formatting
- Hot reload development server
- Type checking and build verification
- Git repository initialization

## [Unreleased]

### Planned Features
- [ ] Implement list removal on campaign send
- [ ] Add drag-and-drop for email lists reordering
- [ ] Email template library with pre-built templates
- [ ] Campaign analytics dashboard
- [ ] A/B testing functionality
- [ ] Scheduled sending capabilities
- [ ] Email validation and verification
- [ ] Bounce handling and management
- [ ] Unsubscribe link management

### Technical Improvements
- [ ] Unit tests with Jest and React Testing Library
- [ ] E2E tests with Playwright
- [ ] Performance optimization with React.memo
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Internationalization (i18n) support
- [ ] PWA capabilities
- [ ] Docker containerization

---

### Legend
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
