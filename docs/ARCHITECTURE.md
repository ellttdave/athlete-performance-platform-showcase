# Architecture Overview

This document provides a comprehensive overview of the system architecture, design patterns, and technical decisions.

## System Architecture

### High-Level Overview

```
┌─────────────┐
│   Frontend  │  Next.js 14, React, TypeScript
│   (Next.js) │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│  API Routes │   │   Server    │
│  (Tool      │   │   Actions   │
│  Calling)   │   │             │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 │
┌──────▼─────────────────▼──────┐
│      MCP Router                │
│  (Tool Registry & Execution)   │
└──────┬────────────────────────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐  ┌───▼──────┐  ┌───▼──────┐
│   Database  │  │   RAG     │  │   LLM    │
│  (Postgres  │  │  System   │  │ (Claude) │
│  + Prisma)  │  │           │  │         │
└─────────────┘  └───────────┘  └─────────┘
```

## Core Architecture Patterns

### 1. MCP-Like Architecture

**Purpose**: Clean separation between LLM communication and data functions

**Benefits**:
- Single responsibility principle
- Easy to test and debug
- Migration path to real MCP server
- Extensible tool registry

**Implementation**:
- Tool registry pattern for managing LLM tools
- Router API endpoint for tool execution
- Clean error handling and validation

### 2. RAG System Integration

**Purpose**: Provide LLM with access to knowledge base through semantic search

**Components**:
- Document upload and storage (Vercel Blob Storage)
- Text extraction (Google Document AI with fallback)
- PDF splitting for large files (pdf-lib)
- Vector embedding generation (OpenAI)
- Semantic search (pgvector)
- Knowledge base retrieval
- Context formatting for LLM

**Document Processing Flow**:
1. Upload document → Store in Vercel Blob Storage
2. Check file size/pages → Split if needed
3. Extract text (Document AI Form Parser or Layout Parser)
4. Fallback to unpdf if Document AI unavailable
5. Chunk text into 500-word segments
6. Generate embeddings for each chunk
7. Store in PostgreSQL with source attribution

**RAG Query Flow**:
1. User query → Generate embedding
2. Vector similarity search in PostgreSQL
3. Retrieve top-K relevant documents
4. Format context for LLM
5. LLM uses context in analysis

**Important Architecture Note**:
- **RAG System**: Used for general knowledge, research articles, best practices
- **PostgreSQL NormativeData Table**: Used for structured percentile data (deterministic queries)
- This dual approach ensures both contextual understanding (RAG) and precise data retrieval (database)

### 3. Layered Architecture

**Frontend Layer**:
- React components (UI)
- Client-side state management
- Server actions for data fetching

**API Layer**:
- RESTful API routes
- Tool execution endpoints
- Authentication/authorization

**Service Layer**:
- Business logic
- Data aggregation
- LLM integration

**Data Layer**:
- Database queries (Prisma)
- Vector search (pgvector)
- Data models

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Server Components**: Server-side rendering

### Backend
- **Next.js API Routes**: RESTful endpoints
- **Server Actions**: Form handling and mutations
- **Prisma**: ORM for database access

### Database
- **PostgreSQL**: Primary database (Neon)
- **pgvector**: Vector similarity search
- **Prisma ORM**: Type-safe database access
- **NormativeData Table**: Structured percentile data (separate from RAG)

### AI/ML
- **Anthropic Claude**: LLM for analysis
- **OpenAI Embeddings**: Vector generation
- **Tool Calling**: Structured LLM interactions

### Infrastructure
- **Vercel**: Deployment platform (Hobby: 10s timeout, Pro: up to 300s)
- **Vercel Blob Storage**: Document persistence
- **Neon**: Managed PostgreSQL
- **Google Cloud**: Document AI service (with fallback to unpdf)

## Data Flow

### Tool Execution Flow

```
1. User Message
   ↓
2. LLM Determines Tool Needed
   ↓
3. Tool Call Sent to MCP Router
   ↓
4. Router Looks Up Tool in Registry
   ↓
5. Tool Handler Executes
   ↓
6. Result Returned to LLM
   ↓
7. LLM Generates Response
```

### RAG Context Retrieval Flow

```
1. User Query
   ↓
2. Generate Query Embedding
   ↓
3. Vector Similarity Search (pgvector)
   ↓
4. Retrieve Top-K Documents
   ↓
5. Format Context for LLM
   ↓
6. Include in LLM Prompt
   ↓
7. LLM Analysis with Knowledge Base
```

## Key Design Decisions

### Why MCP-Like Pattern?

1. **Separation of Concerns**: LLM logic separate from data logic
2. **Extensibility**: Easy to add new tools
3. **Maintainability**: Clear structure, easy to understand
4. **Migration Path**: Can upgrade to real MCP server later

### Why pgvector Over External Vector DB?

1. **Simplicity**: Uses existing PostgreSQL infrastructure
2. **Consistency**: Single database for all data
3. **Performance**: Efficient for our scale
4. **Cost**: No additional service needed

### Why Next.js App Router?

1. **Modern Architecture**: Latest React patterns
2. **Server Components**: Better performance
3. **Type Safety**: Full TypeScript support
4. **Vercel Optimization**: Seamless deployment

## Scalability Considerations

### Database
- Indexed queries for performance
- Connection pooling
- Query optimization
- Vector index optimization (ivfflat)

### API
- Stateless API routes
- Efficient data fetching
- Caching strategies
- Error handling and retries

### LLM Integration
- Token optimization
- Response streaming (future)
- Rate limiting
- Cost management

## Security

### Data Protection
- Environment variables for secrets
- Input validation
- SQL injection prevention (Prisma)
- Type safety (TypeScript)

### API Security
- Request validation
- Error message sanitization
- Rate limiting (future)
- Authentication (future)

## Monitoring & Logging

### Logging
- Structured logging
- Error tracking
- Performance monitoring
- Tool execution tracking

### Metrics
- API response times
- Database query performance
- LLM token usage
- Tool execution success/failure rates

## Future Enhancements

1. **Real MCP Server**: Migrate to official MCP server
2. **Streaming Responses**: Implement response streaming
3. **Caching**: Add response caching for common queries
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Enhanced observability
