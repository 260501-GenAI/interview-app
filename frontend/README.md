# Interview Prep Frontend

A modern React frontend for the Interview Preparedness Application built with:
- **Vite** - Fast build tooling
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui patterns** - Component design system
- **Framer Motion** - Dynamic animations
- **Web Speech API** - Voice recording (Chrome required)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Features

- 🎙️ **Voice Recording** - Web Speech API for real-time transcription
- 🌙 **Dark Mode** - Elegant dark theme by default
- ✨ **Animations** - Smooth page transitions and micro-interactions
- 💎 **Glassmorphism** - Modern card effects
- 📱 **Responsive** - Mobile-friendly design

## Project Structure

```
src/
├── api/             # API client
├── components/      # UI components
│   ├── ui/          # Base components (Button, Card)
│   └── ...          # Feature components
├── hooks/           # Custom React hooks
└── lib/             # Utilities
```

## Requirements

- **Google Chrome** - Required for Web Speech API
- Backend running at `http://localhost:8000`
