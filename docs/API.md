# API Documentation

This document provides detailed information about each tool available in the Netlify MCP server.

## Tools Overview

The Netlify MCP server provides four main tools:
- createSiteFromGitHub
- listSites
- getSite
- deleteSite

## Detailed API Reference

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

#### Example Usage:
```typescript
{
  "name": "my-awesome-site",
  "repo": "username/repo-name",
  "branch": "main",
  "buildCommand": "npm run build",
  "publishDir": "dist"
}
```

#### Response:
```typescript
{
  "id": "site-id",
  "name": "my-awesome-site",
  "url": "https://my-awesome-site.netlify.app",
  // ... additional site details
}
```

### listSites

List all Netlify sites you have access to.

```typescript
interface ListSitesArgs {
  filter?: 'all' | 'owner' | 'guest';  // Optional filter for sites
}
```

#### Example Usage:
```typescript
{
  "filter": "owner"  // Only show sites you own
}
```

#### Response:
```typescript
[
  {
    "id": "site-id-1",
    "name": "site-1",
    "url": "https://site-1.netlify.app",
    // ... site details
  },
  // ... more sites
]
```

### getSite

Get detailed information about a specific site.

```typescript
interface GetSiteArgs {
  siteId: string;  // ID of the site to retrieve
}
```

#### Example Usage:
```typescript
{
  "siteId": "123abc"
}
```

#### Response:
```typescript
{
  "id": "123abc",
  "name": "my-site",
  "url": "https://my-site.netlify.app",
  "build_settings": {
    "repo_url": "https://github.com/username/repo",
    "branch": "main",
    "cmd": "npm run build",
    "dir": "dist"
  },
  // ... additional site details
}
```

### deleteSite

Delete a Netlify site.

```typescript
interface DeleteSiteArgs {
  siteId: string;  // ID of the site to delete
}
```

#### Example Usage:
```typescript
{
  "siteId": "123abc"
}
```

#### Response:
```typescript
{
  "success": true,
  "message": "Site 123abc deleted successfully"
}
```

## Error Handling

All tools follow a consistent error handling pattern:

```typescript
interface McpError {
  code: ErrorCode;     // Error code from MCP SDK
  message: string;     // Human-readable error message
}
```

Common error codes:
- `InvalidParams`: Missing or invalid parameters
- `InternalError`: Server-side error (includes Netlify API errors)
- `MethodNotFound`: Unknown tool name

## Rate Limiting

The Netlify API has rate limits that this MCP server adheres to. If you encounter rate limiting:
- The server will return an error with code `InternalError`
- The error message will indicate rate limiting
- Wait before retrying the request

## Best Practices

1. Always handle errors in your implementation
2. Use meaningful site names
3. Verify repository access before creating sites
4. Clean up unused sites
5. Use appropriate build settings for your project

## Additional Resources

- [Netlify API Documentation](https://docs.netlify.com/api/get-started/)
- [GitHub Repository Integration Guide](https://docs.netlify.com/configure-builds/repo-permissions-linking/)
- [Build Settings Documentation](https://docs.netlify.com/configure-builds/get-started/)