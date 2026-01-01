# Quick Start Guide

## Setup (5 minutes)

1. **Install dependencies**:
```bash
npm install
cd server && npm install && cd ..
```

2. **Configure OpenAI**:
```bash
cd server
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. **Start the backend** (Terminal 1):
```bash
npm run server:dev
```

4. **Start the app** (Terminal 2):
```bash
npm start
```

5. **Open the app**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## First Use

1. **Welcome Screen** - Tap "Get Started"
2. **Select Categories** - Choose 1-3 topics (e.g., Technology, Languages, Psychology)
3. **Daily Word** - Your first eloquent word appears!

## App Navigation

- **📚 History** - Browse all learned words
- **💬 Today** - Current word with examples (tap "Show More Examples" for more)
- **📊 Overview** - Weekly stats and progress
- **🔍 Search** - Find words in your history

## Action Buttons

- **Next** - Save word & get a new one
- **Skip** - Get new word without saving
- **Change Topic** - Pick a different category

## Tips

- Words are highlighted in examples with the accent color
- All data is stored locally on your device
- The backend uses TOON format to reduce OpenAI token costs
- Dark mode follows your system preference

Enjoy expanding your vocabulary! 💬



