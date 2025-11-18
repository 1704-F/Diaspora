# Diaspora Platform - Frontend

Frontend application for the Diaspora Management Platform built with React, TypeScript, and Material-UI.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── app/               # App configuration
│   │   └── store.ts       # Redux store
│   ├── features/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── dashboard/    # Dashboard
│   │   ├── members/      # Members management
│   │   ├── finances/     # Financial management
│   │   └── ...
│   ├── shared/            # Shared components
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utility functions
│   ├── services/          # API services
│   ├── config/            # Configuration
│   │   ├── theme.ts      # MUI theme
│   │   └── i18n.ts       # Internationalization
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Entry point
└── package.json
```

## 🎨 Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI** - UI Framework
- **React Router** - Routing
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **i18next** - Internationalization
- **Recharts** - Charts and graphs

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## 🌍 Internationalization

The app supports multiple languages (French and English by default). Translation files are in `src/config/i18n.ts`.

## 📦 Build

```bash
# Build for production
npm run build

# The build output will be in the `dist` folder
```

## 🔧 Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `VITE_API_URL`: Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `VITE_APP_NAME`: Application name

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter and tests
5. Submit a pull request

## 📄 License

MIT
