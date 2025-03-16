# Usage Examples

This document provides practical examples of using the Netlify MCP server tools in various scenarios.

## Common Use Cases

### 1. Deploy a React Application

```typescript
// Create a new site from a React repository
await use_mcp_tool({
  server_name: "netlify",
  tool_name: "createSiteFromGitHub",
  arguments: {
    name: "my-react-app",
    repo: "username/react-project",
    branch: "main",
    buildCommand: "npm run build",
    publishDir: "build"
  }
});
```

### 2. Deploy a Next.js Application

```typescript
// Create a new site from a Next.js repository
await use_mcp_tool({
  server_name: "netlify",
  tool_name: "createSiteFromGitHub",
  arguments: {
    name: "nextjs-blog",
    repo: "username/nextjs-blog",
    branch: "main",
    buildCommand: "next build",
    publishDir: ".next"
  }
});
```

### 3. Manage Multiple Sites

```typescript
// List all your sites
const sites = await use_mcp_tool({
  server_name: "netlify",
  tool_name: "listSites",
  arguments: {
    filter: "owner"
  }
});

// Get details for a specific site
const siteDetails = await use_mcp_tool({
  server_name: "netlify",
  tool_name: "getSite",
  arguments: {
    siteId: sites[0].id
  }
});

// Delete an unused site
await use_mcp_tool({
  server_name: "netlify",
  tool_name: "deleteSite",
  arguments: {
    siteId: "site-to-delete-id"
  }
});
```

### 4. Deploy a Static Site

```typescript
// Create a new site from a static HTML/CSS/JS repository
await use_mcp_tool({
  server_name: "netlify",
  tool_name: "createSiteFromGitHub",
  arguments: {
    name: "static-portfolio",
    repo: "username/portfolio",
    branch: "main",
    buildCommand: "",  // No build needed for static sites
    publishDir: "."
  }
});
```

### 5. Deploy a Vue.js Application

```typescript
// Create a new site from a Vue.js repository
await use_mcp_tool({
  server_name: "netlify",
  tool_name: "createSiteFromGitHub",
  arguments: {
    name: "vue-app",
    repo: "username/vue-project",
    branch: "main",
    buildCommand: "npm run build",
    publishDir: "dist"
  }
});
```

## Error Handling Examples

### Handle Rate Limiting

```typescript
try {
  await use_mcp_tool({
    server_name: "netlify",
    tool_name: "listSites",
    arguments: {}
  });
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 60000));
    // Retry the request
    // ...
  }
}
```

### Handle Missing Parameters

```typescript
try {
  await use_mcp_tool({
    server_name: "netlify",
    tool_name: "createSiteFromGitHub",
    arguments: {
      name: "my-site"
      // Missing required parameters will throw an error
    }
  });
} catch (error) {
  console.error('Missing required parameters:', error.message);
}
```

## Best Practices Examples

### 1. Verify Site Creation

```typescript
// Create site and verify it's accessible
const newSite = await use_mcp_tool({
  server_name: "netlify",
  tool_name: "createSiteFromGitHub",
  arguments: {
    name: "new-project",
    repo: "username/project",
    branch: "main",
    buildCommand: "npm run build",
    publishDir: "dist"
  }
});

// Verify site creation
const siteDetails = await use_mcp_tool({
  server_name: "netlify",
  tool_name: "getSite",
  arguments: {
    siteId: newSite.id
  }
});
```

### 2. Clean Up Old Sites

```typescript
// List and clean up unused sites
const sites = await use_mcp_tool({
  server_name: "netlify",
  tool_name: "listSites",
  arguments: {
    filter: "owner"
  }
});

// Delete sites matching certain criteria
for (const site of sites) {
  if (site.name.startsWith('test-')) {
    await use_mcp_tool({
      server_name: "netlify",
      tool_name: "deleteSite",
      arguments: {
        siteId: site.id
      }
    });
  }
}
```

## Additional Tips

1. Always use meaningful site names that reflect the project
2. Include error handling for all operations
3. Verify successful deployment after site creation
4. Use appropriate build settings for your framework
5. Clean up unused sites regularly

## Common Issues and Solutions

1. Build Failures
   - Verify build command is correct for your framework
   - Ensure all dependencies are properly specified
   - Check publish directory matches your project structure

2. Repository Access
   - Ensure repository is public or Netlify has access
   - Verify branch name is correct
   - Check repository path format (username/repo)

3. Deployment Issues
   - Verify build output is in the correct directory
   - Check for environment variables needed for build
   - Review build logs for specific errors