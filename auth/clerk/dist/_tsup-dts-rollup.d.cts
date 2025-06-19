import type { ClerkClient } from '@clerk/backend';
import type { JwtPayload } from '@mastra/auth';
import { MastraAuthProvider } from '@mastra/core/server';
import type { MastraAuthProviderOptions } from '@mastra/core/server';

declare type ClerkUser = JwtPayload;

export declare class MastraAuthClerk extends MastraAuthProvider<ClerkUser> {
    protected clerk: ClerkClient;
    protected jwksUri: string;
    constructor(options?: MastraAuthClerkOptions);
    authenticateToken(token: string): Promise<ClerkUser | null>;
    authorizeUser(user: ClerkUser): Promise<boolean>;
}

declare interface MastraAuthClerkOptions extends MastraAuthProviderOptions<ClerkUser> {
    jwksUri?: string;
    secretKey?: string;
    publishableKey?: string;
}

export { }
