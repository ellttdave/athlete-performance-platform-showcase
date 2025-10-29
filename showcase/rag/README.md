# RAG Implementation

This directory contains sanitized examples of the RAG (Retrieval-Augmented Generation) system implementation.

## Overview

The RAG system enables the LLM to access a knowledge base of documents through vector similarity search:

1. **Embedding Generation**: Convert queries to vector embeddings
2. **Vector Search**: Find similar content in knowledge base
3. **Context Retrieval**: Return relevant articles for LLM
4. **Integration**: Seamlessly integrate with LLM analysis

## Architecture

```
User Query
    ↓
Generate Embedding (OpenAI)
    ↓
Vector Similarity Search (pgvector)
    ↓
Retrieve Top-K Results
    ↓
Format for LLM Context
    ↓
LLM Analysis with Knowledge Base
```

## Key Components

### 1. Embedding Generation
Uses OpenAI's `text-embedding-3-small` model:

```typescript
const embedding = await generateEmbedding(query)
```

### 2. Vector Search
PostgreSQL with pgvector extension:

```sql
SELECT content, document_source,
       1 - (embedding <=> $1::vector) AS similarity_score
FROM rag_documents
ORDER BY embedding <=> $1::vector
LIMIT 5
```

### 3. Context Formatting
Formats results for LLM consumption:

```typescript
const context = results.map(r => 
  `[Source: ${r.source}]\n${r.content}`
)
```

## Technical Decisions

### Why pgvector?
- **Simplicity**: Uses existing PostgreSQL infrastructure
- **Performance**: Efficient vector operations
- **Integration**: Seamless with Prisma/PostgreSQL stack

### Why OpenAI Embeddings?
- **Reliability**: Production-tested model
- **Quality**: Good semantic understanding
- **Consistency**: Stable embedding dimensions

### Top-K Retrieval
Returns top 5 most similar articles:
- Balances relevance and context length
- Optimized for token efficiency
- Provides sufficient context for analysis

## Database Setup

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create RAG documents table
CREATE TABLE rag_documents (
    id SERIAL PRIMARY KEY,
    document_source TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536)
);

-- Create index for similarity search
CREATE INDEX rag_documents_embedding_idx 
ON rag_documents USING ivfflat (embedding vector_cosine_ops);
```

## Usage Example

```typescript
// Retrieve relevant context for a query
const context = await retrieveRAGContext(
  'How to improve jump performance?',
  5 // top 5 results
)

// Use context in LLM analysis
const analysis = await analyzeWithContext(userQuery, context)
```

## Benefits

1. **Evidence-Based**: LLM responses grounded in knowledge base
2. **Accurate**: Reduces hallucinations with real sources
3. **Flexible**: Easy to add new documents
4. **Scalable**: Efficient vector search at scale
