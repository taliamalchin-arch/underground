# replit.md

## Overview

This is a full-stack web application built with React frontend and Express backend. The project appears to be a mockup or prototype application featuring interactive games (ski game, word scramble, reflex tap) and a news/content display interface. It uses a modern TypeScript stack with Vite for frontend bundling and Drizzle ORM for database management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with HMR support

The frontend lives in `client/src/` with the following structure:
- `pages/` - Route components (Mockup, not-found)
- `components/ui/` - Reusable shadcn UI components
- `components/games/` - Interactive game components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and query client setup

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Server**: HTTP server with development/production modes
- **Development**: Vite dev server integration for HMR
- **Production**: Static file serving from built assets

The backend lives in `server/` with:
- `index.ts` - Express app setup and middleware
- `routes.ts` - API route definitions (prefixed with `/api`)
- `storage.ts` - Data storage interface with in-memory implementation
- `vite.ts` - Vite dev server integration

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Current Storage**: In-memory implementation (MemStorage class)
- **Database Ready**: Configured for PostgreSQL via `DATABASE_URL` environment variable

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database table definitions and TypeScript types

### Build and Development
- Development: `npm run dev` - Runs Express with Vite middleware
- Production build: `npm run build` - Vite builds frontend, esbuild bundles server
- Database migrations: `npm run db:push` - Pushes schema to database

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via Drizzle)
- **Neon Database**: Serverless PostgreSQL driver (`@neondatabase/serverless`)
- **Connection**: Requires `DATABASE_URL` environment variable

### UI Framework Dependencies
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Frontend Libraries
- **TanStack React Query**: Data fetching and caching
- **react-hook-form**: Form handling with `@hookform/resolvers`
- **date-fns**: Date manipulation
- **embla-carousel-react**: Carousel component
- **cmdk**: Command palette component
- **vaul**: Drawer component
- **recharts**: Charting library

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling
- **TypeScript**: Type checking
- **Replit plugins**: Error overlay, cartographer, dev banner (development only)