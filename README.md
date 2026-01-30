# 🍽️ Shift Scheduler

Restaurant shift scheduling application built with React, TypeScript, and AI-powered scheduling assistance.

## ✨ Features

- **📅 Schedule Management** - Create and manage employee shifts
- **👥 Employee Management** - Add, edit, and organize staff
- **🤖 AI Scheduling** - Generate optimized schedules using AI
- **💬 Natural Language** - Chat with AI to create schedules
- **📱 Responsive Design** - Works on desktop and mobile
- **💾 Local Storage** - Data persists locally
- **📤 Export/Import** - Backup and restore schedules

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/razeo/shift-scheduler.git
cd shift-scheduler

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your API key to .env.local
# VITE_MINIMAX_API_KEY=your_api_key

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
shift-scheduler/
├── src/
│   ├── components/       # React components
│   │   ├── Layout/      # Layout components
│   │   ├── Schedule/    # Schedule grid components
│   │   ├── Sidebar/     # Sidebar navigation
│   │   ├── Chat/        # AI chat interface
│   │   ├── Modals/      # Modal dialogs
│   │   └── Common/      # Shared components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── assets/          # Static assets
├── tests/               # Test files
├── docs/                # Documentation
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **date-fns** - Date utilities
- **MiniMax API** - AI scheduling

## 📝 API Configuration

The app uses MiniMax API for AI-powered scheduling. Get your API key at:

- [MiniMax Platform](https://platform.minimax.io/)

Add your key to `.env.local`:
```env
VITE_MINIMAX_API_KEY=your_api_key_here
```

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize colors:
```js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9', // Your primary color
      },
    },
  },
}
```

### Adding New Roles

Edit `src/types/index.ts`:
```typescript
export enum Role {
  SERVER = 'Server',
  CHEF = 'Chef',
  BARTENDER = 'Bartender',
  YOUR_NEW_ROLE = 'Your New Role',
}
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open a GitHub issue.

---

Built with ❤️ for restaurant managers
