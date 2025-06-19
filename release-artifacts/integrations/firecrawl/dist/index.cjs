'use strict';

var integration = require('@mastra/core/integration');
var workflows = require('@mastra/core/workflows');
var zod = require('zod');
var clientFetch = require('@hey-api/client-fetch');

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
var client = clientFetch.createClient(clientFetch.createConfig());
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
var crawlResponseSchema = zod.z.object({
  success: zod.z.boolean().optional(),
  id: zod.z.string().optional(),
  url: zod.z.string().optional()
});
var crawlStatusResponseObjSchema = zod.z.object({
  status: zod.z.string().optional(),
  total: zod.z.number().optional(),
  completed: zod.z.number().optional(),
  creditsUsed: zod.z.number().optional(),
  expiresAt: zod.z.string().optional(),
  next: zod.z.string().optional().nullable(),
  data: zod.z.array(
    zod.z.object({
      markdown: zod.z.string().optional(),
      html: zod.z.string().optional().nullable(),
      rawHtml: zod.z.string().optional().nullable(),
      links: zod.z.array(zod.z.string()).optional(),
      screenshot: zod.z.string().optional().nullable(),
      metadata: zod.z.object({
        title: zod.z.string().optional(),
        description: zod.z.string().optional(),
        language: zod.z.string().optional().nullable(),
        sourceURL: zod.z.string().optional(),
        "<any other metadata> ": zod.z.string().optional(),
        statusCode: zod.z.number().optional(),
        error: zod.z.string().optional().nullable()
      }).optional()
    })
  ).optional()
});
var mapResponseSchema = zod.z.object({
  success: zod.z.boolean().optional(),
  links: zod.z.array(zod.z.string()).optional()
});
var scrapeResponseSchema = zod.z.object({
  success: zod.z.boolean().optional(),
  data: zod.z.object({
    markdown: zod.z.string().optional(),
    html: zod.z.string().optional().nullable(),
    rawHtml: zod.z.string().optional().nullable(),
    screenshot: zod.z.string().optional().nullable(),
    links: zod.z.array(zod.z.string()).optional(),
    actions: zod.z.object({
      screenshots: zod.z.array(zod.z.string()).optional()
    }).optional().nullable(),
    metadata: zod.z.object({
      title: zod.z.string().optional(),
      description: zod.z.string().optional(),
      language: zod.z.string().optional().nullable(),
      sourceURL: zod.z.string().optional(),
      "<any other metadata> ": zod.z.string().optional(),
      statusCode: zod.z.number().optional(),
      error: zod.z.string().optional().nullable()
    }).optional(),
    llm_extraction: zod.z.record(zod.z.unknown()).optional().nullable(),
    warning: zod.z.string().optional().nullable()
  }).optional()
});
var scrapeAndExtractFromUrlDataSchema = zod.z.object({
  body: zod.z.object({
    url: zod.z.string(),
    formats: zod.z.array(
      zod.z.union([
        zod.z.literal("markdown"),
        zod.z.literal("html"),
        zod.z.literal("rawHtml"),
        zod.z.literal("links"),
        zod.z.literal("screenshot"),
        zod.z.literal("extract"),
        zod.z.literal("screenshot@fullPage")
      ])
    ).optional(),
    onlyMainContent: zod.z.boolean().optional(),
    includeTags: zod.z.array(zod.z.string()).optional(),
    excludeTags: zod.z.array(zod.z.string()).optional(),
    headers: zod.z.record(zod.z.unknown()).optional(),
    waitFor: zod.z.number().optional(),
    timeout: zod.z.number().optional(),
    extract: zod.z.object({
      schema: zod.z.record(zod.z.unknown()).optional(),
      systemPrompt: zod.z.string().optional(),
      prompt: zod.z.string().optional()
    }).optional(),
    actions: zod.z.array(
      zod.z.union([
        zod.z.object({
          type: zod.z.literal("wait"),
          milliseconds: zod.z.number()
        }),
        zod.z.object({
          type: zod.z.literal("screenshot"),
          fullPage: zod.z.boolean().optional()
        }),
        zod.z.object({
          type: zod.z.literal("click"),
          selector: zod.z.string()
        }),
        zod.z.object({
          type: zod.z.literal("write"),
          text: zod.z.string(),
          selector: zod.z.string()
        }),
        zod.z.object({
          type: zod.z.literal("press"),
          key: zod.z.string()
        }),
        zod.z.object({
          type: zod.z.literal("scroll"),
          direction: zod.z.union([zod.z.literal("up"), zod.z.literal("down")]),
          amount: zod.z.number().optional()
        })
      ])
    ).optional()
  })
});
var scrapeAndExtractFromUrlResponseSchema = scrapeResponseSchema;
var scrapeAndExtractFromUrlErrorSchema = zod.z.object({
  error: zod.z.string().optional()
});
var getCrawlStatusDataSchema = zod.z.object({
  path: zod.z.object({
    id: zod.z.string()
  })
});
var getCrawlStatusResponseSchema = crawlStatusResponseObjSchema;
var getCrawlStatusErrorSchema = zod.z.object({
  error: zod.z.string().optional()
});
var cancelCrawlDataSchema = zod.z.object({
  path: zod.z.object({
    id: zod.z.string()
  })
});
var cancelCrawlResponseSchema = zod.z.object({
  success: zod.z.boolean().optional(),
  message: zod.z.string().optional()
});
var cancelCrawlErrorSchema = zod.z.object({
  error: zod.z.string().optional()
});
var crawlUrlsDataSchema = zod.z.object({
  body: zod.z.object({
    url: zod.z.string(),
    excludePaths: zod.z.array(zod.z.string()).optional(),
    includePaths: zod.z.array(zod.z.string()).optional(),
    maxDepth: zod.z.number().optional(),
    ignoreSitemap: zod.z.boolean().optional(),
    limit: zod.z.number().optional(),
    allowBackwardLinks: zod.z.boolean().optional(),
    allowExternalLinks: zod.z.boolean().optional(),
    webhook: zod.z.string().optional(),
    scrapeOptions: zod.z.object({
      formats: zod.z.array(
        zod.z.union([
          zod.z.literal("markdown"),
          zod.z.literal("html"),
          zod.z.literal("rawHtml"),
          zod.z.literal("links"),
          zod.z.literal("screenshot")
        ])
      ).optional(),
      headers: zod.z.record(zod.z.unknown()).optional(),
      includeTags: zod.z.array(zod.z.string()).optional(),
      excludeTags: zod.z.array(zod.z.string()).optional(),
      onlyMainContent: zod.z.boolean().optional(),
      waitFor: zod.z.number().optional()
    }).optional()
  })
});
var crawlUrlsResponseSchema = crawlResponseSchema;
var crawlUrlsErrorSchema = zod.z.object({
  error: zod.z.string().optional()
});
var mapUrlsDataSchema = zod.z.object({
  body: zod.z.object({
    url: zod.z.string(),
    search: zod.z.string().optional(),
    ignoreSitemap: zod.z.boolean().optional(),
    includeSubdomains: zod.z.boolean().optional(),
    limit: zod.z.number().optional()
  })
});
var mapUrlsResponseSchema = mapResponseSchema;
var mapUrlsErrorSchema = zod.z.object({
  error: zod.z.string().optional()
});

// src/toolset.ts
var FirecrawlToolset = class extends integration.OpenAPIToolset {
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
var FirecrawlIntegration = class extends integration.Integration {
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
    const crawlAndSyncWorkflow = workflows.createWorkflow({
      id: "Crawl and Sync",
      inputSchema: zod.z.object({
        url: zod.z.string(),
        limit: zod.z.number().default(3),
        pathRegex: zod.z.string().nullable()
      }),
      outputSchema: zod.z.object({
        success: zod.z.boolean(),
        crawlData: zod.z.array(zod.z.object({
          markdown: zod.z.string(),
          metadata: zod.z.object({
            sourceURL: zod.z.string()
          })
        })),
        entityType: zod.z.string()
      })
    });
    const syncStep = workflows.createStep({
      id: "FIRECRAWL:CRAWL_AND_SYNC",
      description: "Crawl and Sync",
      inputSchema: zod.z.object({
        url: zod.z.string(),
        limit: zod.z.number().default(3),
        pathRegex: zod.z.string().nullable()
      }),
      outputSchema: zod.z.object({
        success: zod.z.boolean(),
        crawlData: zod.z.array(zod.z.object({
          markdown: zod.z.string(),
          metadata: zod.z.object({
            sourceURL: zod.z.string()
          })
        })),
        entityType: zod.z.string()
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

exports.FirecrawlIntegration = FirecrawlIntegration;
