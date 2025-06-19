import * as _mastra_core_tools from '@mastra/core/tools';
import { ToolAction } from '@mastra/core/tools';
import { OpenAPIToolset, Integration } from '@mastra/core/integration';
import * as _hey_api_client_fetch from '@hey-api/client-fetch';
import { Options } from '@hey-api/client-fetch';
import { z } from 'zod';

type CrawlResponse = {
    success?: boolean;
    id?: string;
    url?: string;
};
type CrawlStatusResponseObj = {
    /**
     * The current status of the crawl. Can be `scraping`, `completed`, or `failed`.
     */
    status?: string;
    /**
     * The total number of pages that were attempted to be crawled.
     */
    total?: number;
    /**
     * The number of pages that have been successfully crawled.
     */
    completed?: number;
    /**
     * The number of credits used for the crawl.
     */
    creditsUsed?: number;
    /**
     * The date and time when the crawl will expire.
     */
    expiresAt?: string;
    /**
     * The URL to retrieve the next 10MB of data. Returned if the crawl is not completed or if the response is larger than 10MB.
     */
    next?: string | null;
    /**
     * The data of the crawl.
     */
    data?: Array<{
        markdown?: string;
        /**
         * HTML version of the content on page if `includeHtml`  is true
         */
        html?: string | null;
        /**
         * Raw HTML content of the page if `includeRawHtml`  is true
         */
        rawHtml?: string | null;
        /**
         * List of links on the page if `includeLinks` is true
         */
        links?: Array<string>;
        /**
         * Screenshot of the page if `includeScreenshot` is true
         */
        screenshot?: string | null;
        metadata?: {
            title?: string;
            description?: string;
            language?: string | null;
            sourceURL?: string;
            '<any other metadata> '?: string;
            /**
             * The status code of the page
             */
            statusCode?: number;
            /**
             * The error message of the page
             */
            error?: string | null;
        };
    }>;
};
type MapResponse = {
    success?: boolean;
    links?: Array<string>;
};
type ScrapeResponse = {
    success?: boolean;
    data?: {
        markdown?: string;
        /**
         * HTML version of the content on page if `html` is in `formats`
         */
        html?: string | null;
        /**
         * Raw HTML content of the page if `rawHtml` is in `formats`
         */
        rawHtml?: string | null;
        /**
         * Screenshot of the page if `screenshot` is in `formats`
         */
        screenshot?: string | null;
        /**
         * List of links on the page if `links` is in `formats`
         */
        links?: Array<string>;
        /**
         * Results of the actions specified in the `actions` parameter. Only present if the `actions` parameter was provided in the request
         */
        actions?: {
            /**
             * Screenshot URLs, in the same order as the screenshot actions provided.
             */
            screenshots?: Array<string>;
        } | null;
        metadata?: {
            title?: string;
            description?: string;
            language?: string | null;
            sourceURL?: string;
            '<any other metadata> '?: string;
            /**
             * The status code of the page
             */
            statusCode?: number;
            /**
             * The error message of the page
             */
            error?: string | null;
        };
        /**
         * Displayed when using LLM Extraction. Extracted data from the page following the schema defined.
         */
        llm_extraction?: {
            [key: string]: unknown;
        } | null;
        /**
         * Can be displayed when using LLM Extraction. Warning message will let you know any issues with the extraction.
         */
        warning?: string | null;
    };
};
type ScrapeAndExtractFromUrlData = {
    body: {
        /**
         * The URL to scrape
         */
        url: string;
        /**
         * Formats to include in the output.
         */
        formats?: Array<'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'extract' | 'screenshot@fullPage'>;
        /**
         * Only return the main content of the page excluding headers, navs, footers, etc.
         */
        onlyMainContent?: boolean;
        /**
         * Tags to include in the output.
         */
        includeTags?: Array<string>;
        /**
         * Tags to exclude from the output.
         */
        excludeTags?: Array<string>;
        /**
         * Headers to send with the request. Can be used to send cookies, user-agent, etc.
         */
        headers?: {
            [key: string]: unknown;
        };
        /**
         * Specify a delay in milliseconds before fetching the content, allowing the page sufficient time to load.
         */
        waitFor?: number;
        /**
         * Timeout in milliseconds for the request
         */
        timeout?: number;
        /**
         * Extract object
         */
        extract?: {
            /**
             * The schema to use for the extraction (Optional)
             */
            schema?: {
                [key: string]: unknown;
            };
            /**
             * The system prompt to use for the extraction (Optional)
             */
            systemPrompt?: string;
            /**
             * The prompt to use for the extraction without a schema (Optional)
             */
            prompt?: string;
        };
        /**
         * Actions to perform on the page before grabbing the content
         */
        actions?: Array<{
            /**
             * Wait for a specified amount of milliseconds
             */
            type: 'wait';
            /**
             * Number of milliseconds to wait
             */
            milliseconds: number;
        } | {
            /**
             * Take a screenshot
             */
            type: 'screenshot';
            /**
             * Should the screenshot be full-page or viewport sized?
             */
            fullPage?: boolean;
        } | {
            /**
             * Click on an element
             */
            type: 'click';
            /**
             * Query selector to find the element by
             */
            selector: string;
        } | {
            /**
             * Write text into an input field
             */
            type: 'write';
            /**
             * Text to type
             */
            text: string;
            /**
             * Query selector for the input field
             */
            selector: string;
        } | {
            /**
             * Press a key on the page
             */
            type: 'press';
            /**
             * Key to press
             */
            key: string;
        } | {
            /**
             * Scroll the page
             */
            type: 'scroll';
            /**
             * Direction to scroll
             */
            direction: 'up' | 'down';
            /**
             * Amount to scroll in pixels
             */
            amount?: number;
        }>;
    };
};
type ScrapeAndExtractFromUrlError = {
    error?: string;
};
type GetCrawlStatusData = {
    path: {
        /**
         * The ID of the crawl job
         */
        id: string;
    };
};
type GetCrawlStatusError = {
    error?: string;
};
type CancelCrawlData = {
    path: {
        /**
         * The ID of the crawl job
         */
        id: string;
    };
};
type CancelCrawlResponse = {
    success?: boolean;
    message?: string;
};
type CancelCrawlError = {
    error?: string;
};
type CrawlUrlsData = {
    body: {
        /**
         * The base URL to start crawling from
         */
        url: string;
        /**
         * Specifies URL patterns to exclude from the crawl by comparing website paths against the provided regex patterns. For example, if you set "excludePaths": ["blog*"] for the base URL firecrawl.dev, any results matching that pattern will be excluded, such as https://www.firecrawl.dev/blog/firecrawl-launch-week-1-recap.
         */
        excludePaths?: Array<string>;
        /**
         * Specifies URL patterns to include in the crawl by comparing website paths against the provided regex patterns. Only the paths that match the specified patterns will be included in the response. For example, if you set "includePaths": ["blog*"] for the base URL firecrawl.dev, only results matching that pattern will be included, such as https://www.firecrawl.dev/blog/firecrawl-launch-week-1-recap.
         */
        includePaths?: Array<string>;
        /**
         * Maximum depth to crawl relative to the entered URL.
         */
        maxDepth?: number;
        /**
         * Ignore the website sitemap when crawling
         */
        ignoreSitemap?: boolean;
        /**
         * Maximum number of pages to crawl. Default limit is 10000.
         */
        limit?: number;
        /**
         * Enables the crawler to navigate from a specific URL to previously linked pages.
         */
        allowBackwardLinks?: boolean;
        /**
         * Allows the crawler to follow links to external websites.
         */
        allowExternalLinks?: boolean;
        /**
         * The URL to send the webhook to. This will trigger for crawl started (crawl.started) ,every page crawled (crawl.page) and when the crawl is completed (crawl.completed or crawl.failed). The response will be the same as the `/scrape` endpoint.
         */
        webhook?: string;
        scrapeOptions?: {
            /**
             * Formats to include in the output.
             */
            formats?: Array<'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot'>;
            /**
             * Headers to send with the request. Can be used to send cookies, user-agent, etc.
             */
            headers?: {
                [key: string]: unknown;
            };
            /**
             * Tags to include in the output.
             */
            includeTags?: Array<string>;
            /**
             * Tags to exclude from the output.
             */
            excludeTags?: Array<string>;
            /**
             * Only return the main content of the page excluding headers, navs, footers, etc.
             */
            onlyMainContent?: boolean;
            /**
             * Wait x amount of milliseconds for the page to load to fetch content
             */
            waitFor?: number;
        };
    };
};
type CrawlUrlsError = {
    error?: string;
};
type MapUrlsData = {
    body: {
        /**
         * The base URL to start crawling from
         */
        url: string;
        /**
         * Search query to use for mapping. During the Alpha phase, the 'smart' part of the search functionality is limited to 1000 search results. However, if map finds more results, there is no limit applied.
         */
        search?: string;
        /**
         * Ignore the website sitemap when crawling
         */
        ignoreSitemap?: boolean;
        /**
         * Include subdomains of the website
         */
        includeSubdomains?: boolean;
        /**
         * Maximum number of links to return
         */
        limit?: number;
    };
};
type MapUrlsError = {
    error?: string;
};

declare const client: _hey_api_client_fetch.Client<Request, Response, _hey_api_client_fetch.RequestOptionsBase<false> & _hey_api_client_fetch.Config<false> & {
    headers: Headers;
}>;
/**
 * Scrape a single URL and optionally extract information using an LLM
 */
declare const scrapeAndExtractFromUrl: <ThrowOnError extends boolean = false>(options: Options<ScrapeAndExtractFromUrlData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<ScrapeResponse, ScrapeAndExtractFromUrlError, ThrowOnError>;
/**
 * Get the status of a crawl job
 */
declare const getCrawlStatus: <ThrowOnError extends boolean = false>(options: Options<GetCrawlStatusData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<CrawlStatusResponseObj, GetCrawlStatusError, ThrowOnError>;
/**
 * Cancel a crawl job
 */
declare const cancelCrawl: <ThrowOnError extends boolean = false>(options: Options<CancelCrawlData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<CancelCrawlResponse, CancelCrawlError, ThrowOnError>;
/**
 * Crawl multiple URLs based on options
 */
declare const crawlUrls: <ThrowOnError extends boolean = false>(options: Options<CrawlUrlsData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<CrawlResponse, CrawlUrlsError, ThrowOnError>;
/**
 * Map multiple URLs based on options
 */
declare const mapUrls: <ThrowOnError extends boolean = false>(options: Options<MapUrlsData, ThrowOnError>) => _hey_api_client_fetch.RequestResult<MapResponse, MapUrlsError, ThrowOnError>;

declare const integrationClient_cancelCrawl: typeof cancelCrawl;
declare const integrationClient_client: typeof client;
declare const integrationClient_crawlUrls: typeof crawlUrls;
declare const integrationClient_getCrawlStatus: typeof getCrawlStatus;
declare const integrationClient_mapUrls: typeof mapUrls;
declare const integrationClient_scrapeAndExtractFromUrl: typeof scrapeAndExtractFromUrl;
declare namespace integrationClient {
  export { integrationClient_cancelCrawl as cancelCrawl, integrationClient_client as client, integrationClient_crawlUrls as crawlUrls, integrationClient_getCrawlStatus as getCrawlStatus, integrationClient_mapUrls as mapUrls, integrationClient_scrapeAndExtractFromUrl as scrapeAndExtractFromUrl };
}

declare const crawlResponseSchema: z.ZodObject<{
    success: z.ZodOptional<z.ZodBoolean>;
    id: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    url?: string | undefined;
    success?: boolean | undefined;
    id?: string | undefined;
}, {
    url?: string | undefined;
    success?: boolean | undefined;
    id?: string | undefined;
}>;
declare const crawlStatusResponseObjSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    total: z.ZodOptional<z.ZodNumber>;
    completed: z.ZodOptional<z.ZodNumber>;
    creditsUsed: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    next: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    data: z.ZodOptional<z.ZodArray<z.ZodObject<{
        markdown: z.ZodOptional<z.ZodString>;
        html: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        rawHtml: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        screenshot: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            sourceURL: z.ZodOptional<z.ZodString>;
            '<any other metadata> ': z.ZodOptional<z.ZodString>;
            statusCode: z.ZodOptional<z.ZodNumber>;
            error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    total?: number | undefined;
    completed?: number | undefined;
    creditsUsed?: number | undefined;
    expiresAt?: string | undefined;
    next?: string | null | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }[] | undefined;
}, {
    status?: string | undefined;
    total?: number | undefined;
    completed?: number | undefined;
    creditsUsed?: number | undefined;
    expiresAt?: string | undefined;
    next?: string | null | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }[] | undefined;
}>;
declare const mapResponseSchema: z.ZodObject<{
    success: z.ZodOptional<z.ZodBoolean>;
    links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    success?: boolean | undefined;
    links?: string[] | undefined;
}, {
    success?: boolean | undefined;
    links?: string[] | undefined;
}>;
declare const scrapeResponseSchema: z.ZodObject<{
    success: z.ZodOptional<z.ZodBoolean>;
    data: z.ZodOptional<z.ZodObject<{
        markdown: z.ZodOptional<z.ZodString>;
        html: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        rawHtml: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        screenshot: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        actions: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            screenshots: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            screenshots?: string[] | undefined;
        }, {
            screenshots?: string[] | undefined;
        }>>>;
        metadata: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            sourceURL: z.ZodOptional<z.ZodString>;
            '<any other metadata> ': z.ZodOptional<z.ZodString>;
            statusCode: z.ZodOptional<z.ZodNumber>;
            error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }>>;
        llm_extraction: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        warning: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    }, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    success?: boolean | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    } | undefined;
}, {
    success?: boolean | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    } | undefined;
}>;
declare const scrapeAndExtractFromUrlDataSchema: z.ZodObject<{
    body: z.ZodObject<{
        url: z.ZodString;
        formats: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"markdown">, z.ZodLiteral<"html">, z.ZodLiteral<"rawHtml">, z.ZodLiteral<"links">, z.ZodLiteral<"screenshot">, z.ZodLiteral<"extract">, z.ZodLiteral<"screenshot@fullPage">]>, "many">>;
        onlyMainContent: z.ZodOptional<z.ZodBoolean>;
        includeTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        excludeTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        waitFor: z.ZodOptional<z.ZodNumber>;
        timeout: z.ZodOptional<z.ZodNumber>;
        extract: z.ZodOptional<z.ZodObject<{
            schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            systemPrompt: z.ZodOptional<z.ZodString>;
            prompt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            prompt?: string | undefined;
            schema?: Record<string, unknown> | undefined;
            systemPrompt?: string | undefined;
        }, {
            prompt?: string | undefined;
            schema?: Record<string, unknown> | undefined;
            systemPrompt?: string | undefined;
        }>>;
        actions: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"wait">;
            milliseconds: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "wait";
            milliseconds: number;
        }, {
            type: "wait";
            milliseconds: number;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"screenshot">;
            fullPage: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            type: "screenshot";
            fullPage?: boolean | undefined;
        }, {
            type: "screenshot";
            fullPage?: boolean | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"click">;
            selector: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "click";
            selector: string;
        }, {
            type: "click";
            selector: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"write">;
            text: z.ZodString;
            selector: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "write";
            text: string;
            selector: string;
        }, {
            type: "write";
            text: string;
            selector: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"press">;
            key: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "press";
            key: string;
        }, {
            type: "press";
            key: string;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"scroll">;
            direction: z.ZodUnion<[z.ZodLiteral<"up">, z.ZodLiteral<"down">]>;
            amount: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "scroll";
            direction: "up" | "down";
            amount?: number | undefined;
        }, {
            type: "scroll";
            direction: "up" | "down";
            amount?: number | undefined;
        }>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        headers?: Record<string, unknown> | undefined;
        onlyMainContent?: boolean | undefined;
        extract?: {
            prompt?: string | undefined;
            schema?: Record<string, unknown> | undefined;
            systemPrompt?: string | undefined;
        } | undefined;
        formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot" | "extract" | "screenshot@fullPage")[] | undefined;
        includeTags?: string[] | undefined;
        excludeTags?: string[] | undefined;
        waitFor?: number | undefined;
        timeout?: number | undefined;
        actions?: ({
            type: "wait";
            milliseconds: number;
        } | {
            type: "screenshot";
            fullPage?: boolean | undefined;
        } | {
            type: "click";
            selector: string;
        } | {
            type: "write";
            text: string;
            selector: string;
        } | {
            type: "press";
            key: string;
        } | {
            type: "scroll";
            direction: "up" | "down";
            amount?: number | undefined;
        })[] | undefined;
    }, {
        url: string;
        headers?: Record<string, unknown> | undefined;
        onlyMainContent?: boolean | undefined;
        extract?: {
            prompt?: string | undefined;
            schema?: Record<string, unknown> | undefined;
            systemPrompt?: string | undefined;
        } | undefined;
        formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot" | "extract" | "screenshot@fullPage")[] | undefined;
        includeTags?: string[] | undefined;
        excludeTags?: string[] | undefined;
        waitFor?: number | undefined;
        timeout?: number | undefined;
        actions?: ({
            type: "wait";
            milliseconds: number;
        } | {
            type: "screenshot";
            fullPage?: boolean | undefined;
        } | {
            type: "click";
            selector: string;
        } | {
            type: "write";
            text: string;
            selector: string;
        } | {
            type: "press";
            key: string;
        } | {
            type: "scroll";
            direction: "up" | "down";
            amount?: number | undefined;
        })[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        url: string;
        headers?: Record<string, unknown> | undefined;
        onlyMainContent?: boolean | undefined;
        extract?: {
            prompt?: string | undefined;
            schema?: Record<string, unknown> | undefined;
            systemPrompt?: string | undefined;
        } | undefined;
        formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot" | "extract" | "screenshot@fullPage")[] | undefined;
        includeTags?: string[] | undefined;
        excludeTags?: string[] | undefined;
        waitFor?: number | undefined;
        timeout?: number | undefined;
        actions?: ({
            type: "wait";
            milliseconds: number;
        } | {
            type: "screenshot";
            fullPage?: boolean | undefined;
        } | {
            type: "click";
            selector: string;
        } | {
            type: "write";
            text: string;
            selector: string;
        } | {
            type: "press";
            key: string;
        } | {
            type: "scroll";
            direction: "up" | "down";
            amount?: number | undefined;
        })[] | undefined;
    };
}, {
    body: {
        url: string;
        headers?: Record<string, unknown> | undefined;
        onlyMainContent?: boolean | undefined;
        extract?: {
            prompt?: string | undefined;
            schema?: Record<string, unknown> | undefined;
            systemPrompt?: string | undefined;
        } | undefined;
        formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot" | "extract" | "screenshot@fullPage")[] | undefined;
        includeTags?: string[] | undefined;
        excludeTags?: string[] | undefined;
        waitFor?: number | undefined;
        timeout?: number | undefined;
        actions?: ({
            type: "wait";
            milliseconds: number;
        } | {
            type: "screenshot";
            fullPage?: boolean | undefined;
        } | {
            type: "click";
            selector: string;
        } | {
            type: "write";
            text: string;
            selector: string;
        } | {
            type: "press";
            key: string;
        } | {
            type: "scroll";
            direction: "up" | "down";
            amount?: number | undefined;
        })[] | undefined;
    };
}>;
declare const scrapeAndExtractFromUrlResponseSchema: z.ZodObject<{
    success: z.ZodOptional<z.ZodBoolean>;
    data: z.ZodOptional<z.ZodObject<{
        markdown: z.ZodOptional<z.ZodString>;
        html: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        rawHtml: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        screenshot: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        actions: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            screenshots: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            screenshots?: string[] | undefined;
        }, {
            screenshots?: string[] | undefined;
        }>>>;
        metadata: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            sourceURL: z.ZodOptional<z.ZodString>;
            '<any other metadata> ': z.ZodOptional<z.ZodString>;
            statusCode: z.ZodOptional<z.ZodNumber>;
            error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }>>;
        llm_extraction: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        warning: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    }, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    success?: boolean | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    } | undefined;
}, {
    success?: boolean | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
        actions?: {
            screenshots?: string[] | undefined;
        } | null | undefined;
        llm_extraction?: Record<string, unknown> | null | undefined;
        warning?: string | null | undefined;
    } | undefined;
}>;
declare const scrapeAndExtractFromUrlErrorSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string | undefined;
}, {
    error?: string | undefined;
}>;
declare const getCrawlStatusDataSchema: z.ZodObject<{
    path: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    path: {
        id: string;
    };
}, {
    path: {
        id: string;
    };
}>;
declare const getCrawlStatusResponseSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    total: z.ZodOptional<z.ZodNumber>;
    completed: z.ZodOptional<z.ZodNumber>;
    creditsUsed: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    next: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    data: z.ZodOptional<z.ZodArray<z.ZodObject<{
        markdown: z.ZodOptional<z.ZodString>;
        html: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        rawHtml: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        screenshot: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            language: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            sourceURL: z.ZodOptional<z.ZodString>;
            '<any other metadata> ': z.ZodOptional<z.ZodString>;
            statusCode: z.ZodOptional<z.ZodNumber>;
            error: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }, {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }, {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    total?: number | undefined;
    completed?: number | undefined;
    creditsUsed?: number | undefined;
    expiresAt?: string | undefined;
    next?: string | null | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }[] | undefined;
}, {
    status?: string | undefined;
    total?: number | undefined;
    completed?: number | undefined;
    creditsUsed?: number | undefined;
    expiresAt?: string | undefined;
    next?: string | null | undefined;
    data?: {
        markdown?: string | undefined;
        metadata?: {
            sourceURL?: string | undefined;
            error?: string | null | undefined;
            description?: string | undefined;
            title?: string | undefined;
            language?: string | null | undefined;
            '<any other metadata> '?: string | undefined;
            statusCode?: number | undefined;
        } | undefined;
        html?: string | null | undefined;
        rawHtml?: string | null | undefined;
        links?: string[] | undefined;
        screenshot?: string | null | undefined;
    }[] | undefined;
}>;
declare const getCrawlStatusErrorSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string | undefined;
}, {
    error?: string | undefined;
}>;
declare const cancelCrawlDataSchema: z.ZodObject<{
    path: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    path: {
        id: string;
    };
}, {
    path: {
        id: string;
    };
}>;
declare const cancelCrawlResponseSchema: z.ZodObject<{
    success: z.ZodOptional<z.ZodBoolean>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message?: string | undefined;
    success?: boolean | undefined;
}, {
    message?: string | undefined;
    success?: boolean | undefined;
}>;
declare const cancelCrawlErrorSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string | undefined;
}, {
    error?: string | undefined;
}>;
declare const crawlUrlsDataSchema: z.ZodObject<{
    body: z.ZodObject<{
        url: z.ZodString;
        excludePaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        includePaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        maxDepth: z.ZodOptional<z.ZodNumber>;
        ignoreSitemap: z.ZodOptional<z.ZodBoolean>;
        limit: z.ZodOptional<z.ZodNumber>;
        allowBackwardLinks: z.ZodOptional<z.ZodBoolean>;
        allowExternalLinks: z.ZodOptional<z.ZodBoolean>;
        webhook: z.ZodOptional<z.ZodString>;
        scrapeOptions: z.ZodOptional<z.ZodObject<{
            formats: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodLiteral<"markdown">, z.ZodLiteral<"html">, z.ZodLiteral<"rawHtml">, z.ZodLiteral<"links">, z.ZodLiteral<"screenshot">]>, "many">>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            includeTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            excludeTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            onlyMainContent: z.ZodOptional<z.ZodBoolean>;
            waitFor: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            headers?: Record<string, unknown> | undefined;
            onlyMainContent?: boolean | undefined;
            formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[] | undefined;
            includeTags?: string[] | undefined;
            excludeTags?: string[] | undefined;
            waitFor?: number | undefined;
        }, {
            headers?: Record<string, unknown> | undefined;
            onlyMainContent?: boolean | undefined;
            formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[] | undefined;
            includeTags?: string[] | undefined;
            excludeTags?: string[] | undefined;
            waitFor?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        limit?: number | undefined;
        excludePaths?: string[] | undefined;
        includePaths?: string[] | undefined;
        maxDepth?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        allowBackwardLinks?: boolean | undefined;
        allowExternalLinks?: boolean | undefined;
        webhook?: string | undefined;
        scrapeOptions?: {
            headers?: Record<string, unknown> | undefined;
            onlyMainContent?: boolean | undefined;
            formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[] | undefined;
            includeTags?: string[] | undefined;
            excludeTags?: string[] | undefined;
            waitFor?: number | undefined;
        } | undefined;
    }, {
        url: string;
        limit?: number | undefined;
        excludePaths?: string[] | undefined;
        includePaths?: string[] | undefined;
        maxDepth?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        allowBackwardLinks?: boolean | undefined;
        allowExternalLinks?: boolean | undefined;
        webhook?: string | undefined;
        scrapeOptions?: {
            headers?: Record<string, unknown> | undefined;
            onlyMainContent?: boolean | undefined;
            formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[] | undefined;
            includeTags?: string[] | undefined;
            excludeTags?: string[] | undefined;
            waitFor?: number | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        url: string;
        limit?: number | undefined;
        excludePaths?: string[] | undefined;
        includePaths?: string[] | undefined;
        maxDepth?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        allowBackwardLinks?: boolean | undefined;
        allowExternalLinks?: boolean | undefined;
        webhook?: string | undefined;
        scrapeOptions?: {
            headers?: Record<string, unknown> | undefined;
            onlyMainContent?: boolean | undefined;
            formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[] | undefined;
            includeTags?: string[] | undefined;
            excludeTags?: string[] | undefined;
            waitFor?: number | undefined;
        } | undefined;
    };
}, {
    body: {
        url: string;
        limit?: number | undefined;
        excludePaths?: string[] | undefined;
        includePaths?: string[] | undefined;
        maxDepth?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        allowBackwardLinks?: boolean | undefined;
        allowExternalLinks?: boolean | undefined;
        webhook?: string | undefined;
        scrapeOptions?: {
            headers?: Record<string, unknown> | undefined;
            onlyMainContent?: boolean | undefined;
            formats?: ("markdown" | "html" | "rawHtml" | "links" | "screenshot")[] | undefined;
            includeTags?: string[] | undefined;
            excludeTags?: string[] | undefined;
            waitFor?: number | undefined;
        } | undefined;
    };
}>;
declare const crawlUrlsResponseSchema: z.ZodObject<{
    success: z.ZodOptional<z.ZodBoolean>;
    id: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    url?: string | undefined;
    success?: boolean | undefined;
    id?: string | undefined;
}, {
    url?: string | undefined;
    success?: boolean | undefined;
    id?: string | undefined;
}>;
declare const crawlUrlsErrorSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string | undefined;
}, {
    error?: string | undefined;
}>;
declare const mapUrlsDataSchema: z.ZodObject<{
    body: z.ZodObject<{
        url: z.ZodString;
        search: z.ZodOptional<z.ZodString>;
        ignoreSitemap: z.ZodOptional<z.ZodBoolean>;
        includeSubdomains: z.ZodOptional<z.ZodBoolean>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        limit?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        search?: string | undefined;
        includeSubdomains?: boolean | undefined;
    }, {
        url: string;
        limit?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        search?: string | undefined;
        includeSubdomains?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        url: string;
        limit?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        search?: string | undefined;
        includeSubdomains?: boolean | undefined;
    };
}, {
    body: {
        url: string;
        limit?: number | undefined;
        ignoreSitemap?: boolean | undefined;
        search?: string | undefined;
        includeSubdomains?: boolean | undefined;
    };
}>;
declare const mapUrlsResponseSchema: z.ZodObject<{
    success: z.ZodOptional<z.ZodBoolean>;
    links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    success?: boolean | undefined;
    links?: string[] | undefined;
}, {
    success?: boolean | undefined;
    links?: string[] | undefined;
}>;
declare const mapUrlsErrorSchema: z.ZodObject<{
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string | undefined;
}, {
    error?: string | undefined;
}>;

declare const zodSchema_cancelCrawlDataSchema: typeof cancelCrawlDataSchema;
declare const zodSchema_cancelCrawlErrorSchema: typeof cancelCrawlErrorSchema;
declare const zodSchema_cancelCrawlResponseSchema: typeof cancelCrawlResponseSchema;
declare const zodSchema_crawlResponseSchema: typeof crawlResponseSchema;
declare const zodSchema_crawlStatusResponseObjSchema: typeof crawlStatusResponseObjSchema;
declare const zodSchema_crawlUrlsDataSchema: typeof crawlUrlsDataSchema;
declare const zodSchema_crawlUrlsErrorSchema: typeof crawlUrlsErrorSchema;
declare const zodSchema_crawlUrlsResponseSchema: typeof crawlUrlsResponseSchema;
declare const zodSchema_getCrawlStatusDataSchema: typeof getCrawlStatusDataSchema;
declare const zodSchema_getCrawlStatusErrorSchema: typeof getCrawlStatusErrorSchema;
declare const zodSchema_getCrawlStatusResponseSchema: typeof getCrawlStatusResponseSchema;
declare const zodSchema_mapResponseSchema: typeof mapResponseSchema;
declare const zodSchema_mapUrlsDataSchema: typeof mapUrlsDataSchema;
declare const zodSchema_mapUrlsErrorSchema: typeof mapUrlsErrorSchema;
declare const zodSchema_mapUrlsResponseSchema: typeof mapUrlsResponseSchema;
declare const zodSchema_scrapeAndExtractFromUrlDataSchema: typeof scrapeAndExtractFromUrlDataSchema;
declare const zodSchema_scrapeAndExtractFromUrlErrorSchema: typeof scrapeAndExtractFromUrlErrorSchema;
declare const zodSchema_scrapeAndExtractFromUrlResponseSchema: typeof scrapeAndExtractFromUrlResponseSchema;
declare const zodSchema_scrapeResponseSchema: typeof scrapeResponseSchema;
declare namespace zodSchema {
  export { zodSchema_cancelCrawlDataSchema as cancelCrawlDataSchema, zodSchema_cancelCrawlErrorSchema as cancelCrawlErrorSchema, zodSchema_cancelCrawlResponseSchema as cancelCrawlResponseSchema, zodSchema_crawlResponseSchema as crawlResponseSchema, zodSchema_crawlStatusResponseObjSchema as crawlStatusResponseObjSchema, zodSchema_crawlUrlsDataSchema as crawlUrlsDataSchema, zodSchema_crawlUrlsErrorSchema as crawlUrlsErrorSchema, zodSchema_crawlUrlsResponseSchema as crawlUrlsResponseSchema, zodSchema_getCrawlStatusDataSchema as getCrawlStatusDataSchema, zodSchema_getCrawlStatusErrorSchema as getCrawlStatusErrorSchema, zodSchema_getCrawlStatusResponseSchema as getCrawlStatusResponseSchema, zodSchema_mapResponseSchema as mapResponseSchema, zodSchema_mapUrlsDataSchema as mapUrlsDataSchema, zodSchema_mapUrlsErrorSchema as mapUrlsErrorSchema, zodSchema_mapUrlsResponseSchema as mapUrlsResponseSchema, zodSchema_scrapeAndExtractFromUrlDataSchema as scrapeAndExtractFromUrlDataSchema, zodSchema_scrapeAndExtractFromUrlErrorSchema as scrapeAndExtractFromUrlErrorSchema, zodSchema_scrapeAndExtractFromUrlResponseSchema as scrapeAndExtractFromUrlResponseSchema, zodSchema_scrapeResponseSchema as scrapeResponseSchema };
}

type FirecrawlConfig = {
    API_KEY: string;
    [key: string]: any;
};

declare class FirecrawlToolset extends OpenAPIToolset {
    readonly name = "FIRECRAWL";
    readonly logoUrl = "";
    config: FirecrawlConfig;
    readonly tools: Record<Exclude<keyof typeof integrationClient, 'client'>, ToolAction<any, any, any>>;
    categories: string[];
    description: string;
    constructor({ config }: {
        config: FirecrawlConfig;
    });
    protected get toolSchemas(): typeof zodSchema;
    protected get toolDocumentations(): {
        scrape: {
            comment: string;
            doc: string;
        };
        crawlUrls: {
            comment: string;
            doc: string;
        };
        searchGoogle: {
            comment: string;
            doc: string;
        };
        getCrawlStatus: {
            comment: string;
            doc: string;
        };
        cancelCrawlJob: {
            comment: string;
            doc: string;
        };
    };
    protected get baseClient(): typeof integrationClient;
    getApiClient: () => Promise<typeof integrationClient>;
}

declare class FirecrawlIntegration extends Integration<void, typeof integrationClient> {
    readonly name = "FIRECRAWL";
    readonly logoUrl = "";
    config: FirecrawlConfig;
    categories: string[];
    description: string;
    openapi: FirecrawlToolset;
    constructor({ config }: {
        config: FirecrawlConfig;
    });
    getStaticTools(): {
        scrapeAndExtractFromUrl: _mastra_core_tools.ToolAction<any, any, any>;
        getCrawlStatus: _mastra_core_tools.ToolAction<any, any, any>;
        cancelCrawl: _mastra_core_tools.ToolAction<any, any, any>;
        crawlUrls: _mastra_core_tools.ToolAction<any, any, any>;
        mapUrls: _mastra_core_tools.ToolAction<any, any, any>;
    };
    getApiClient(): Promise<typeof integrationClient>;
}

export { FirecrawlIntegration };
