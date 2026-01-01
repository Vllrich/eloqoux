# Eloquox

An elegant app for training eloquence. Learn sophisticated words daily with AI-generated examples.

## Features

- **Daily Words**: Get a new eloquent word every day from your chosen categories
- **9 Categories**: Technology, Politics & Society, Psychology, Environment, Languages, Gastronomy, Travel, Medicine, Business
- **Smart Examples**: AI-generated example sentences with highlighted words
- **History**: Track all words you've learned
- **Overview**: See your weekly progress and category breakdown
- **Search**: Find words across your entire learning history
- **Minimalistic Design**: Clean, elegant interface with dark mode support

## Tech Stack

- **Frontend**: React Native (Expo), React Navigation, AsyncStorage
- **Backend**: Express, OpenAI API with TOON format
- **Styling**: NativeWind (Tailwind CSS)

## Setup

### Prerequisites

- Node.js 18+
- OpenAI API key
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd eloquox
```

2. Install client dependencies:
```bash
npm install
```

3. Install server dependencies:
```bash
cd server
npm install
```

4. Create server environment file:
```bash
cd server
cp .env.example .env
```

5. Add your OpenAI API key to `server/.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### Running the App

1. Start the backend server (in one terminal):
```bash
npm run server:dev
```

2. Start the Expo app (in another terminal):
```bash
npm start
```

3. Scan the QR code with Expo Go (iOS/Android) or press `w` for web

## Usage

1. **First Launch**: 
   - Welcome screen with logo and "say it better" slogan
   - Select 1-3 categories of interest

2. **Daily Word Screen**:
   - View the word, definition, and category
   - Read example sentences (word is highlighted)
   - Tap "Show More Examples" for additional AI-generated examples
   - Actions: **Next** (save & get new word), **Skip** (skip without saving), **Change Topic** (pick different category)

3. **History Tab**:
   - Browse all words you've learned
   - Tap any word to see full details and examples

4. **Overview Tab**:
   - See weekly word count
   - View total words learned
   - Category breakdown with visual bars
   - Your selected interests

5. **Search Tab**:
   - Search across words, definitions, and examples
   - Tap results to view full details

## TOON Format

This app uses the [TOON format](https://github.com/toon-format/toon) for OpenAI API responses, which significantly reduces token usage compared to JSON while maintaining readability.

Example TOON response:
```toon
word{term,category,definition,examples[3]{sentence,context}}:
  eloquent,Languages and linguistics,"Fluent and persuasive",[
    "She delivered an eloquent speech.",Standing ovation
    "His eloquent defense convinced the jury.",Courtroom
  ]
```

## Architecture

- **Local Storage**: User preferences and word history stored with AsyncStorage
- **Backend API**: Express server handles OpenAI requests
- **Navigation**: Bottom tabs (History, Today, Overview, Search)
- **Theming**: Global CSS variables with light/dark mode support

## License

MIT
