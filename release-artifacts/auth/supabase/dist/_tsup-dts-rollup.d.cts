import { MastraAuthProvider } from '@mastra/core/server';
import type { MastraAuthProviderOptions } from '@mastra/core/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export declare class MastraAuthSupabase extends MastraAuthProvider<User> {
    protected supabase: SupabaseClient;
    constructor(options?: MastraAuthSupabaseOptions);
    authenticateToken(token: string): Promise<User | null>;
    authorizeUser(user: User): Promise<any>;
}

declare interface MastraAuthSupabaseOptions extends MastraAuthProviderOptions<User> {
    url?: string;
    anonKey?: string;
}

export { }
