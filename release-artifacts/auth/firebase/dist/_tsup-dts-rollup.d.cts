import admin from 'firebase-admin';
import { MastraAuthProvider } from '@mastra/core/server';
import type { MastraAuthProviderOptions } from '@mastra/core/server';

declare type FirebaseUser = admin.auth.DecodedIdToken;

export declare class MastraAuthFirebase extends MastraAuthProvider<FirebaseUser> {
    private serviceAccount;
    private databaseId;
    constructor(options?: MastraAuthFirebaseOptions);
    authenticateToken(token: string): Promise<FirebaseUser | null>;
    authorizeUser(user: FirebaseUser): Promise<boolean>;
}

declare interface MastraAuthFirebaseOptions extends MastraAuthProviderOptions<FirebaseUser> {
    databaseId?: string;
    serviceAccount?: string;
}

export { }
