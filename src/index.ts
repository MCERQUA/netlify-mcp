#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const NETLIFY_API = 'https://api.netlify.com/api/v1';
const ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Error: NETLIFY_ACCESS_TOKEN environment variable is required');
  console.error('Please set it in your environment or create a .env file');
  process.exit(1);
}

interface CreateSiteFromGitHubArgs {
  name: string;
  repo: string;
  branch: string;
  buildCommand: string;
  publishDir: string;
  envVars?: Record<string, string>;
}

interface ListSitesArgs {
  filter?: 'all' | 'owner' | 'guest';
  page?: number;
  perPage?: number;
}

interface GetSiteArgs {
  siteId: string;
}

interface DeleteSiteArgs {
  siteId: string;
}

interface NetlifyErrorResponse {
  message?: string;
  error?: string;
  errors?: Array<{ message: string }>;
}

class NetlifyServer {
  private server: Server;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'netlify-mcp-server',
        version: '1.0.1',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: NETLIFY_API,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      timeout: 30000, // 30 second timeout
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private formatNetlifyError(error: AxiosError<NetlifyErrorResponse>): string {
    if (error.response?.data) {
      const data = error.response.data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.errors && data.errors.length > 0) {
        return data.errors.map(e => e.message).join(', ');
      }
    }
    return error.message || 'Unknown error occurred';
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'createSiteFromGitHub',
          description: 'Create a new Netlify site from a GitHub repository',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name for the new site (will be used as subdomain)',
              },
              repo: {
                type: 'string',
                description: 'GitHub repository in format owner/repo',
              },
              branch: {
                type: 'string',
                description: 'Branch to deploy from (default: main)',
                default: 'main',
              },
              buildCommand: {
                type: 'string',
                description: 'Build command to run (e.g., npm run build)',
              },
              publishDir: {
                type: 'string',
                description: 'Directory containing the built files to publish (e.g., dist, build)',
              },
              envVars: {
                type: 'object',
                description: 'Environment variables for the build process',
                additionalProperties: { type: 'string' },
              },
            },
            required: ['name', 'repo', 'buildCommand', 'publishDir'],
          },
        },
        {
          name: 'listSites',
          description: 'List Netlify sites',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'string',
                enum: ['all', 'owner', 'guest'],
                description: 'Filter sites by access type',
                default: 'all',
              },
              page: {
                type: 'number',
                description: 'Page number for pagination',
                default: 1,
              },
              perPage: {
                type: 'number',
                description: 'Number of sites per page (max 100)',
                default: 20,
              },
            },
          },
        },
        {
          name: 'getSite',
          description: 'Get details of a specific site',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: {
                type: 'string',
                description: 'ID or name of the site to retrieve',
              },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'deleteSite',
          description: 'Delete a site',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: {
                type: 'string',
                description: 'ID or name of the site to delete',
              },
            },
            required: ['siteId'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'createSiteFromGitHub': {
          const args = request.params.arguments as unknown as CreateSiteFromGitHubArgs;
          if (!args?.name || !args?.repo || !args?.buildCommand || !args?.publishDir) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'Missing required parameters: name, repo, buildCommand, and publishDir are required'
            );
          }

          // Validate repo format
          if (!args.repo.match(/^[\w.-]+\/[\w.-]+$/)) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'Invalid repo format. Must be in format: owner/repo'
            );
          }

          try {
            const siteData = {
              name: args.name,
              repo: {
                provider: 'github',
                repo: args.repo,
                branch: args.branch || 'main',
                cmd: args.buildCommand,
                dir: args.publishDir,
              },
            };

            // Add environment variables if provided
            if (args.envVars) {
              siteData.repo['env'] = args.envVars;
            }

            const response = await this.axiosInstance.post('/sites', siteData);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    site: {
                      id: response.data.id,
                      name: response.data.name,
                      url: response.data.url,
                      admin_url: response.data.admin_url,
                      deploy_url: response.data.deploy_url,
                      created_at: response.data.created_at,
                    },
                    message: `Site created successfully! Visit ${response.data.admin_url} to manage it.`,
                  }, null, 2),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to create site: ${this.formatNetlifyError(error)}`
              );
            }
            throw error;
          }
        }

        case 'listSites': {
          const args = request.params.arguments as unknown as ListSitesArgs;
          try {
            const params: any = {};
            if (args?.filter && args.filter !== 'all') {
              params.filter = args.filter;
            }
            if (args?.page) {
              params.page = args.page;
            }
            if (args?.perPage) {
              params.per_page = Math.min(args.perPage, 100);
            }

            const response = await this.axiosInstance.get('/sites', { params });

            const sites = response.data.map((site: any) => ({
              id: site.id,
              name: site.name,
              url: site.url,
              admin_url: site.admin_url,
              created_at: site.created_at,
              updated_at: site.updated_at,
              published_deploy: site.published_deploy ? {
                id: site.published_deploy.id,
                created_at: site.published_deploy.created_at,
              } : null,
            }));

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    sites,
                    count: sites.length,
                  }, null, 2),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to list sites: ${this.formatNetlifyError(error)}`
              );
            }
            throw error;
          }
        }

        case 'getSite': {
          const args = request.params.arguments as unknown as GetSiteArgs;
          if (!args?.siteId) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'Missing required parameter: siteId'
            );
          }
          try {
            const response = await this.axiosInstance.get(`/sites/${args.siteId}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    site: response.data,
                  }, null, 2),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 404) {
                throw new McpError(
                  ErrorCode.InvalidParams,
                  `Site not found: ${args.siteId}`
                );
              }
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to get site: ${this.formatNetlifyError(error)}`
              );
            }
            throw error;
          }
        }

        case 'deleteSite': {
          const args = request.params.arguments as unknown as DeleteSiteArgs;
          if (!args?.siteId) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'Missing required parameter: siteId'
            );
          }
          try {
            await this.axiosInstance.delete(`/sites/${args.siteId}`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    message: `Site ${args.siteId} deleted successfully`,
                  }, null, 2),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 404) {
                throw new McpError(
                  ErrorCode.InvalidParams,
                  `Site not found: ${args.siteId}`
                );
              }
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to delete site: ${this.formatNetlifyError(error)}`
              );
            }
            throw error;
          }
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Netlify MCP server running on stdio');
  }
}

const server = new NetlifyServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});