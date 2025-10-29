# LLM Integration - Technical Deep Dive

## Overview

This document details the LLM integration patterns, including tool calling, structured outputs, error handling, and best practices.

## LLM Provider: Anthropic Claude

### Why Claude?

- **Tool Calling**: Excellent support for structured tool execution
- **Reasoning**: Strong analytical capabilities
- **Reliability**: Consistent API and responses
- **Cost**: Good performance-to-cost ratio

### Model Selection

**Primary Model**: `claude-sonnet-4-20250514`
- Latest stable version
- Excellent tool calling support
- Good balance of capability and cost

## Tool Calling Architecture

### Flow

```
1. User sends message
   ↓
2. LLM determines tool needed
   ↓
3. LLM makes tool_use request
   ↓
4. Execute tool via MCP router
   ↓
5. Return tool_result to LLM
   ↓
6. LLM generates final response
```

### Tool Definition Schema

```typescript
interface ToolDefinition {
  name: string
  description: string  // Critical: LLM uses this to decide
  input_schema: {
    type: 'object'
    properties: {
      [key: string]: {
        type: string
        description: string
      }
    }
    required: string[]
  }
}
```

### Example Tool Call

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  tools: TOOL_DEFINITIONS,
  messages: [
    { role: 'user', content: 'Analyze entity 123' }
  ]
})

// LLM responds with:
{
  type: 'tool_use',
  id: 'tool_123',
  name: 'analyze_data',
  input: { entity_id: '123' }
}
```

## Structured Output Generation

### Challenge

LLMs are probabilistic - need reliable structured outputs for production use.

### Solutions

1. **JSON Schema**: Define exact output structure
2. **Validation**: Verify output matches schema
3. **Retry Logic**: Retry if validation fails
4. **Fallbacks**: Graceful degradation

### Example

```typescript
const systemPrompt = `
Generate a JSON report with this EXACT structure:
{
  "summary": "string",
  "findings": ["string"],
  "recommendations": ["string"]
}
Output ONLY valid JSON.
`

// Validate response
try {
  const report = JSON.parse(response)
  validateReport(report)
  return report
} catch (error) {
  // Retry or use fallback
}
```

## Prompt Engineering

### System Prompt Structure

```
1. Role Definition
   - Who is the AI?
   - What expertise does it have?

2. Core Mandates
   - Critical rules
   - Integrity requirements
   - Tone and style

3. Data Interpretation Rules
   - How to analyze data
   - What to prioritize
   - How to format outputs

4. Integration Instructions
   - RAG usage
   - Tool calling
   - Structured outputs
```

### Best Practices

**Be Explicit**:
- Clear instructions
- Examples when needed
- Explicit formatting rules

**Handle Edge Cases**:
- Missing data
- Invalid inputs
- Error conditions

**Enforce Constraints**:
- Output format
- Citation requirements
- Data integrity

## Error Handling

### Types of Errors

1. **API Errors**
   - Rate limits
   - Service outages
   - Network issues

2. **Tool Execution Errors**
   - Invalid parameters
   - Database errors
   - External API failures

3. **Response Validation Errors**
   - Invalid JSON
   - Missing fields
   - Type mismatches

### Error Handling Strategy

```typescript
try {
  const response = await callLLM(message)
  return processResponse(response)
} catch (error) {
  if (error.type === 'rate_limit') {
    // Retry with backoff
    return retryWithBackoff(callLLM, message)
  } else if (error.type === 'validation') {
    // Retry or use fallback
    return retryOrFallback(message)
  } else {
    // Log and return user-friendly error
    logError(error)
    return getUserFriendlyError()
  }
}
```

## Token Optimization

### Strategies

1. **Context Length Management**
   - Truncate long contexts
   - Summarize when possible
   - Use embeddings for large data

2. **Prompt Optimization**
   - Remove unnecessary text
   - Use concise descriptions
   - Efficient examples

3. **Response Length Control**
   - Set max_tokens appropriately
   - Use streaming for long responses
   - Summarize summaries

### Cost Management

- Monitor token usage
- Cache responses when possible
- Optimize prompts
- Use appropriate models

## RAG Integration

### Context Formatting

```
System: You are an analyst. Use the knowledge base context.

Knowledge Base Context:
[Source: document.pdf]
Content here...

[Source: article.pdf]
Content here...

User Query: [Query]
```

### Citation Requirements

- Cite sources in responses
- Link back to knowledge base
- Show confidence when appropriate

## Reliability Strategies

### 1. Response Validation

```typescript
function validateResponse(response: string): boolean {
  try {
    const parsed = JSON.parse(response)
    return schemaValidate(parsed, expectedSchema)
  } catch {
    return false
  }
}
```

### 2. Retry Logic

```typescript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await sleep(1000 * (i + 1))  // Exponential backoff
    }
  }
}
```

### 3. Fallbacks

```typescript
async function getAnalysis(query) {
  try {
    return await callLLM(query)
  } catch (error) {
    console.error('LLM error:', error)
    return getFallbackResponse(query)
  }
}
```

## Monitoring & Observability

### Metrics to Track

1. **Performance**
   - Response times
   - Token usage
   - API latency

2. **Reliability**
   - Success rate
   - Error types
   - Retry counts

3. **Cost**
   - Token consumption
   - API costs
   - Cost per request

### Logging

```typescript
logger.info('LLM Request', {
  query: query.substring(0, 100),
  tokensUsed: response.usage.total_tokens,
  responseTime: responseTime
})
```

## Best Practices

### 1. Tool Definitions
- Clear, specific descriptions
- Comprehensive input schemas
- Proper error handling

### 2. Prompts
- Explicit instructions
- Clear formatting rules
- Examples when helpful

### 3. Error Handling
- Graceful degradation
- User-friendly messages
- Detailed logging

### 4. Performance
- Token optimization
- Caching strategies
- Efficient queries

## Future Enhancements

1. **Streaming**: Real-time response streaming
2. **Caching**: Response caching for common queries
3. **Fine-tuning**: Custom model fine-tuning
4. **Multi-model**: Fallback to alternative models
5. **Advanced Validation**: ML-based response validation
