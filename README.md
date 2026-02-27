# Eloquox

An elegant app for training eloquence. Learn sophisticated words daily with AI-generated examples, spaced repetition quizzes, and streak tracking.

## Features

- **Daily Words**: Swipe right to save, left to skip -- or use the buttons. First-time swipe tutorial included.
- **9 Categories**: Technology, Politics & Society, Psychology, Environment, Languages, Gastronomy, Travel, Medicine, Business
- **Smart Examples**: AI-generated example sentences with highlighted words. Tap "Show More" for additional examples.
- **Pronunciation**: Tap the speaker icon to hear each word spoken aloud
- **Synonyms & Antonyms**: Displayed as pill chips below the definition
- **Etymology**: Word origin shown in italic beneath the definition
- **Favorites**: Tap the heart icon to favorite words. Filter your history by favorites.
- **Spaced Repetition Quiz**: Flashcard review with increasing intervals (1, 2, 4, 8, 16, 32, 64 days). Words enter the quiz deck when saved.
- **Streak Tracker**: Current streak and longest streak displayed on the Overview tab
- **Progress Milestones**: 10 achievements across word count and streak length with progress bars
- **Daily Push Notifications**: Configurable reminder time in Settings (local notifications, no server needed)
- **History & Search**: Browse all saved words with inline search and favorites filter
- **Dark Mode**: Automatic light/dark theme based on system preference

## Navigation

5 bottom tabs: **History** | **Quiz** | **Today** (default) | **Overview** | **Settings**

## Tech Stack

- **Frontend**: React Native (Expo 54), React Navigation, AsyncStorage, Reanimated, Gesture Handler
- **Backend**: Supabase Edge Functions, OpenAI API with TOON format
- **Audio**: expo-speech (TTS)
- **Notifications**: expo-notifications (local)
- **Haptics**: expo-haptics (swipe feedback)
- **Styling**: NativeWind (Tailwind CSS)

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd eloquox
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
npm start
```

Scan the QR code with Expo Go (iOS/Android) or press `w` for web.

## Usage

1. **First Launch**: Welcome screen, then select 1-3 categories of interest.

2. **Today Tab**: View a word with definition, etymology, synonyms/antonyms, and examples. Swipe right to save, left to skip. Tap the speaker icon to hear pronunciation. Tap the heart to favorite.

3. **Quiz Tab**: Review saved words as flashcards. Tap to reveal the definition, then mark "Got It" (doubles review interval) or "Review Again" (resets to 1 day).

4. **History Tab**: Browse saved words with search and All/Favorites filter. Tap any word for full details.

5. **Overview Tab**: Current streak, longest streak, weekly count, total words, milestone progress bars, and category breakdown.

6. **Settings Tab**: Toggle daily push notifications with configurable reminder hour. Clear all data.

## TOON Format

This app uses the [TOON format](https://github.com/toon-format/toon) for OpenAI API responses, reducing token usage compared to JSON.

Example TOON response:

```toon
word{term,category,definition,etymology,synonyms[3],antonyms[2],examples[3]{sentence,context}}:
  eloquent,Languages and linguistics,"Fluent and persuasive","From Latin eloquens, meaning speaking out",[articulate,expressive,fluent],[inarticulate,stammering],[
    "She delivered an eloquent speech.",Standing ovation
    "His eloquent defense convinced the jury.",Courtroom
  ]
```

## Architecture

- **Local Storage**: AsyncStorage for preferences, word history, streak, quiz cards, milestones
- **Backend**: Supabase Edge Functions proxy OpenAI requests
- **Navigation**: Bottom tabs (History, Quiz, Today, Overview, Settings)
- **Theming**: Light/dark mode via system preference

## License

MIT
