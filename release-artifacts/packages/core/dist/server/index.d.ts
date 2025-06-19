import { Handler, Context, MiddlewareHandler } from 'hono';
import { DescribeRouteOptions } from 'hono-openapi';
import { i as Methods, M as Mastra, j as ApiRoute, k as MastraAuthConfig } from '../base-CWUtFPZY.js';
export { l as ContextWithMastra, m as MastraAuthProvider, n as MastraAuthProviderOptions } from '../base-CWUtFPZY.js';
import 'ai';
import '../base-DCIyondy.js';
import '../logger-DtVDdb81.js';
import '../error/index.js';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import 'zod';
import 'json-schema';
import '../tts/index.js';
import '../vector/index.js';
import '../vector/filter/index.js';
import '../types-Bo1uigWx.js';
import 'sift';
import '../runtime-context/index.js';
import 'xstate';
import 'node:events';
import 'node:http';
import 'events';
import '../workflows/constants.js';
import 'ai/test';
import '../deployer/index.js';
import '../bundler/index.js';
import 'hono/cors';

type ParamsFromPath<P extends string> = {
    [K in P extends `${string}:${infer Param}/${string}` | `${string}:${infer Param}` ? Param : never]: string;
};
declare function registerApiRoute<P extends string>(path: P, options: P extends `/api/${string}` ? never : {
    method: Methods;
    openapi?: DescribeRouteOptions;
    handler?: Handler<{
        Variables: {
            mastra: Mastra;
        };
    }, P, ParamsFromPath<P>>;
    createHandler?: (c: Context) => Promise<Handler<{
        Variables: {
            mastra: Mastra;
        };
    }, P, ParamsFromPath<P>>>;
    middleware?: MiddlewareHandler | MiddlewareHandler[];
}): P extends `/api/${string}` ? never : ApiRoute;
declare function defineAuth<TUser>(config: MastraAuthConfig<TUser>): MastraAuthConfig<TUser>;

export { MastraAuthConfig, defineAuth, registerApiRoute };
