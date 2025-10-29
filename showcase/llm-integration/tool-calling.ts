/**
 * LLM Tool Calling Implementation
 * 
 * Demonstrates structured tool calling with Anthropic Claude API,
 * including error handling, validation, and structured output generation.
 */

import Anthropic from '@anthropic-ai/sdk'

/**
 * Tool Definition for LLM
 * Matches Anthropic's tool schema format
 */
interface ToolDefinition {
  name: string
  description: string
  input_schema: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

/**
 * Example tool definitions for the LLM
 */
const TOOLS: ToolDefinition[] = [
  {
    name: 'analyze_data',
    description: 'Analyze comprehensive data across multiple sources and domains',
    input_schema: {
      type: 'object',
      properties: {
        entity_id: {
          type: 'string',
          description: 'The entity identifier to analyze'
        },
        time_period_days: {
          type: 'number',
          description: 'Number of days to look back (optional, default: 730)'
        }
      },
      required: ['entity_id']
    }
  }
]

/**
 * Execute tool call via MCP router
 * 
 * @param toolCall - Tool call from LLM
 * @param routerUrl - MCP router endpoint URL
 * @returns Promise<any> - Tool execution result
 */
async function executeToolCall(
  toolCall: any,
  routerUrl: string
): Promise<any> {
  const response = await fetch(routerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool_name: toolCall.name,
      parameters: toolCall.input
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Tool execution failed: ${error.error}`)
  }

  const result = await response.json()
  return JSON.parse(result.result)
}

/**
 * Send message to LLM with tool calling capability
 * 
 * @param message - User message
 * @param userId - User identifier
 * @returns Promise<string> - LLM response
 */
export async function chatWithTools(
  message: string,
  userId: string
): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools: TOOLS,
    messages: [
      {
        role: 'user',
        content: message
      }
    ]
  })

  // Handle tool calls
  for (const content of response.content) {
    if (content.type === 'tool_use') {
      try {
        // Execute tool via MCP router
        const toolResult = await executeToolCall(
          content,
          `${process.env.NEXT_PUBLIC_API_URL}/api/mcp-router`
        )

        // Send tool result back to LLM
        const toolResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          tools: TOOLS,
          messages: [
            {
              role: 'user',
              content: message
            },
            {
              role: 'assistant',
              content: [{ type: 'tool_use', ...content }]
            },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: content.id,
                  content: JSON.stringify(toolResult)
                }
              ]
            }
          ]
        })

        // Return final response
        return extractTextFromResponse(toolResponse)
      } catch (error) {
        console.error('Tool execution error:', error)
        return `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Return text response if no tools were called
  return extractTextFromResponse(response)
}

/**
 * Extract text content from Anthropic response
 */
function extractTextFromResponse(response: any): string {
  const textParts: string[] = []
  
  for (const content of response.content) {
    if (content.type === 'text') {
      textParts.push(content.text)
    }
  }
  
  return textParts.join('\n')
}

/**
 * Example usage
 */
async function example() {
  const response = await chatWithTools(
    'Analyze entity 123 for the last year',
    'user-1'
  )
  console.log(response)
}
