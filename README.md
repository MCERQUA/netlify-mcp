# Netlify MCP Server
[![smithery badge](https://smithery.ai/badge/@MCERQUA/netlify-mcp)](https://smithery.ai/server/@MCERQUA/netlify-mcp)

A Model Context Protocol (MCP) server for managing Netlify sites. This server enables seamless integration with Netlify's API through MCP, allowing you to create, manage, and deploy sites directly from your MCP-enabled environment.

## Features

- Create new sites from GitHub repositories
- List existing Netlify sites
- Get detailed site information
- Delete sites

## Installation

### Installing via Smithery

To install Netlify Site Manager for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@MCERQUA/netlify-mcp):

```bash
npx -y @smithery/cli install @MCERQUA/netlify-mcp --client claude
```

### Manual Installation
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

## Configuration

### Getting Your Netlify Access Token

1. Create a Netlify account at [https://app.netlify.com/signup](https://app.netlify.com/signup)
2. Go to User Settings > Applications > Personal access tokens
3. Click "New access token"
4. Give it a name (e.g., "MCP Integration")
5. Copy the generated token

### Setting Up MCP

1. Create a `.env` file in the project root:
```
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
  name: string;          // Name for the new site
  repo: string;          // GitHub repository (format: owner/repo)
  branch: string;        // Branch to deploy from
  buildCommand: string;  // Build command to run
  publishDir: string;    // Directory containing the built files
}
```

### listSites
List all Netlify sites you have access to.

```typescript
interface ListSitesArgs {
  filter?: 'all' | 'owner' | 'guest';  // Optional filter for sites
}
```

### getSite
Get detailed information about a specific site.

```typescript
interface GetSiteArgs {
  siteId: string;  // ID of the site to retrieve
}
```

### deleteSite
Delete a Netlify site.

```typescript
interface DeleteSiteArgs {
  siteId: string;  // ID of the site to delete
}
```

## Documentation

For more detailed information, see:
- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Usage Examples](docs/EXAMPLES.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
