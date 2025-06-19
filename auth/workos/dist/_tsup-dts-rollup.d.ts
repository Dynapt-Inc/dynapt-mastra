import type { JwtPayload } from '@mastra/auth';
import { MastraAuthProvider } from '@mastra/core/server';
import type { MastraAuthProviderOptions } from '@mastra/core/server';
import { WorkOS } from '@workos-inc/node';

export declare class MastraAuthWorkos extends MastraAuthProvider<WorkosUser> {
    protected workos: WorkOS;
    constructor(options?: MastraAuthWorkosOptions);
    authenticateToken(token: string): Promise<WorkosUser | null>;
    authorizeUser(user: WorkosUser): Promise<boolean>;
}

declare interface MastraAuthWorkosOptions extends MastraAuthProviderOptions<WorkosUser> {
    apiKey?: string;
    clientId?: string;
}

declare type WorkosUser = JwtPayload;

export { }
