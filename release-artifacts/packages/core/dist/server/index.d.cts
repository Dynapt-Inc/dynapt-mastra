import { Handler, Context, MiddlewareHandler } from 'hono';
import { DescribeRouteOptions } from 'hono-openapi';
import { i as Methods, M as Mastra, j as ApiRoute, k as MastraAuthConfig } from '../base-CEuVqEGP.cjs';
export { l as ContextWithMastra, m as MastraAuthProvider, n as MastraAuthProviderOptions } from '../base-CEuVqEGP.cjs';
import 'ai';
import '../base-CZ7cNkfE.cjs';
import '../logger-CpL0z5v_.cjs';
import '../error/index.cjs';
import 'stream';
import '@opentelemetry/api';
import '@opentelemetry/sdk-trace-base';
import 'zod';
import 'json-schema';
import '../tts/index.cjs';
import '../vector/index.cjs';
import '../vector/filter/index.cjs';
import '../types-Bo1uigWx.cjs';
import 'sift';
import '../runtime-context/index.cjs';
import 'xstate';
import 'node:events';
import 'node:http';
import 'events';
import '../workflows/constants.cjs';
import 'ai/test';
import '../deployer/index.cjs';
import '../bundler/index.cjs';
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
