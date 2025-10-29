# MCP Router Pattern

This directory contains a sanitized example of the MCP-like router implementation pattern.

## Overview

The MCP (Model Context Protocol) router provides a clean architecture pattern for LLM tool integration. This implementation demonstrates:

- **Tool Registry Pattern**: Centralized tool management
- **Clean Separation**: LLM communication vs. data functions
- **Error Handling**: Comprehensive error management
- **Extensibility**: Easy addition of new tools

## Key Components

### 1. Tool Registry
The `TOOL_REGISTRY` object maps tool names to their handlers:

```typescript
const TOOL_REGISTRY = {
  'tool_name': {
    description: 'Tool description for LLM',
    handler: async (params) => { /* implementation */ }
  }
}
```

### 2. POST Handler
Executes tool calls from LLM requests with validation and error handling.

### 3. GET Handler
Lists available tools for discovery and debugging.

## Benefits

1. **Extensibility**: New tools can be added easily
2. **Maintainability**: Clear separation of concerns
3. **Type Safety**: TypeScript interfaces ensure correctness
4. **Error Handling**: Centralized error management
5. **Migration Path**: Easy to migrate to real MCP server

## Usage Example

```typescript
// LLM makes tool call request
const response = await fetch('/api/mcp-router', {
  method: 'POST',
  body: JSON.stringify({
    tool_name: 'analyze_data',
    parameters: { entity_id: '123', time_period_days: 365 }
  })
})

// Router executes tool and returns result
const result = await response.json()
```

## Adding New Tools

Simply add to the registry:

```typescript
TOOL_REGISTRY['new_tool'] = {
  description: 'Description for LLM',
  handler: async (params) => {
    // Implementation
  }
}
```

The LLM will automatically discover and use the new tool.
