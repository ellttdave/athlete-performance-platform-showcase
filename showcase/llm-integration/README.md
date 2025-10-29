# LLM Integration

This directory contains examples of LLM integration patterns, including tool calling and structured outputs.

## Overview

The LLM integration demonstrates:

- **Tool Calling**: Structured tool execution via MCP router
- **Error Handling**: Comprehensive error management
- **Response Processing**: Text extraction and formatting
- **Tool Definitions**: Type-safe tool schemas

## Key Components

### 1. Tool Definitions
Define tools with Anthropic's schema format:

```typescript
const TOOLS = [{
  name: 'analyze_data',
  description: 'Tool description',
  input_schema: { /* schema */ }
}]
```

### 2. Tool Execution
Execute tools via MCP router:

```typescript
const result = await executeToolCall(toolCall, routerUrl)
```

### 3. Response Handling
Process LLM responses and tool results:

```typescript
const response = await chatWithTools(message, userId)
```

## Workflow

1. **User sends message** to LLM
2. **LLM determines** if tool is needed
3. **Tool call** sent to MCP router
4. **Router executes** tool handler
5. **Result returned** to LLM
6. **LLM generates** final response

## Error Handling

- Tool execution failures caught and reported
- Network errors handled gracefully
- Invalid tool calls rejected
- User-friendly error messages

## Best Practices

1. **Type Safety**: Use TypeScript interfaces for tool definitions
2. **Validation**: Validate tool inputs before execution
3. **Error Handling**: Comprehensive error handling at all levels
4. **Logging**: Log tool calls for debugging and monitoring
5. **Timeout**: Implement timeouts for long-running tools
