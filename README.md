# xSendMkt - Email Marketing System

A modern, full-featured email marketing system built with React, TypeScript, and TailwindCSS.

## ✨ Features

### 🎯 **Campaign Management**
- Create and edit email campaigns with rich HTML editor
- Real-time preview of email content
- Send campaigns to multiple email lists
- Pause and resume campaigns
- Campaign statistics and tracking

### 📧 **Email List Management**
- Create and manage multiple email lists
- Import emails in bulk (one per line)
- Automatic email validation
- Compact table view with search and filters
- Visual selection in sidebar with send order

### ⚙️ **SMTP Configuration**
- Configure multiple SMTP servers
- Automatic random server selection for load balancing
- Enable/disable servers individually
- Secure connection support (TLS/SSL)
- Visual status indicators

### 📊 **Statistics & Analytics**
- Campaign performance tracking
- Email delivery statistics
- Open rates and engagement metrics
- Historical data and trends

### 🔧 **Developer Features**
- **Mock API**: Development-friendly data simulation
- **API Toggle**: Easy switch between mock and real API
- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety and IntelliSense
- **Responsive Design**: Works on all device sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
# Clone and navigate to the project
cd xSendMkt

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design system
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor (VS Code editor)
- **HTTP Client**: Axios

### Project Structure
```
src/
├── components/
│   ├── layout/          # Header, Sidebar, Layout components
│   ├── forms/           # Reusable form components
│   └── modals/          # Modal dialogs
├── pages/               # Route-level pages
├── hooks/               # Custom React hooks
├── services/            # API services (mock, real, unified)
├── types/               # TypeScript interfaces
└── utils/               # Utility functions
```

## 🎨 Design System

### Layout
- **Full-width content**: Main content uses entire available width
- **Right sidebar**: Email lists and SMTP servers in compact view
- **Responsive**: Mobile-first design that works on all screens

### UI Components
- **Tables**: Compact, sortable data tables
- **Cards**: Clean, shadowed containers
- **Buttons**: Primary, secondary, and danger variants
- **Forms**: Consistent input styling with validation

### Color Palette
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray shades for text and backgrounds

## 🔌 API Integration

### Mock API (Development)
- Simulated data with realistic delays
- No backend required
- Perfect for frontend development
- Toggle via header switch

### Real API (Production)
- Ready for backend integration
- Axios-based HTTP client
- Error handling and retry logic
- Environment-based configuration

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Workflow
1. **Mock API**: Start with mock data for rapid prototyping
2. **Hot Reload**: See changes instantly as you code
3. **Type Safety**: TypeScript catches errors early
4. **Component Library**: Reuse components across pages

## 📱 Usage Guide

### Creating a Campaign
1. Navigate to the main page
2. Fill in campaign details (subject, sender, HTML content)
3. Select email lists from the sidebar
4. Preview your email content
5. Click "Send Campaign"

### Managing Email Lists
1. Go to "Email Lists" page
2. Click "New List" to create a list
3. Enter list name and email addresses (one per line)
4. Save and use in campaigns

### Configuring SMTP
1. Visit "SMTP Configuration" page
2. Add your SMTP server details
3. Enable/disable servers as needed
4. System automatically selects random active server

### Viewing Statistics
1. Check "Statistics" page for campaign performance
2. View delivery rates, open rates, and engagement
3. Track historical performance trends

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
