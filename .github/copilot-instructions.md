<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# xSendMkt - Email Marketing System

This is a React TypeScript application with TailwindCSS for email marketing campaigns.

## Architecture

- **Frontend**: React with TypeScript, TailwindCSS, React Router
- **API**: Mock API service with toggle to real API
- **Components**: Modular component structure with layout, forms, and modals
- **State Management**: React hooks and custom hooks for data fetching

## Key Features

- Email campaign creation with HTML editor (Monaco Editor)
- Email list management with sidebar selection
- SMTP server configuration with random selection
- Real-time preview of email content
- Campaign sending with pause/resume functionality
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
