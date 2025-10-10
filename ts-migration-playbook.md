# Ship-Ready TypeScript Migration Playbook (Lite, No-Drama Setup)

A step-by-step playbook to move your JavaScript Expo/React Native app into a **strict TypeScript** repo with **minimal guardrails** (clean lint/format, pragmatic TS, tiny runtime checks). Optimized for copying components **one by one** and being **easy to review (by humans or AI).**

---

## Goals

- Fresh **TypeScript** repo (strict enough to avoid footguns; not perfectionist)
- **ESLint 9 (flat config) + Prettier** with compatible plugins
- **Husky + lint-staged** pre-commit
- Minimal **runtime safety** (env helper + small HTTP wrapper)
- Clear **folder conventions** + **component migration checklist**
- CI that runs **typecheck + lint**
- App-store-ready basics (EAS, env, ignores)

## Progress tracker (live)

- [x] 7. CI (typecheck + lint)
- [ ] 10. AI-friendly PRs & reviews

---

## Prerequisites

```bash
node -v   # v20+ recommended
npm -v
```

If you have the legacy global expo-cli, uninstall (we’ll use the local CLI that comes with your project):

```bash
npm uninstall -g expo-cli
```

---

## 1) Bootstrap a fresh TS Expo app & push ✅ Completed

> Using the existing JamaahApp repo as the TS migration target and it’s already pushed.

```bash
npx create-expo-app@latest masjid-app-ts -t expo-template-blank-typescript
cd masjid-app-ts

git init
git add .
git commit -m "chore: bootstrap Expo TS app"
# Create a new GitHub repo, then:
git branch -M main
git remote add origin https://github.com/<you>/masjid-app-ts.git
git push -u origin main
```

Run once to confirm:

```bash
npm start
```

> **Tip:** Let Expo manage React/React Native versions. Don’t pin them manually; use `npx expo install` whenever you add core RN deps.

---

## 2) Quality guardrails (TypeScript + ESLint 9 flat + Prettier + Husky) ✅ Completed

### 2.1 Install a compatible toolchain

```bash
npm i -D \
  typescript@^5 \
  eslint@^9 @eslint/js@^9 typescript-eslint@^8 \
  eslint-plugin-react@^7.37.2 eslint-plugin-react-hooks@^5 \
  prettier@^3 eslint-config-prettier@^9 globals@^15 \
  husky@^9 lint-staged@^15
```

### 2.2 `tsconfig.json` (pragmatic strict)

Create/replace at the repo root:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "jsx": "react-jsx",
    "lib": ["ES2021"],
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["react", "react-native"]
  },
  "include": ["**/*.ts", "**/*.tsx", "app.config.ts", "index.ts"]
}
```

### 2.3 ESLint 9 **flat** config (non–type-aware, low friction)

Create `eslint.config.mjs` at repo root:

```js
// Minimal flat config (no type-aware rules)
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['node_modules', 'build', 'dist', '.expo'] },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended, // keep it simple; no recommendedTypeChecked

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      // Avoid rules that require TS type info (we keep friction low for now).
    },
  },

  // Let Prettier handle formatting
  prettier,
]
```

### 2.4 Prettier config

Create `.prettierrc` at repo root:

```json
{ "singleQuote": true, "semi": false, "trailingComma": "all" }
```

### 2.5 NPM scripts + Husky + lint-staged

```bash
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.lint="eslint . --ext .ts,.tsx"
npm pkg set scripts.format="prettier . --write"
npm pkg set scripts.ci="npm run typecheck && npm run lint"
npm pkg set scripts.prepare="husky"

npx husky init
printf '#!/usr/bin/env sh\nnpx lint-staged\n' > .husky/pre-commit

npm pkg set 'lint-staged["*.{ts,tsx,js,jsx,json,md}"][0]'="prettier --write"
npm pkg set 'lint-staged["*.{ts,tsx}"][0]'="eslint --fix"
```

Run checks and commit:

```bash
npm run typecheck
npm run lint
npm run format
git add .
git commit -m "chore: TS + ESLint9 flat + Prettier + Husky"
git push
```

> **Husky note:** If you see a deprecation warning for shell boilerplate, make sure your `.husky/pre-commit` only contains:
>
> ```sh
> #!/usr/bin/env sh
> npx lint-staged
> ```

---

## 3) Minimal runtime safety (env + tiny HTTP) ✅ Completed (adapted)

We kept it minimal and tailored to Supabase-only for now.

### 3.1 Env helper (adapted)

`src/core/env.ts`

```ts
export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const
```

### 3.2 Expo config + env files (adapted)

- `app.config.ts` left unchanged; Expo SDK 54 reads `EXPO_PUBLIC_*` via `process.env`.
- `.env` contains:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

- We intentionally skipped `.env.example` for now.

### 3.3 Tiny HTTP client — deferred

We’ll add `src/core/http.ts` only when we introduce non-Supabase endpoints.

---

## 4) Folder structure (simple and scalable) ✅ Completed

```
src/
  app/                # if using expo-router; else your screens go here or under features
  components/         # shared UI
  features/           # feature folders (announcements, auth, orgs, etc.)
  core/
    http.ts           # tiny fetch wrapper
    env.ts            # env helper
    navigation/       # (later) typed navigation helpers
    store/            # (later) state management (Zustand/MobX/etc.)
```

Use the `@/*` alias from `tsconfig.json`, e.g. `import { http } from "@/core/http"`.

---

## 5) Migration checklist (copy JS → TS, one at a time)

For **each component/screen/feature**:

1. **Create a feature folder**: `src/features/<name>/`.
2. **Move the UI** to `.tsx` and add **simple prop types** (avoid `any`; prefer `string | null`, unions, etc.).
3. **Replace fetches** with the tiny `http` wrapper (or your Supabase client).
4. **Add minimal guards** only if an API response is known to be messy (inline type predicate is fine).
5. **Run** `npm run typecheck && npm run lint && npm start`.
6. **Commit** with a clear message. Keep PRs **small** and feature-scoped.

> **Tip:** Keep feature boundaries clear. Don’t reach into other features’ internals; share through `core/` or explicitly exported helpers.

---

## 6) Tests (optional, focused)

Add tests where they pay off most:

- **Render sanity** for key screens/components.
- **Pure functions** (formatters, reducers, mappers).

When ready:

```bash
npm i -D jest @testing-library/react-native @testing-library/jest-native ts-jest
```

Add a minimal `jest.config.js` and one simple test to validate the setup. Keep the rest lean for now.

---

## 7) CI (typecheck + lint on PRs) ✅ Completed

`.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run ci
```

> **Why:** Keeps the main branch healthy and enforces quality without slowing you down locally.

---

## 8) Professional `.gitignore`

```gitignore
# Node & package managers
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Expo / build outputs
.expo/
.expo-shared/
dist/
build/

# Managed workflow native folders; remove these lines if you decide to track native code later
android/
ios/

# Environment
.env
.env.*
!.env.example

# Signing keys & credentials
*.keystore
*.jks
*.p12
*.mobileprovision
*.cer
*.pem
credentials.json

# OS cruft
.DS_Store
Thumbs.db

# Editors
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/
```

> Keep your lockfile (`package-lock.json`) **committed** for reproducible installs.

---

## 9) App store basics (later, when stable)

- **EAS**: `npm i -g eas-cli` then `eas login` and `eas build:configure`.
- Configure **bundle IDs**, app name, icons/splash in `app.json/app.config.ts`.
- **Privacy** strings (iOS) and **Data Safety** (Play Store).
- Build for testing:
  - iOS: `eas build -p ios` → TestFlight
  - Android: `eas build -p android` → internal testing track
- Use **EAS Secrets** for any tokens you don’t want in `.env` files.

---

## 10) AI-friendly PRs & reviews

- Keep PRs **small** (one feature or change).
- Include a **PR template**:

`.github/pull_request_template.md`

```md
## What

Short summary

## Why

Context

## How

Key changes

## Screenshots / Video

(if UI)

## Checklist

- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Manually tested on device/simulator
```

- Protect `main` with CI required.

---

## Commands Cheat-Sheet

```bash
# Quality
npm run typecheck
npm run lint
npm run format

# Start the app
npm start

# Expo-managed installs for RN deps
npx expo install <package>
```

---

## Philosophy (why this works)

- **Strict enough** to catch real mistakes, **light enough** to not block velocity.
- No heavy runtime validation unless a specific endpoint needs it.
- Single, tiny HTTP wrapper so network/JSON errors don’t blow up the UI.
- Clear structure & repeatable migration path → easy to ship and maintain.
