import type { JWTPayload } from 'jose';
import { MastraAuthProvider } from '@mastra/core/server';
import type { MastraAuthProviderOptions } from '@mastra/core/server';

declare type Auth0User = JWTPayload;

export declare class MastraAuthAuth0 extends MastraAuthProvider<Auth0User> {
    protected domain: string;
    protected audience: string;
    constructor(options?: MastraAuthAuth0Options);
    authenticateToken(token: string): Promise<Auth0User | null>;
    authorizeUser(user: Auth0User): Promise<boolean>;
}

declare interface MastraAuthAuth0Options extends MastraAuthProviderOptions<Auth0User> {
    domain?: string;
    audience?: string;
}

export { }
