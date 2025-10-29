/**
 * RAG (Retrieval-Augmented Generation) Implementation
 * 
 * This demonstrates a production-ready RAG system using:
 * - OpenAI embeddings for vector generation
 * - pgvector for PostgreSQL vector similarity search
 * - Semantic search for knowledge base retrieval
 */

import OpenAI from 'openai'

/**
 * RAG Result Interface
 */
export interface RAGResult {
  content: string
  source: string
  similarityScore: number
}

/**
 * RAG Context Interface
 */
export interface RAGContext {
  knowledgeBaseArticles: string[]
  totalResults: number
}

/**
 * Generate vector embedding for a query
 * 
 * @param query - The search query to embed
 * @param model - Embedding model (default: text-embedding-3-small)
 * @returns Promise<number[]> - Vector embedding
 */
export async function generateEmbedding(
  query: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const response = await openai.embeddings.create({
    model,
    input: query
  })

  return response.data[0].embedding
}

/**
 * Convert embedding array to PostgreSQL vector format
 * 
 * @param embedding - Array of embedding values
 * @returns string - PostgreSQL vector format string
 */
export function embeddingToVectorString(embedding: number[]): string {
  return '[' + embedding.join(',') + ']'
}

/**
 * Retrieve relevant context using vector similarity search
 * 
 * @param query - Search query
 * @param topK - Number of results to return (default: 5)
 * @returns Promise<RAGContext> - Retrieved knowledge base articles
 */
export async function retrieveRAGContext(
  query: string,
  topK: number = 5
): Promise<RAGContext> {
  try {
    // Step 1: Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)
    const embeddingString = embeddingToVectorString(queryEmbedding)

    // Step 2: Perform vector similarity search in PostgreSQL
    // Using pgvector's cosine distance operator (<=>)
    const results = await queryVectorDatabase(embeddingString, topK)

    if (!results || results.length === 0) {
      return {
        knowledgeBaseArticles: [],
        totalResults: 0
      }
    }

    // Step 3: Format results for LLM context
    const knowledgeArticles = results.map((result: any) => {
      return `[Source: ${result.document_source} (Similarity: ${parseFloat(result.similarity_score).toFixed(4)})]\n${result.content}`
    })

    return {
      knowledgeBaseArticles: knowledgeArticles,
      totalResults: knowledgeArticles.length
    }

  } catch (error) {
    console.error('Error in retrieveRAGContext:', error)
    throw new Error(`RAG retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Query vector database using pgvector
 * 
 * This is a simplified example. In production, you would use:
 * - Prisma with raw SQL queries
 * - Proper connection pooling
 * - Query optimization
 * 
 * @param embeddingString - PostgreSQL vector format string
 * @param topK - Number of results
 * @returns Promise<any[]> - Query results
 */
async function queryVectorDatabase(
  embeddingString: string,
  topK: number
): Promise<any[]> {
  // Example query structure:
  // SELECT 
  //   content,
  //   document_source,
  //   1 - (embedding <=> $1::vector) AS similarity_score
  // FROM rag_documents
  // ORDER BY embedding <=> $1::vector
  // LIMIT $2

  // In production, this would use your database client
  // e.g., Prisma $queryRawUnsafe or pg client
  
  // Example return (simplified):
  return []
}

/**
 * Generate contextual query for RAG based on user input
 * 
 * This helps improve retrieval by creating a more comprehensive query
 * that covers related topics.
 * 
 * @param userQuery - Original user query
 * @param context - Additional context (optional)
 * @returns string - Enhanced query for RAG search
 */
export function generateContextualQuery(
  userQuery: string,
  context?: string
): string {
  // In production, you might enhance the query with:
  // - Related terms
  // - Domain-specific keywords
  // - Context from previous interactions
  
  if (context) {
    return `${userQuery} ${context}`
  }
  
  return userQuery
}
