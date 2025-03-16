# Setup Guide

This guide provides detailed instructions for setting up the Netlify MCP server.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Netlify account
- A GitHub account (for deploying sites from GitHub)

## Installation Steps

### 1. Install the Package

```bash
git clone https://github.com/MCERQUA/netlify-mcp.git
cd netlify-mcp
npm install
npm run build
```

### 2. Get Your Netlify Access Token

1. Create a Netlify account:
   - Go to [https://app.netlify.com/signup](https://app.netlify.com/signup)
   - Sign up using your preferred method

2. Generate an access token:
   - Log in to your Netlify account
   - Navigate to User Settings (click your avatar in the top right)
   - Go to Applications > Personal access tokens
   - Click "New access token"
   - Give it a name (e.g., "MCP Integration")
   - Copy the generated token immediately (you won't be able to see it again)

### 3. Configure Environment Variables

1. Create a `.env` file in the project root:
```env
NETLIFY_ACCESS_TOKEN=your_token_here
```

2. Add this file to `.gitignore` (already done in this repository)

### 4. Configure MCP Settings

Add the server configuration to your MCP settings file:

#### For VSCode Claude Extension
Location: `~/.vscode/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

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

#### For Claude Desktop App
Location: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

Use the same configuration format as above.

## Verification

To verify your setup:

1. Ensure the MCP server is running
2. Try listing your Netlify sites using the `listSites` tool
3. If successful, you should see a list of your Netlify sites

## Troubleshooting

### Common Issues

1. "NETLIFY_ACCESS_TOKEN environment variable is required"
   - Ensure your token is correctly set in the MCP settings configuration
   - Verify the token is valid in your Netlify account

2. "Failed to list sites"
   - Check your internet connection
   - Verify your access token has the correct permissions
   - Ensure you're using the latest version of the server

3. Build errors
   - Ensure Node.js is version 16 or higher
   - Try deleting `node_modules` and running `npm install` again

## Security Notes

- Never commit your `.env` file or expose your access token
- Regularly rotate your Netlify access token
- Use environment variables for all sensitive information
- Consider using different tokens for development and production

## Next Steps

- Read the [API Documentation](API.md) for available tools
- Check out the [Usage Examples](EXAMPLES.md) for common scenarios
- Join our community for support and updates