#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const NETLIFY_API = 'https://api.netlify.com/api/v1';
const ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  throw new Error('NETLIFY_ACCESS_TOKEN environment variable is required');
}

interface CreateSiteFromGitHubArgs {
  name: string;
  repo: string;
  branch: string;
  buildCommand: string;
  publishDir: string;
}

interface ListSitesArgs {
  filter?: 'all' | 'owner' | 'guest';
}

interface GetSiteArgs {
  siteId: string;
}

interface DeleteSiteArgs {
  siteId: string;
}

class NetlifyServer {
  private server: Server;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'netlify-mcp-server',
        version: '0.1.0',
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
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
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
                description: 'Name for the new site',
              },
              repo: {
                type: 'string',
                description: 'GitHub repository in format owner/repo',
              },
              branch: {
                type: 'string',
                description: 'Branch to deploy from',
              },
              buildCommand: {
                type: 'string',
                description: 'Build command to run',
              },
              publishDir: {
                type: 'string',
                description: 'Directory containing the built files to publish',
              },
            },
            required: ['name', 'repo', 'branch', 'buildCommand', 'publishDir'],
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
                description: 'ID of the site to retrieve',
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
                description: 'ID of the site to delete',
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
          if (!args?.name || !args?.repo || !args?.branch || !args?.buildCommand || !args?.publishDir) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'Missing required parameters for createSiteFromGitHub'
            );
          }
          try {
            const response = await this.axiosInstance.post('/sites', {
              name: args.name,
              repo: {
                provider: 'github',
                repo_path: args.repo,
                repo_branch: args.branch,
                cmd: args.buildCommand,
                dir: args.publishDir,
              },
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.data, null, 2),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to create site: ${error.response?.data?.message || error.message}`
              );
            }
            throw error;
          }
        }

        case 'listSites': {
          const args = request.params.arguments as unknown as ListSitesArgs;
          try {
            const response = await this.axiosInstance.get('/sites', {
              params: {
                filter: args.filter,
              },
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.data, null, 2),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to list sites: ${error.response?.data?.message || error.message}`
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
                  text: JSON.stringify(response.data, null, 2),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to get site: ${error.response?.data?.message || error.message}`
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
                  text: JSON.stringify({ success: true, message: `Site ${args.siteId} deleted successfully` }),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Failed to delete site: ${error.response?.data?.message || error.message}`
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
server.run().catch(console.error);
