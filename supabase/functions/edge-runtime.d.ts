declare module 'jsr:@supabase/functions-js/edge-runtime.d.ts' {}

declare module 'jsr:@supabase/supabase-js@2' {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any
}

declare module 'npm:google-auth-library@9' {
  export class JWT {
    constructor(options: unknown)
    getAccessToken(): Promise<{ token?: string | null }>
  }
}

declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve(handler: (req: Request) => Response | Promise<Response>): void
}
