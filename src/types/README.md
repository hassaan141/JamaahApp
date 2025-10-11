Types source of truth

- File: src/types/supabase.ts defines our database types. For now, it’s hand-maintained and minimal (only tables we use).
- Barrel: src/types/index.ts re-exports Database and provides convenient aliases like `Profile`.

How to use

- Import shared types via the barrel: `import type { Profile } from '@/types'`.
- If the database schema changes, update `src/types/supabase.ts` accordingly (add fields, new tables, etc.).

Optional later

- If you want auto-generated types in the future, we can add the Supabase CLI and replace `src/types/supabase.ts` with generated types while keeping the same imports.
