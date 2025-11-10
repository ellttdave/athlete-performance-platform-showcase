[![Release](https://img.shields.io/github/v/release/ellttdave/athlete-performance-platform-showcase?display_name=tag)](https://github.com/ellttdave/athlete-performance-platform-showcase/releases)
[![License](https://img.shields.io/github/license/ellttdave/athlete-performance-platform-showcase)](./LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/ellttdave/athlete-performance-platform-showcase)](https://github.com/ellttdave/athlete-performance-platform-showcase/commits)
[![Stars](https://img.shields.io/github/stars/ellttdave/athlete-performance-platform-showcase)](https://github.com/ellttdave/athlete-performance-platform-showcase/stargazers)

![Top language](https://img.shields.io/github/languages/top/ellttdave/athlete-performance-platform-showcase)
![Repo size](https://img.shields.io/github/repo-size/ellttdave/athlete-performance-platform-showcase)

# Athlete Performance Analytics Platform - Technical Showcase

> A production application demonstrating advanced LLM integration, RAG systems, and modern full-stack architecture patterns.

## 🎯 Project Overview

This repository showcases the technical architecture and implementation patterns from a production application that integrates:

- **LLM Integration** (Anthropic Claude) with structured tool calling
- **RAG System** (Retrieval-Augmented Generation) with vector embeddings
- **MCP-like Architecture** for clean separation of concerns
- **Modern Full-Stack** development with Next.js, TypeScript, and PostgreSQL

**Note**: This repository contains sanitized code examples and architecture documentation for showcaase purposes. The full production application remains private to protect intellectual property.

## 🏗️ Architecture Highlights

### MCP-Like Tool Integration Pattern
A custom architecture pattern that mimics Model Context Protocol (MCP) to provide clean separation between LLM communication logic and data functions.

**Key Benefits:**
- Single gateway for all LLM tool calls
- Easy migration path to real MCP server
- Extensible tool registry pattern
- Comprehensive error handling

[View Architecture Details →](./docs/MCP_ARCHITECTURE.md)

### RAG Implementation
A production-ready RAG system using vector embeddings and semantic search.

**Key Features:**
- Google Document AI for advanced text extraction (Form Parser, Layout Parser)
- Automatic PDF splitting for large files (>15 pages or >4MB)
- OpenAI embeddings (text-embedding-3-small)
- pgvector for PostgreSQL vector similarity search
- Vercel Blob Storage for document persistence
- Individual document re-processing to avoid timeout issues
- Fallback mechanisms (unpdf) for reliability
- Automatic knowledge base integration
- Top-K retrieval with similarity scoring

**Architecture Note:**
- RAG is used for general knowledge, research articles, and contextual explanations
- Precise numeric/reference data is stored in PostgreSQL (not RAG) for deterministic queries

[View RAG Implementation →](./docs/RAG_IMPLEMENTATION.md)

### Full-Stack Design
Modern web application architecture with:

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Neon) with Prisma ORM, pgvector extension
- **AI/ML**: Anthropic Claude API, OpenAI Embeddings
- **Document Processing**: Google Document AI, pdf-lib for PDF splitting
- **Storage**: Vercel Blob Storage for document persistence
- **Deployment**: Vercel

[View Tech Stack Details →](./docs/TECH_STACK.md)

## 📚 Documentation

- **[Architecture Overview](./docs/ARCHITECTURE.md)** - System design and architecture patterns
- **[MCP Architecture](./docs/MCP_ARCHITECTURE.md)** - Tool registry pattern and implementation
- **[RAG Implementation](./docs/RAG_IMPLEMENTATION.md)** - Vector embeddings and semantic search
- **[LLM Integration](./docs/LLM_INTEGRATION.md)** - Tool calling and structured outputs
- **[Tech Stack](./docs/TECH_STACK.md)** - Technology choices and rationale

## 💻 Code Examples

Sanitized code examples demonstrating key patterns:

- **[MCP Router Pattern](./showcase/mcp-router/)** - Tool registry and routing
- **[RAG Implementation](./showcase/rag/)** - Vector embeddings and search
- **[LLM Integration](./showcase/llm-integration/)** - Tool calling examples

## 🛠️ Key Technical Features

### 1. Custom Tool Registry Pattern
Clean separation between LLM communication and data functions:

```typescript
// Extensible tool registry
const TOOL_REGISTRY = {
  'analyze_data': {
    description: 'Comprehensive data analysis tool',
    handler: async (params) => { /* ... */ }
  }
}
```

### 2. RAG System with Vector Search
Production-ready retrieval-augmented generation:

- Vector embedding generation
- Semantic similarity search
- Knowledge base integration
- Context retrieval for LLM

### 3. Structured LLM Outputs
Type-safe JSON generation with validation:

- Schema validation
- Error handling
- Data integrity measures
- Reliable structured outputs

### 4. Production-Ready Patterns
- Comprehensive error handling
- Logging and monitoring
- Type safety with TypeScript
- Scalable architecture

## 💡 Technical Insights

### Why MCP-Like Architecture?
- Provides clean separation of concerns
- Makes LLM integration maintainable
- Allows easy addition of new tools
- Facilitates migration to real MCP server

### RAG Implementation Decisions
- Chose pgvector over external vector DB for simplicity
- OpenAI embeddings for reliability
- Top-K retrieval for performance
- Integration with existing PostgreSQL infrastructure

### LLM Integration Challenges
- Structured output reliability
- Data integrity enforcement
- Error handling and fallbacks
- Token optimization

## 🚀 Key Achievements

- ✅ Implemented custom MCP-like architecture for LLM tool integration
- ✅ Built production RAG system with vector embeddings
- ✅ Designed scalable data models for multi-modal analytics
- ✅ Created evidence-based analysis engine with citation requirements
- ✅ Deployed production application with optimized performance

## 📄 License

Technical showcase - Code examples are for demonstration and educational purposes.

**Note**: This repository contains sanitized code examples and architecture documentation. The full production application remains private to protect intellectual property.

---

## Connect

- LinkedIn: http://linkedin.com/in/david-elliott-6304555a
- Email: ellttdave218@gmail.com
