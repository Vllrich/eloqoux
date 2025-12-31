# Eloqoux

A full-stack mobile application built with Expo (React Native), Express backend, Supabase, and Tailwind CSS.

## Tech Stack

- **Mobile**: Expo (React Native) + TypeScript
- **Backend**: Node.js/Express + TypeScript
- **Database**: Supabase
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS (NativeWind)

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (installed globally or via npx)
- Supabase account and project

## Setup

### 1. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
PORT=3000

# Supabase Service Role Key (for server-side operations)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Run the Mobile App

```bash
npm start
# Then press 'i' for iOS or 'a' for Android
```

### 4. Run the Backend Server

```bash
npm run server:dev
```

The server will run on `http://localhost:3000` by default.

## Project Structure

```
.
├── src/                 # Mobile app source code
│   └── lib/
│       └── supabase.ts  # Supabase client configuration
├── server/              # Backend server
│   ├── src/
│   │   ├── index.ts     # Express server entry point
│   │   └── lib/
│   │       └── supabase.ts  # Server-side Supabase client
│   └── package.json
├── App.tsx              # Main app component
├── global.css           # Tailwind CSS styles
├── babel.config.js      # Babel configuration with NativeWind
├── metro.config.js      # Metro bundler configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Root package.json

```

## Available Scripts

### Mobile App
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

### Backend Server
- `npm run server:dev` - Start development server with hot reload
- `npm run server:build` - Build TypeScript to JavaScript
- `npm run server:start` - Start production server

## Development

### Mobile Development
The app uses NativeWind v4 for Tailwind CSS styling. Styles are applied using className props on React Native components.

### Backend Development
The Express server is located in the `server/` directory and uses TypeScript. The server automatically restarts on file changes when running in development mode.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Add them to your `.env` file
4. For server-side operations, use the service role key (keep it secure!)

## License

Private

