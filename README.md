# Netlify MCP Server

[![MCP Server](https://img.shields.io/badge/MCP-Server-blue)](https://github.com/modelcontextprotocol)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for managing Netlify sites. This server enables seamless integration with Netlify's API through MCP, allowing you to create, manage, and deploy sites directly from your MCP-enabled environment.

## Features

- 🚀 Create new sites from GitHub repositories
- 📋 List existing Netlify sites with pagination
- 🔍 Get detailed site information
- 🗑️ Delete sites
- 🔐 Secure authentication with Netlify API
- ⚡ Built with TypeScript for type safety
- 🐳 Docker support for easy deployment

## Requirements

- Node.js 18 or higher
- A Netlify account with API access
- A GitHub repository for deploying sites

## Installation

### From Source

1. Clone this repository:
```bash
git clone https://github.com/MCERQUA/netlify-mcp.git
cd netlify-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Using Docker

```bash
docker build -t netlify-mcp .
docker run -e NETLIFY_ACCESS_TOKEN=your_token_here netlify-mcp
```

## Configuration

### Getting Your Netlify Access Token

1. Create a Netlify account at [https://app.netlify.com/signup](https://app.netlify.com/signup)
2. Go to User Settings > Applications > Personal access tokens
3. Click "New access token"
4. Give it a name (e.g., "MCP Integration")
5. Copy the generated token

### Setting Up MCP

1. Create a `.env` file in the project root:
```env
NETLIFY_ACCESS_TOKEN=your_token_here
```

2. Add the server to your MCP settings configuration:
```json
{
  "mcpServers": {
    "netlify": {
      "command": "node",
      "args": ["path/to/netlify-mcp/build/index.js"],
      "env": {
        "NETLIFY_ACCESS_TOKEN": "your_token_here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Available Tools

### createSiteFromGitHub
Create a new Netlify site from a GitHub repository.

```typescript
interface CreateSiteFromGitHubArgs {
  name: string;          // Name for the new site (subdomain)
  repo: string;          // GitHub repository (format: owner/repo)
  branch?: string;       // Branch to deploy from (default: main)
  buildCommand: string;  // Build command to run
  publishDir: string;    // Directory containing the built files
  envVars?: Record<string, string>; // Environment variables
}
```

### listSites
List all Netlify sites you have access to.

```typescript
interface ListSitesArgs {
  filter?: 'all' | 'owner' | 'guest';  // Filter for sites
  page?: number;         // Page number for pagination
  perPage?: number;      // Items per page (max 100)
}
```

### getSite
Get detailed information about a specific site.

```typescript
interface GetSiteArgs {
  siteId: string;  // ID or name of the site
}
```

### deleteSite
Delete a Netlify site.

```typescript
interface DeleteSiteArgs {
  siteId: string;  // ID or name of the site
}
```

## Documentation

For more detailed information, see:
- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Usage Examples](docs/EXAMPLES.md)

## Development

```bash
# Run in development mode with auto-rebuild
npm run dev

# Clean build artifacts
npm run clean

# Build the project
npm run build
```

## Troubleshooting

### Common Issues

1. **"NETLIFY_ACCESS_TOKEN environment variable is required"**
   - Make sure you've set the token in your environment or `.env` file

2. **"Failed to create site: 401 Unauthorized"**
   - Your access token might be invalid or expired
   - Generate a new token from Netlify settings

3. **"Invalid repo format"**
   - Ensure the repository is in format `owner/repo`
   - Example: `facebook/react`, not `https://github.com/facebook/react`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol) for the MCP framework
- [Netlify](https://www.netlify.com) for their excellent deployment platform