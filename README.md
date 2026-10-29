# OkNeighbour

Hyper-local social app: posts, people, businesses, events and news for the place you choose.
Expo SDK 57 · React Native 0.86 · Expo Router (native tabs) · React 19 + React Compiler · Reanimated 4.

## First run

```bash
npm install
npx expo install --fix      # snaps every Expo package to the exact SDK 57 patch versions
npx expo-doctor             # must pass before building
npm run typecheck           # tsc (typed routes are generated on first `expo start`)
npm test                    # unit tests for the pure logic (HTML parser, places, formatting, tokens)

npx expo run:ios            # or: npx expo run:android   (development build; Expo Go is not used)
```

`MIGRATION.md` explains what changed from the previous app, every bug found, and the checks still to do on a real device.

## Backend

Unchanged: `https://huddle-backend-7xzt.onrender.com/`. Override with `EXPO_PUBLIC_API_URL` (must end with `/`).
No endpoints were added or invented. All calls live in `src/api/`.

## Structure

```
src/app/                 Expo Router routes
  (auth)/                welcome, login, register           (signed out)
  complete-profile.tsx   first-time profile setup           (signed in, not verified)
  (app)/(tabs)/          Home feed, Explore, Profile        (native tab bar)
  (app)/post/[ref]       post + comments
  (app)/u/[ref]          another person's profile
  (app)/compose          new post (rich text + photos)
  (app)/location         choose / search location
  (app)/edit-profile
src/api/                 axios client (single-flight token refresh), endpoints, types
src/providers/           session (auth), location, app composition
src/components/          ui/ primitives, feed/, discover/, profile/, compose/, auth/
src/constants/theme.ts   design tokens (colour, type, spacing, radius, shadow)
src/lib/                 pure logic (html parser, places, format, storage) - unit tested
```

Auth gating uses `Stack.Protected` in the root layout, so signing in/out switches stacks automatically.

## Design system

Brand: the lime "OK" hand (`#81BE1C`) on deep evergreen (`#0E2A1D`) over warm paper (`#F6F4EC`), with a full dark theme.
Type: Lexend (headings) + Inter (body); 7 font files instead of the previous 27.
Everything themed goes through `useTheme()` / `ThemedText` / `ThemedView`; add colours in `theme.ts` (both palettes).
