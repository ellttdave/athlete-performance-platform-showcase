# Tech Stack - Technology Choices and Rationale

## Overview

This document details the technology stack choices, rationale, and alternatives considered for the production application.

## Frontend Stack

### Next.js 14

**Why Next.js?**
- Modern React framework with App Router
- Built-in server-side rendering
- Excellent TypeScript support
- Optimized for Vercel deployment
- Active community and ecosystem

**Key Features Used:**
- App Router for routing
- Server Components for performance
- Server Actions for mutations
- API Routes for backend logic

**Alternatives Considered:**
- Remix: Similar features, smaller ecosystem
- SvelteKit: Different paradigm, less familiar
- Vite + React: More setup required

### React 18

**Why React 18?**
- Stable and mature framework
- Large ecosystem
- Server Components support
- Concurrent rendering

### TypeScript

**Why TypeScript?**
- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Refactoring confidence

### Tailwind CSS

**Why Tailwind?**
- Rapid development
- Consistent design system
- Utility-first approach
- Small bundle size (with purging)

## Backend Stack

### Next.js API Routes

**Why API Routes?**
- Integrated with Next.js
- No separate backend needed
- Easy deployment on Vercel
- Type-safe with TypeScript

### Server Actions

**Why Server Actions?**
- Seamless form handling
- Type-safe mutations
- Progressive enhancement
- Simple data fetching

## Database Stack

### PostgreSQL (Neon)

**Why PostgreSQL?**
- Robust relational database
- Excellent JSON support
- Rich ecosystem
- pgvector extension available

**Why Neon?**
- Serverless PostgreSQL
- Automatic scaling
- Easy Vercel integration
- Branching support

### Prisma ORM

**Why Prisma?**
- Type-safe database access
- Excellent TypeScript support
- Migration system
- Great developer experience

**Alternatives Considered:**
- Drizzle: Similar, newer
- TypeORM: More complex
- Raw SQL: Less type safety

### pgvector

**Why pgvector?**
- Vector extension for PostgreSQL
- Integrated with existing database
- Efficient similarity search
- No additional service needed

**Alternatives Considered:**
- Pinecone: External service, additional cost
- Weaviate: Separate database, complexity
- Qdrant: Separate service, overhead

## AI/ML Stack

### Anthropic Claude

**Why Claude?**
- Excellent reasoning capabilities
- Tool calling support
- Structured outputs
- Good performance/cost ratio

**Model Used:**
- `claude-sonnet-4-20250514`: Latest stable version

### OpenAI Embeddings

**Why OpenAI?**
- Production-tested reliability
- Good embedding quality
- Consistent API
- Reasonable pricing

**Model Used:**
- `text-embedding-3-small`: Cost-effective, good quality

**Alternatives Considered:**
- Cohere: Good quality, smaller ecosystem
- Sentence Transformers: Self-hosted, more setup
- Hugging Face: More options, more complexity

### Google Document AI

**Why Document AI?**
- Advanced PDF parsing and OCR
- Table extraction capabilities
- Structured document understanding
- Production-grade reliability

**Processors Used:**
- **Form Parser**: Extracts structured tables (15 page limit in non-imageless mode, 30 in imageless)
- **Layout Parser**: General text extraction and document structure (30 page limit)

**Fallback Strategy:**
- unpdf for PDFs when Document AI credentials unavailable
- Ensures system continues working even without Google Cloud setup

**Alternatives Considered:**
- Tesseract OCR: Self-hosted, more setup
- AWS Textract: Similar capabilities, different provider
- Direct PDF parsing: Less accurate for complex documents

## Infrastructure

### Vercel

**Why Vercel?**
- Seamless Next.js deployment
- Automatic scaling
- Edge network
- Excellent developer experience

**Features Used:**
- Automatic deployments
- Preview deployments
- Environment variables
- Analytics
- Blob Storage for document persistence
- Serverless functions with configurable timeouts

**Timeout Limitations:**
- Hobby plan: 10 seconds (limits bulk operations)
- Pro plan: Up to 300 seconds with `maxDuration` export
- Individual document processing avoids timeout issues

**Alternatives Considered:**
- AWS: More control, more complexity
- Railway: Simpler, smaller ecosystem
- Netlify: Similar, less Next.js focus

### Vercel Blob Storage

**Why Vercel Blob?**
- Integrated with Vercel deployment
- Persistent document storage
- Easy file upload/download
- No additional service needed

**Use Cases:**
- Store uploaded RAG documents
- Persistent file storage across deployments
- Direct URL access for document processing

### Neon PostgreSQL

**Why Neon?**
- Serverless PostgreSQL
- Automatic scaling
- Branching support
- Easy integration

## Document Processing Tools

### PDF Processing
- **pdf-lib**: Pure JavaScript PDF manipulation for serverless environments
- **Automatic Splitting**: Handles large PDFs (>15 pages or >4MB)
- **Serverless Compatible**: No native dependencies

### Text Extraction
- **Google Document AI**: Primary extraction method
- **unpdf**: Fallback for PDFs when Document AI unavailable
- **Multi-format Support**: PDF, DOCX, TXT, Excel, PowerPoint, HTML, Images

## Development Tools

### Package Management
- **npm**: Standard Node.js package manager

### Type Checking
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality

### Code Formatting
- **Prettier**: Consistent formatting (implied)

### Database Tools
- **Prisma Studio**: Database GUI
- **pgAdmin**: PostgreSQL management

## Design Decisions

### Monolith vs Microservices

**Decision**: Monolith (Next.js full-stack)

**Rationale**:
- Faster development
- Easier deployment
- Simpler architecture
- Can split later if needed

### SQL vs NoSQL

**Decision**: PostgreSQL (SQL)

**Rationale**:
- Relational data benefits
- ACID guarantees
- Prisma support
- pgvector integration

### Self-hosted vs Managed

**Decision**: Managed services (Vercel, Neon)

**Rationale**:
- Faster time to market
- Less operations overhead
- Automatic scaling
- Focus on features

### TypeScript vs JavaScript

**Decision**: TypeScript

**Rationale**:
- Type safety prevents bugs
- Better developer experience
- Industry standard
- Future-proof

## Performance Optimizations

### Frontend
- Server Components for reduced JavaScript
- Image optimization
- Code splitting
- Lazy loading

### Backend
- Database query optimization
- Connection pooling
- Caching strategies
- Efficient data fetching

### Database
- Indexed queries
- Vector index optimization
- Query analysis
- Connection management

## Security Considerations

### Environment Variables
- Stored in Vercel
- Not committed to git
- Different per environment

### API Security
- Input validation
- Type checking
- Error sanitization
- Rate limiting (planned)

### Database Security
- Connection string security
- SQL injection prevention (Prisma)
- Access control
- Backup strategies

## Cost Considerations

### OpenAI Embeddings
- Cost per token
- Caching strategies
- Efficient queries

### Anthropic Claude
- Token usage monitoring
- Prompt optimization
- Response caching (future)

### Infrastructure
- Vercel: Pay for usage
- Neon: Pay for database size
- Overall: Reasonable for scale

## Migration Paths

### Future Considerations

1. **Scale to Microservices**: If needed, can split into services
2. **Add Caching Layer**: Redis for performance
3. **CDN**: For static assets
4. **Load Balancing**: For high traffic
5. **Monitoring**: Enhanced observability

## Alternative Technologies Researched

### Frontend Alternatives
- Remix: Close second choice
- Astro: For content-heavy sites
- SolidJS: Performance-focused

### Database Alternatives
- Supabase: Similar to Neon
- PlanetScale: MySQL-based
- MongoDB: NoSQL option

### AI Alternatives
- GPT-4: Considered, chose Claude for tool calling
- Gemini: Google's model
- Self-hosted: More control, more complexity
