# RAG Implementation - Technical Deep Dive

## Overview

This document details the production-ready RAG (Retrieval-Augmented Generation) system implementation, including vector embeddings, semantic search, and knowledge base integration.

## What is RAG?

Retrieval-Augmented Generation combines:
- **Retrieval**: Finding relevant information from a knowledge base
- **Augmentation**: Adding that information to LLM context
- **Generation**: LLM generates responses using retrieved context

**Benefits**:
- Reduces hallucinations
- Provides evidence-based responses
- Uses up-to-date information
- Grounds responses in knowledge base

## System Architecture

### Flow Diagram

```
User Query
    ↓
Generate Embedding
(OpenAI text-embedding-3-small)
    ↓
Vector Similarity Search
(PostgreSQL + pgvector)
    ↓
Retrieve Top-K Documents
(Similarity threshold filtering)
    ↓
Format Context
(Source attribution + content)
    ↓
Include in LLM Prompt
(Claude with context)
    ↓
LLM Response
(Evidence-based analysis)
```

## Technical Implementation

### 1. Embedding Generation

**Model**: OpenAI `text-embedding-3-small`
**Dimension**: 1536
**Cost**: Low (optimized for production use)

```typescript
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: query
})
```

**Why this model?**
- Production-tested reliability
- Good semantic understanding
- Cost-effective
- Consistent dimensions

### 2. Vector Storage

**Database**: PostgreSQL with pgvector extension
**Table Structure**:

```sql
CREATE TABLE rag_documents (
    id SERIAL PRIMARY KEY,
    document_source TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536)
);
```

**Index**:
```sql
CREATE INDEX rag_documents_embedding_idx 
ON rag_documents USING ivfflat (
    embedding vector_cosine_ops
);
```

### 3. Similarity Search

**Query Pattern**:

```sql
SELECT 
    content,
    document_source,
    1 - (embedding <=> $1::vector) AS similarity_score
FROM rag_documents
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

**Operators**:
- `<=>`: Cosine distance
- `1 - distance`: Convert to similarity score
- `LIMIT 5`: Top-K retrieval

### 4. Context Formatting

**Format**:
```
[Source: document.pdf (Similarity: 0.8923)]
Document content here...
```

**Benefits**:
- Source attribution
- Similarity scores for transparency
- Clear context separation

## Knowledge Base Management

### Document Ingestion

**Process**:
1. Upload documents (PDF, DOCX, TXT, Excel, PowerPoint, HTML, Images)
2. Store in Vercel Blob Storage for persistence
3. Extract text using Google Document AI:
   - **Form Parser**: For structured tables (15 page limit in non-imageless mode)
   - **Layout Parser**: For general text extraction (30 page limit)
   - **Fallback**: unpdf for PDFs when Document AI unavailable
4. Split large PDFs automatically (>15 pages or >4MB)
5. Chunk into 500-word segments
6. Generate embeddings for each chunk
7. Store in database with source attribution

**Supported File Types**:
- PDF (with automatic splitting)
- DOCX (Word documents)
- TXT (Text files)
- Excel (XLSX/XLS)
- PowerPoint (PPTX)
- HTML
- Images (JPEG/PNG) with OCR

**PDF Splitting**:
- Automatic splitting for files >15 pages (Form Parser limit)
- Automatic splitting for files >4MB (Vercel serverless limit)
- Uses `pdf-lib` for serverless-compatible splitting
- Each part processed independently

**Chunking Strategy**:
- 500 words per chunk
- Overlap between chunks (optional)
- Preserve context
- Source attribution in each chunk

### Document Processing Architecture

**Important Distinction:**
- **RAG System**: Used for general knowledge, research articles, best practices, and contextual explanations
- **PostgreSQL NormativeData Table**: Used for structured percentile data (deterministic queries)

**Why This Architecture:**
- RAG is probabilistic and may not reliably retrieve exact percentile values
- Structured database provides deterministic, fast queries for percentile calculations
- Best of both worlds: RAG for context, database for precision

### Document Updates

**Individual Re-processing**:
- Each document can be re-processed individually via admin interface
- Avoids timeout issues on Vercel Hobby plan (10s limit)
- PDF splitting happens automatically if needed

**Bulk Re-ingestion**:
- Process all documents at once
- Limited by Vercel timeout (10s Hobby, 300s Pro with maxDuration)
- Includes timeout buffer checks to save progress

**When to Re-ingest**:
- New documents added
- Documents modified
- Knowledge base updates
- Document AI extraction improved

**Process**:
- Remove old embeddings for document
- Re-extract text (with Document AI or fallback)
- Generate new embeddings
- Update database

## Performance Optimization

### Vector Index

**IVFFlat Index**:
- Fast approximate search
- Good for production scale
- Configurable accuracy

**Parameters**:
- Lists: Balance speed vs accuracy
- Probes: Query-time accuracy control

### Query Optimization

**Top-K Selection**:
- K=5: Good balance of context and tokens
- Similarity threshold: Filter low-quality matches
- Content length: Consider token limits

### Caching

**Considerations**:
- Cache frequent queries
- Invalidate on document updates
- Balance freshness vs performance

## Integration with LLM

### Context Inclusion

**Prompt Structure**:
```
System: You are an analyst. Use the knowledge base context provided.

User: [Query]

Knowledge Base Context:
[Source 1]
[Content]

[Source 2]
[Content]
```

### Citation Requirements

**Include Sources**:
- Cite documents in responses
- Link back to sources
- Show similarity scores (optional)

## Challenges & Solutions

### Challenge 1: Irrelevant Results
**Solution**: Similarity threshold filtering

```typescript
const relevant = results.filter(r => 
  r.similarity_score > 0.7
)
```

### Challenge 2: Too Much Context
**Solution**: Limit chunk size and count

```typescript
const context = results
  .slice(0, 5)  // Top 5
  .map(r => r.content.substring(0, 1000))  // Limit length
```

### Challenge 3: Outdated Information
**Solution**: Document versioning and re-ingestion

### Challenge 4: Cost Management
**Solution**: 
- Cache embeddings
- Batch operations
- Use efficient models

## Best Practices

### 1. Document Quality
- Use authoritative sources
- Keep documents updated
- Clean and format content

### 2. Chunking Strategy
- Appropriate chunk size
- Preserve context
- Handle cross-chunk references

### 3. Query Enhancement
- Expand queries with related terms
- Use domain-specific vocabulary
- Consider context from conversation

### 4. Result Filtering
- Similarity thresholds
- Relevance scoring
- Diversity in results

## Monitoring

### Metrics to Track

1. **Embedding Generation**
   - API response times
   - Error rates
   - Token usage

2. **Vector Search**
   - Query performance
   - Index efficiency
   - Result quality

3. **LLM Integration**
   - Context usage
   - Response quality
   - Citation accuracy

## Future Enhancements

1. **Hybrid Search**: Combine vector and keyword search
2. **Re-ranking**: ML-based result re-ranking
3. **Multi-modal**: Support images, tables
4. **Real-time Updates**: Streaming document updates
5. **Advanced Filtering**: Metadata-based filtering
