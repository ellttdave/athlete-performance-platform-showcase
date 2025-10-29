# MCP Architecture - Technical Deep Dive

## Overview

This document details the MCP-like architecture pattern implemented for LLM tool integration. This pattern provides clean separation between LLM communication logic and data functions.

## What is MCP?

Model Context Protocol (MCP) is a protocol for connecting AI assistants to external data sources and tools. Our implementation creates a similar pattern using a custom tool registry and router.

## Architecture Pattern

### Component Diagram

```
┌─────────────────┐
│   LLM (Claude)  │
│   Makes Tool    │
│   Call Request   │
└────────┬────────┘
         │
         │ POST /api/mcp-router
         │ { tool_name, parameters }
         ↓
┌─────────────────┐
│   MCP Router     │
│   (API Route)    │
└────────┬────────┘
         │
         │ Looks up tool in registry
         ↓
┌─────────────────┐
│  Tool Registry  │
│  (Map of Tools) │
└────────┬────────┘
         │
         │ Executes handler
         ↓
┌─────────────────┐
│  Tool Handler    │
│  (Data Function) │
└────────┬────────┘
         │
         │ Returns result
         ↓
┌─────────────────┐
│   LLM Response   │
└─────────────────┘
```

## Tool Registry Pattern

### Structure

```typescript
interface ToolDefinition {
  description: string  // For LLM to understand tool purpose
  handler: (params: any) => Promise<any>  // Execution function
}

const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  'tool_name': {
    description: 'What this tool does',
    handler: async (params) => {
      // Implementation
    }
  }
}
```

### Benefits

1. **Centralized Management**: All tools in one place
2. **Type Safety**: TypeScript ensures correctness
3. **Extensibility**: Easy to add new tools
4. **Discovery**: GET endpoint lists available tools

## Router Implementation

### POST Handler Flow

1. **Receive Request**: Extract tool_name and parameters
2. **Validate**: Check required fields
3. **Lookup**: Find tool in registry
4. **Execute**: Run tool handler
5. **Return**: Send result back

### Error Handling

```typescript
// Validation errors (400)
- Missing tool_name
- Missing parameters
- Unknown tool

// Execution errors (500)
- Tool handler throws error
- Database errors
- External API failures

// Format errors (400)
- Invalid JSON
- Malformed request
```

## Tool Definition Best Practices

### 1. Clear Descriptions
LLM uses descriptions to decide when to call tools:

```typescript
description: 'Analyze comprehensive data across multiple sources'
// ✅ Good: Clear and specific

description: 'Does stuff'
// ❌ Bad: Vague and unhelpful
```

### 2. Parameter Validation
Validate inputs in handler:

```typescript
handler: async (params) => {
  if (!params.entity_id) {
    throw new Error('entity_id required')
  }
  // ...
}
```

### 3. Error Handling
Provide meaningful errors:

```typescript
try {
  return await executeTool(params)
} catch (error) {
  throw new Error(`Tool execution failed: ${error.message}`)
}
```

## Migration Path to Real MCP

### Current Implementation
- Custom tool registry
- Custom router endpoint
- Custom request/response format

### Future MCP Implementation
1. Install MCP server SDK
2. Implement MCP server protocol
3. Update router endpoint to MCP format
4. Migrate tool definitions to MCP schema
5. Update LLM integration to use MCP client

**Key Insight**: The tool registry pattern makes migration straightforward - only the router implementation changes, not the tools themselves.

## Example Tool Implementation

### Adding a New Tool

```typescript
// 1. Define handler function
async function getSummaryTool(params: { entity_id: string }) {
  // Fetch data
  const data = await fetchEntityData(params.entity_id)
  
  // Process
  const summary = generateSummary(data)
  
  // Return
  return summary
}

// 2. Add to registry
TOOL_REGISTRY['get_summary'] = {
  description: 'Get quick summary of entity',
  handler: getSummaryTool
}

// 3. That's it! LLM can now use the tool
```

### LLM Integration

The LLM automatically discovers tools through Anthropic's tool schema:

```typescript
const tools = Object.entries(TOOL_REGISTRY).map(([name, tool]) => ({
  name,
  description: tool.description,
  input_schema: { /* schema */ }
}))
```

## Benefits of This Pattern

### 1. Clean Separation
- LLM communication logic separate from data logic
- Easy to understand and maintain
- Clear responsibilities

### 2. Extensibility
- Add new tools easily
- No need to modify existing code
- Register and go

### 3. Testability
- Test tools independently
- Mock router for testing
- Clear interfaces

### 4. Maintainability
- Single registry for all tools
- Consistent error handling
- Centralized logging

## Performance Considerations

### Tool Execution
- Async handlers for non-blocking execution
- Timeout handling for long operations
- Error recovery and retries

### Registry Lookup
- O(1) lookup with hash map
- Fast tool discovery
- Minimal overhead

## Security Considerations

### Input Validation
- Validate all parameters
- Type checking with TypeScript
- Sanitize inputs

### Error Messages
- Don't expose internal details
- Generic error messages for users
- Detailed logs for debugging

## Future Enhancements

1. **Tool Versioning**: Support multiple versions
2. **Tool Caching**: Cache tool results
3. **Rate Limiting**: Per-tool rate limits
4. **Analytics**: Track tool usage
5. **Permissions**: Role-based tool access
