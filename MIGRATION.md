# Migration & audit report

Old app: Expo SDK 53 / RN 0.79 / `app/` + JS. New app: Expo SDK 57 / RN 0.86 / `src/app/` + strict TypeScript, built on the supplied boilerplate.

## Read this first: what has and has not been verified

This work was done in a sandbox with **no access to the npm registry**, so `npm install`, `expo prebuild`, Metro, and a simulator/emulator could not be run.

| Check | Status |
|---|---|
| Pure logic (HTML parser, place derivation, formatting, token expiry, local-first ranking) | ✅ 10 unit tests pass (`npm test`) |
| TypeScript across all 80 source files (imports between files, props, models, strict null checks) | ✅ clean, against stubbed third-party types |
| Every `require()` asset exists; every route target exists | ✅ |
| Expo Router / NativeTabs / `expo-image-picker` APIs and config-plugin options | ✅ checked against the SDK 57 docs |
| Third-party **types** (RN, expo-*, tentap, reanimated) | ⚠️ not checked - run `npm run typecheck` |
| `npm install`, `expo-doctor`, native builds on Android + iOS, runtime behaviour | ❌ **not run - you must do this** |
| Backend response shapes | ⚠️ inferred from the old code (see below) |

Do these in order: `npm install` → `npx expo install --fix` → `npx expo-doctor` → `npm run typecheck` → `npx expo run:ios` / `run:android`. Expect to fix a handful of small type/props mismatches on first typecheck; none should be structural.

**Dependency versions.** I could confirm SDK 57 packages use the unified `~57.x` scheme and `expo-image-picker ~57.0.2`, but not exact patches for new packages, so they are `~57.0.0` ranges. `expo install --fix` corrects them. `react-native-webview` and `@10play/tentap-editor` are not Expo-versioned; tentap (^0.6.1, same as before) is the riskiest dependency on RN 0.86 and is isolated in `components/compose/rich-editor.tsx`.

## What was preserved (same backend, same behaviour)

Login/register/JWT refresh · location-scoped feed · post detail + comments · create post with images · profile (own/other) · profile completion + edit · people, businesses, events, news discovery · image/video posts · light/dark.
Place naming keeps the old precedence (`town > village > county > city`) so existing posts and profiles still match.

## Bugs found in the old app (fixed)

1. **Token refresh race**: parallel requests each refreshed with a rotating token; one would fail and log the user out. Now single-flight.
2. Refresh crashed if the backend didn't return a new refresh token (`setItem(undefined)`). Now keeps the old one.
3. `verifyaccount` used `showToast` without importing it (ReferenceError).
4. `createPost(post)` was called with a string in two places (feed tab, preview screen) - broken signature; the preview screen was unreachable.
5. Rich-text minimum was **60** characters in code but the message said 10. Now `POST_MIN_LENGTH = 10` (`constants/config.ts`) - change if the backend needs more.
6. Toasts only worked on Android (`ToastAndroid`). Now cross-platform.
7. Image uploads sent MIME `image/jpg` (invalid). Now real MIME from the picker.
8. News URL wasn't URL-encoded (cities with spaces).
9. Feed never loaded if location permission was denied (stuck skeleton). Now: choose/search a place manually.
10. 2-second artificial delay before profile fetch; removed. Dead `useAxios.jsx` (wrong refresh URL) removed.
11. Code imported `@react-navigation/*` directly - not allowed from SDK 56+; now only `expo-router`.
12. Registration only showed a generic error; now shows the server's field error (e.g. "username taken").
13. A personal-photo "default avatar" asset was used as the fallback; replaced with initials avatars.

## Removed because they never worked (no backend support) - decision needed

- **Messages tab and chat screen**: hard-coded demo data, no API. Removed rather than shipping a fake inbox.
- **Like button, bookmark, share, follow, "For You / Following" tabs, "Forgot password" link**: UI only. Like counts are shown read-only. I did not invent endpoints. Give me the endpoints and each is a ~10-line change in `src/api/`.
- Hashtags are highlighted but not tappable (no search endpoint).
- Placeholder routes `(posts)/index`, `(core)/[id]` deleted.

## Changes you might not expect

- **Brand**: app display name is now "OkNeighbour" (was "Huddle"); logo is the OK hand. Android package, EAS project ID and slug are **unchanged** so store/EAS identity is preserved. iOS bundle ID set to the same id (the old config had none). URL scheme `myapp` → `okneighbour`.
- **Navigation**: 5 tabs → 3 native tabs (Home, Explore, Profile) + a floating Post button. Native tab bar = liquid glass on iOS 26, Material 3 on Android.
- **Home** gets a scope switch: "In {city}" / "Everywhere" (the API already allows omitting `location`). Explore ranks local people/businesses first and searches client-side.
- **Location** is requested contextually (register / location sheet / empty state), not as a modal at login. Posting uses the active place and says so on screen - check this suits your moderation intent.
- **Edit profile** screen added (same `auth/profile/edit/` endpoint).
- Light/Dark/System toggle on Profile (persisted).
- Dropped dependencies: lottie, react-native-svg, material-top-tabs/pager-view, htmlview, @expo/vector-icons, buffer, 3 of 5 font families (27 → 7 font files), and the oversized onboarding photos (8.6 MB → 0.45 MB).
- Stale-claims flow preserved: finishing your profile works immediately; on a later launch with an old token it refreshes, and if the claim is still stale asks you to log in again (as before, with a clear message).

## Backend assumptions to confirm (inferred from old code)

`profile.user.{first_name,last_name,username}`, `post.images[]` (`is_video`, `video`), comment create returns the comment with `user`, omitting `location` returns all posts, `news` returns `{data:{articles}}`.
The Nominatim contact email in `constants/config.ts` is the developer's personal address, carried over from the old app; consider a project address.

## Device checklist

iOS + Android: cold start with and without network (Render free tier cold start shows a "waking up" hint after 6s) · login/logout · deny location, then pick a place · post with 0/1/5 photos · keyboard behaviour in compose, comment bar and profile form (header offsets are estimated in `use-header-offset.ts`) · dark mode · VoiceOver/TalkBack on feed cards · tab bar insets (screens disable automatic insets and pad manually via `use-tab-insets.ts`).
