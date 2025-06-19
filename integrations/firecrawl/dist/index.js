import { Integration, OpenAPIToolset } from '@mastra/core/integration';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { createClient, createConfig } from '@hey-api/client-fetch';

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/client/sdk.gen.ts
var sdk_gen_exports = {};
__export(sdk_gen_exports, {
  cancelCrawl: () => cancelCrawl,
  client: () => client,
  crawlUrls: () => crawlUrls,
  getCrawlStatus: () => getCrawlStatus,
  mapUrls: () => mapUrls,
  scrapeAndExtractFromUrl: () => scrapeAndExtractFromUrl
});
var client = createClient(createConfig());
var scrapeAndExtractFromUrl = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/scrape"
  });
};
var getCrawlStatus = (options) => {
  return (options?.client ?? client).get({
    ...options,
    url: "/crawl/{id}"
  });
};
var cancelCrawl = (options) => {
  return (options?.client ?? client).delete({
    ...options,
    url: "/crawl/{id}"
  });
};
var crawlUrls = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/crawl"
  });
};
var mapUrls = (options) => {
  return (options?.client ?? client).post({
    ...options,
    url: "/map"
  });
};

// src/client/service-comments.ts
var comments = {
  scrape: {
    comment: "Scrape a single URL",
    doc: "Scrape a single URL"
  },
  crawlUrls: {
    comment: "Crawl multiple URLs based on options",
    doc: "Crawl multiple URLs based on options"
  },
  searchGoogle: {
    comment: "Search for a keyword in Google, returns top page results with markdown content for each page",
    doc: "Search for a keyword in Google, returns top page results with markdown content for each page"
  },
  getCrawlStatus: {
    comment: "Get the status of a crawl job",
    doc: "Get the status of a crawl job"
  },
  cancelCrawlJob: {
    comment: "Cancel a crawl job",
    doc: "Cancel a crawl job"
  }
};

// src/client/zodSchema.ts
var zodSchema_exports = {};
__export(zodSchema_exports, {
  cancelCrawlDataSchema: () => cancelCrawlDataSchema,
  cancelCrawlErrorSchema: () => cancelCrawlErrorSchema,
  cancelCrawlResponseSchema: () => cancelCrawlResponseSchema,
  crawlResponseSchema: () => crawlResponseSchema,
  crawlStatusResponseObjSchema: () => crawlStatusResponseObjSchema,
  crawlUrlsDataSchema: () => crawlUrlsDataSchema,
  crawlUrlsErrorSchema: () => crawlUrlsErrorSchema,
  crawlUrlsResponseSchema: () => crawlUrlsResponseSchema,
  getCrawlStatusDataSchema: () => getCrawlStatusDataSchema,
  getCrawlStatusErrorSchema: () => getCrawlStatusErrorSchema,
  getCrawlStatusResponseSchema: () => getCrawlStatusResponseSchema,
  mapResponseSchema: () => mapResponseSchema,
  mapUrlsDataSchema: () => mapUrlsDataSchema,
  mapUrlsErrorSchema: () => mapUrlsErrorSchema,
  mapUrlsResponseSchema: () => mapUrlsResponseSchema,
  scrapeAndExtractFromUrlDataSchema: () => scrapeAndExtractFromUrlDataSchema,
  scrapeAndExtractFromUrlErrorSchema: () => scrapeAndExtractFromUrlErrorSchema,
  scrapeAndExtractFromUrlResponseSchema: () => scrapeAndExtractFromUrlResponseSchema,
  scrapeResponseSchema: () => scrapeResponseSchema
});
var crawlResponseSchema = z.object({
  success: z.boolean().optional(),
  id: z.string().optional(),
  url: z.string().optional()
});
var crawlStatusResponseObjSchema = z.object({
  status: z.string().optional(),
  total: z.number().optional(),
  completed: z.number().optional(),
  creditsUsed: z.number().optional(),
  expiresAt: z.string().optional(),
  next: z.string().optional().nullable(),
  data: z.array(
    z.object({
      markdown: z.string().optional(),
      html: z.string().optional().nullable(),
      rawHtml: z.string().optional().nullable(),
      links: z.array(z.string()).optional(),
      screenshot: z.string().optional().nullable(),
      metadata: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        language: z.string().optional().nullable(),
        sourceURL: z.string().optional(),
        "<any other metadata> ": z.string().optional(),
        statusCode: z.number().optional(),
        error: z.string().optional().nullable()
      }).optional()
    })
  ).optional()
});
var mapResponseSchema = z.object({
  success: z.boolean().optional(),
  links: z.array(z.string()).optional()
});
var scrapeResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.object({
    markdown: z.string().optional(),
    html: z.string().optional().nullable(),
    rawHtml: z.string().optional().nullable(),
    screenshot: z.string().optional().nullable(),
    links: z.array(z.string()).optional(),
    actions: z.object({
      screenshots: z.array(z.string()).optional()
    }).optional().nullable(),
    metadata: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      language: z.string().optional().nullable(),
      sourceURL: z.string().optional(),
      "<any other metadata> ": z.string().optional(),
      statusCode: z.number().optional(),
      error: z.string().optional().nullable()
    }).optional(),
    llm_extraction: z.record(z.unknown()).optional().nullable(),
    warning: z.string().optional().nullable()
  }).optional()
});
var scrapeAndExtractFromUrlDataSchema = z.object({
  body: z.object({
    url: z.string(),
    formats: z.array(
      z.union([
        z.literal("markdown"),
        z.literal("html"),
        z.literal("rawHtml"),
        z.literal("links"),
        z.literal("screenshot"),
        z.literal("extract"),
        z.literal("screenshot@fullPage")
      ])
    ).optional(),
    onlyMainContent: z.boolean().optional(),
    includeTags: z.array(z.string()).optional(),
    excludeTags: z.array(z.string()).optional(),
    headers: z.record(z.unknown()).optional(),
    waitFor: z.number().optional(),
    timeout: z.number().optional(),
    extract: z.object({
      schema: z.record(z.unknown()).optional(),
      systemPrompt: z.string().optional(),
      prompt: z.string().optional()
    }).optional(),
    actions: z.array(
      z.union([
        z.object({
          type: z.literal("wait"),
          milliseconds: z.number()
        }),
        z.object({
          type: z.literal("screenshot"),
          fullPage: z.boolean().optional()
        }),
        z.object({
          type: z.literal("click"),
          selector: z.string()
        }),
        z.object({
          type: z.literal("write"),
          text: z.string(),
          selector: z.string()
        }),
        z.object({
          type: z.literal("press"),
          key: z.string()
        }),
        z.object({
          type: z.literal("scroll"),
          direction: z.union([z.literal("up"), z.literal("down")]),
          amount: z.number().optional()
        })
      ])
    ).optional()
  })
});
var scrapeAndExtractFromUrlResponseSchema = scrapeResponseSchema;
var scrapeAndExtractFromUrlErrorSchema = z.object({
  error: z.string().optional()
});
var getCrawlStatusDataSchema = z.object({
  path: z.object({
    id: z.string()
  })
});
var getCrawlStatusResponseSchema = crawlStatusResponseObjSchema;
var getCrawlStatusErrorSchema = z.object({
  error: z.string().optional()
});
var cancelCrawlDataSchema = z.object({
  path: z.object({
    id: z.string()
  })
});
var cancelCrawlResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional()
});
var cancelCrawlErrorSchema = z.object({
  error: z.string().optional()
});
var crawlUrlsDataSchema = z.object({
  body: z.object({
    url: z.string(),
    excludePaths: z.array(z.string()).optional(),
    includePaths: z.array(z.string()).optional(),
    maxDepth: z.number().optional(),
    ignoreSitemap: z.boolean().optional(),
    limit: z.number().optional(),
    allowBackwardLinks: z.boolean().optional(),
    allowExternalLinks: z.boolean().optional(),
    webhook: z.string().optional(),
    scrapeOptions: z.object({
      formats: z.array(
        z.union([
          z.literal("markdown"),
          z.literal("html"),
          z.literal("rawHtml"),
          z.literal("links"),
          z.literal("screenshot")
        ])
      ).optional(),
      headers: z.record(z.unknown()).optional(),
      includeTags: z.array(z.string()).optional(),
      excludeTags: z.array(z.string()).optional(),
      onlyMainContent: z.boolean().optional(),
      waitFor: z.number().optional()
    }).optional()
  })
});
var crawlUrlsResponseSchema = crawlResponseSchema;
var crawlUrlsErrorSchema = z.object({
  error: z.string().optional()
});
var mapUrlsDataSchema = z.object({
  body: z.object({
    url: z.string(),
    search: z.string().optional(),
    ignoreSitemap: z.boolean().optional(),
    includeSubdomains: z.boolean().optional(),
    limit: z.number().optional()
  })
});
var mapUrlsResponseSchema = mapResponseSchema;
var mapUrlsErrorSchema = z.object({
  error: z.string().optional()
});

// src/toolset.ts
var FirecrawlToolset = class extends OpenAPIToolset {
  name = "FIRECRAWL";
  logoUrl = "";
  config;
  tools;
  categories = ["dev-tools", "ai", "automation"];
  description = "Firecrawl is a web scraping platform";
  constructor({ config }) {
    super();
    this.config = config;
    this.tools = this._generateIntegrationTools();
  }
  get toolSchemas() {
    return zodSchema_exports;
  }
  get toolDocumentations() {
    return comments;
  }
  get baseClient() {
    client.setConfig({
      baseUrl: `https://api.firecrawl.dev/v1`
    });
    return sdk_gen_exports;
  }
  getApiClient = async () => {
    const value = {
      API_KEY: this.config?.["API_KEY"]
    };
    const baseClient = this.baseClient;
    baseClient.client.interceptors.request.use((request) => {
      request.headers.set("Authorization", `Bearer ${value?.["API_KEY"]}`);
      return request;
    });
    return sdk_gen_exports;
  };
};

// src/index.ts
var FirecrawlIntegration = class extends Integration {
  name = "FIRECRAWL";
  logoUrl = "";
  config;
  categories = ["dev-tools", "ai", "automation"];
  description = "Firecrawl is a web scraping platform";
  openapi;
  constructor({ config }) {
    super();
    this.config = config;
    this.openapi = new FirecrawlToolset({
      config: this.config
    });
    const crawlAndSyncWorkflow = createWorkflow({
      id: "Crawl and Sync",
      inputSchema: z.object({
        url: z.string(),
        limit: z.number().default(3),
        pathRegex: z.string().nullable()
      }),
      outputSchema: z.object({
        success: z.boolean(),
        crawlData: z.array(z.object({
          markdown: z.string(),
          metadata: z.object({
            sourceURL: z.string()
          })
        })),
        entityType: z.string()
      })
    });
    const syncStep = createStep({
      id: "FIRECRAWL:CRAWL_AND_SYNC",
      description: "Crawl and Sync",
      inputSchema: z.object({
        url: z.string(),
        limit: z.number().default(3),
        pathRegex: z.string().nullable()
      }),
      outputSchema: z.object({
        success: z.boolean(),
        crawlData: z.array(z.object({
          markdown: z.string(),
          metadata: z.object({
            sourceURL: z.string()
          })
        })),
        entityType: z.string()
      }),
      execute: async ({ inputData }) => {
        const triggerData = inputData;
        console.log("Starting crawl", triggerData?.url);
        const entityType = `CRAWL_${triggerData?.url}`;
        try {
          const client2 = await this.openapi.getApiClient();
          const res = await client2.crawlUrls({
            body: {
              url: triggerData?.url,
              limit: triggerData?.limit || 3,
              includePaths: triggerData?.pathRegex ? [triggerData.pathRegex] : [],
              scrapeOptions: {
                formats: ["markdown"],
                includeTags: ["main", "body"],
                excludeTags: ["img", "footer", "nav", "header", "#navbar", ".table-of-contents-content"],
                onlyMainContent: true
              }
            }
          });
          if (res.error) {
            console.error({ error: JSON.stringify(res.error, null, 2) });
            throw new Error(res.error.error);
          }
          const crawlId = res.data?.id;
          let crawl = await client2.getCrawlStatus({
            path: {
              id: crawlId
            }
          });
          while (crawl.data?.status === "scraping") {
            await new Promise((resolve) => setTimeout(resolve, 5e3));
            crawl = await client2.getCrawlStatus({
              path: {
                id: crawlId
              }
            });
          }
          const crawlData = (crawl?.data?.data || []).map((item) => ({
            markdown: item.markdown || "",
            metadata: {
              sourceURL: item?.metadata?.sourceURL || "",
              ...item.metadata
            }
          }));
          if (!crawlData) {
            return {
              success: false,
              crawlData: [],
              entityType: ""
            };
          }
          return {
            success: true,
            crawlData,
            entityType
          };
        } catch (error) {
          console.error({ error });
          return {
            success: false,
            crawlData: [],
            entityType: ""
          };
        }
      }
    });
    crawlAndSyncWorkflow.then(syncStep).commit();
    this.registerWorkflow("FIRECRAWL:CRAWL_AND_SYNC", crawlAndSyncWorkflow);
  }
  getStaticTools() {
    return {
      ...this.openapi.tools
    };
  }
  async getApiClient() {
    return this.openapi.getApiClient();
  }
};

export { FirecrawlIntegration };
