import jwt from 'jsonwebtoken';
import { MastraAuthProvider } from '@mastra/core/server';
import type { MastraAuthProviderOptions } from '@mastra/core/server';

declare function decodeToken(accessToken: string): Promise<jwt.Jwt | null>;
export { decodeToken }
export { decodeToken as decodeToken_alias_1 }

declare function getTokenIssuer(decoded: jwt.JwtPayload | null): any;
export { getTokenIssuer }
export { getTokenIssuer as getTokenIssuer_alias_1 }

declare type JwtPayload = jwt.JwtPayload;
export { JwtPayload }
export { JwtPayload as JwtPayload_alias_1 }

declare type JwtUser = jwt.JwtPayload;

declare class MastraJwtAuth extends MastraAuthProvider<JwtUser> {
    protected secret: string;
    constructor(options?: MastraJwtAuthOptions);
    authenticateToken(token: string): Promise<JwtUser>;
    authorizeUser(user: JwtUser): Promise<boolean>;
}
export { MastraJwtAuth }
export { MastraJwtAuth as MastraJwtAuth_alias_1 }

declare interface MastraJwtAuthOptions extends MastraAuthProviderOptions<JwtUser> {
    secret?: string;
}

declare function verifyHmac(accessToken: string, secret: string): Promise<jwt.JwtPayload>;
export { verifyHmac }
export { verifyHmac as verifyHmac_alias_1 }

declare function verifyJwks(accessToken: string, jwksUri: string): Promise<jwt.JwtPayload>;
export { verifyJwks }
export { verifyJwks as verifyJwks_alias_1 }

export { }
