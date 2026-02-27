# Eloquox

Vocabulary learning app built with Expo SDK 54 (React Native), Supabase (auth + edge functions), and OpenAI.

## Architecture

Feature-sliced architecture under `src/`:

- `src/app/` — App shell: AuthContext, AppNavigator, providers
- `src/features/<name>/screens/` — Feature screens (daily-word, quiz, history, overview, search, settings, auth, onboarding)
- `src/shared/components/` — Reusable UI components (WordCard, ExampleSentence, StatsCard, ErrorBoundary)
- `src/shared/lib/` — Utilities (colors, supabase client)
- `src/shared/types/` — Shared TypeScript type definitions
- `src/services/api.ts` — Centralized Supabase edge function calls
- `src/services/storage/` — AsyncStorage layer split by domain (wordStorage, quizStorage, statsStorage, preferencesStorage)
- `server/` — Express.js backend (OpenAI integration, TOON format)

## Code style

- TypeScript strict mode, no `any` unless absolutely necessary
- ES module imports (import/export), destructure when possible
- React functional components only, no class components (except ErrorBoundary)
- Styling via NativeWind (Tailwind) + inline React Native style objects
- Use `getColors(isDark)` from `shared/lib/colors` for theming

## Commands

- `npx expo start` — Start dev server
- `npx expo start --clear` — Start with cache cleared
- `npm test` — Run Jest tests
- `npm test -- --watchAll=false` — Run tests once (CI mode)
- `cd server && npm run dev` — Start backend dev server

## Important conventions

- NEVER import directly from storage sub-modules; always import from `services/storage` (the barrel index)
- API calls to Supabase edge functions go through `services/api.ts`, not inline in screens
- New features get their own folder under `src/features/<name>/`
- Shared components used by 2+ features belong in `src/shared/components/`
- Feature-specific components belong in `src/features/<name>/components/`
- Auth state is managed via React Context in `src/app/AuthContext.tsx`
- Local data is stored via AsyncStorage; Supabase is only used for auth
