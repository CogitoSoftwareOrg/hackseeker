# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit-based MVP template with PocketBase backend, featuring AI chat capabilities, vector search, and subscription management. The application is containerized and includes Progressive Web App (PWA) capabilities.

## Development Commands

### Running the Application

```bash
# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run all tests (unit + e2e)
npm test

# Run unit tests only
npm run test:unit

# Run unit tests in watch mode
npm run test:unit -- --watch

# Run e2e tests only
npm run test:e2e

# Run specific unit test file
npm run test:unit -- src/path/to/test.spec.ts
```

The project uses Vitest with two test configurations:

- **Client tests**: `.svelte.{test,spec}.{js,ts}` files run in browser via Playwright
- **Server tests**: `.{test,spec}.{js,ts}` files run in Node environment (excluding svelte tests)

### Code Quality

```bash
# Format code
npm run format

# Check formatting and linting
npm run lint

# Type check
npm run check

# Type check in watch mode
npm run check:watch
```

### PocketBase Type Generation

```bash
# Generate TypeScript types from PocketBase schema
npm run build:gen-types
```

Run this after modifying PocketBase collections to sync types to `src/lib/shared/pb/pocketbase-types.ts`.

### Docker

```bash
# Run full stack (app + dependencies)
docker-compose up

# Run PocketBase only
cd pb && docker-compose up

# Run Meilisearch only
cd meili && docker-compose up
```

## Architecture

### Domain-Driven Design Structure

The codebase follows a DDD-inspired modular architecture located in `src/lib/apps/`. Each app module has:

- **`core/`**: Domain logic, interfaces, models (in/out ports)
  - `in.ts`: Input ports (use cases/interfaces)
  - `out.ts`: Output ports (repository interfaces)
  - `models.ts`: Domain models
- **`app/`**: Application logic implementing core interfaces
- **`adapters/`**: External integrations (DB, APIs, AI models)
- **`client/`**: Svelte components and client-side logic
- **`di.ts`**: Dependency injection setup

Current apps:

- **user**: User management
- **chat**: Chat functionality with AI integration
- **brain**: AI brain/reasoning capabilities
- **memory**: Vector search and semantic memory
- **edge**: Edge computing/background processing

### Dependency Injection

The server-side DI container is in `src/lib/shared/server/di.ts`. It initializes all apps with their dependencies:

```typescript
getDI(); // Returns: { user, chat, edge, memory, brain }
```

Apps are wired together based on their dependencies (e.g., `chatApp` depends on `memoryApp` and `brainApp`).

### Backend Integration

**PocketBase** is the primary backend:

- Client instance: `src/lib/shared/pb/pb.ts`
- Authentication uses AsyncAuthStore with localStorage
- Auto-cancellation enabled for browser requests
- Types generated via pocketbase-typegen

**PocketBase Hooks** (`pb/pb_hooks/`):

- Server-side JavaScript hooks for collections
- Files: `chats.pb.js`, `subs.pb.js`, `users.pb.js`, `startup.pb.js`

**Migrations**: `pb/pb_migrations/` contains PocketBase schema migrations

### AI and Observability

**Langfuse Integration**:

- Tracing wrapper in `src/lib/shared/server/tracing.ts`
- `withTracing()`: Wraps request handlers with automatic tracing
- `streamWithFlush()`: Ensures traces flush after streaming responses
- Instrumentation setup in `src/lib/shared/server/instrumentation.ts`

**LLM Providers**:

- OpenAI integration in `src/lib/shared/server/openai.ts`
- Multiple LLM support via `src/lib/shared/server/llms.ts`

**Vector Search**:

- Meilisearch integration via `src/lib/shared/server/voyage.ts`
- Used by the memory app for semantic search

### External Services

Services configured via environment variables (see `.env.example`):

- **Stripe**: Payment processing (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- **Posthog**: Analytics (`PUBLIC_POSTHOG`)
- **Telegram**: Bot integration (`TG_ID`, `TG_BOT_TOKEN`)
- **Langfuse**: LLM observability (`LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY`)
- **Voyage AI**: Embeddings (`VOYAGE_API_KEY`)
- **Meilisearch**: Vector search (`MEILI_URL`, `MEILI_MASTER_KEY`)
- **OpenAI/Grok**: LLM APIs (`OPENAI_API_KEY`, `GROK_API_KEY`)

### Routes Structure

- **`src/routes/(web)/`**: Public marketing pages
- **`src/routes/app/`**: Authenticated application
  - `/app/auth`: Authentication flows
  - `/app/chats`: Chat interface
  - `/app/settings`: User settings
- **`src/routes/api/`**: API endpoints
  - `/api/health`: Health check
  - `/api/stripe`: Stripe webhooks
  - `/api/tg`: Telegram integration
  - `/api/chats`: Chat API

### Shared UI Components

Located in `src/lib/shared/ui/`:

- `AuthWall.svelte`, `Paywall.svelte`, `EmailVerifyWall.svelte`: Access control
- `Modal.svelte`: Modal component with portal support
- `ThemeController.svelte`: Theme switching
- `portal.ts`: Portal utilities for modals/overlays

### Progressive Web App

Configured in `vite.config.ts` with `@vite-pwa/sveltekit`:

- Service worker generated automatically
- App name: "MVP template"
- Start URL: `/app`
- Caching strategies for pages, assets, and images

## Important Notes

### Environment Setup

Copy `.env.example` to `.env` and fill in required values. Critical for local development:

- `PUBLIC_PB_URL`: PocketBase URL (default: `http://localhost:8092/`)
- `MEILI_URL`: Meilisearch URL (default: `http://localhost:7702/`)
- API keys for external services

### Adding New Apps

When adding a new app module:

1. Create folder in `src/lib/apps/[app-name]`
2. Add `core/`, `app/`, `adapters/`, `client/` subdirectories
3. Create `di.ts` for dependency injection
4. Update `src/lib/shared/server/di.ts` to wire the new app
5. Export client components in `src/lib/index.ts` if needed

### SvelteKit Configuration

- Uses `adapter-node` for production builds
- Build output: `build/` directory
- Server runs on port 3000 in production (Docker)

### Styling

- TailwindCSS v4 via `@tailwindcss/vite`
- DaisyUI component library
- Typography plugin enabled
- Forms plugin enabled
