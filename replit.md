# Birthday Website Project

## Overview

This is a romantic birthday website application built for creating a personalized birthday celebration experience. The application features an interactive journey with various components including a hero section, photo carousel, timeline of memories, love counter, AI-generated gift box with poems, and celebratory elements like floating animations and fireworks. The project is designed as a full-stack application with a React frontend and Express backend, featuring a romantic design theme with soft colors, elegant typography, and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Styling**: Tailwind CSS with custom romantic color palette and animations
- **UI Components**: shadcn/ui component library providing consistent, accessible components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Animations**: Framer Motion for smooth transitions and interactive animations
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture  
- **Framework**: Express.js with TypeScript running in ESM mode
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud hosting
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **API Integration**: Google Gemini AI for generating personalized poems and romantic content

### Build System
- **Bundler**: Vite for fast development builds and optimized production bundles
- **Development**: Hot module replacement with Vite middleware integration
- **Production**: esbuild for server bundling, Vite for client bundling
- **TypeScript**: Strict mode enabled with path mapping for clean imports

### Design System
- **Color Palette**: Romantic theme with soft rose, warm pink, and lavender accents
- **Typography**: Inter/Poppins for readability, Dancing Script for romantic headings
- **Animations**: Custom CSS animations for heartbeat, glow effects, and confetti
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Library**: Custom components for birthday-specific features (gift box, photo carousel, timeline, etc.)

### Data Storage
- **Primary Database**: PostgreSQL with user management schema
- **ORM**: Drizzle with automatic migrations and type generation
- **Development Storage**: In-memory storage implementation for rapid development
- **Production Storage**: Database-backed storage with connection pooling

### Authentication & Session Management
- **Session Storage**: PostgreSQL-backed sessions with configurable expiration
- **User Management**: Basic user model with username/password authentication
- **Session Security**: Secure cookie configuration and CSRF protection ready

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, ReactDOM, and React Hook Form for UI management
- **Routing**: Wouter for lightweight client-side navigation
- **Database**: Drizzle ORM with PostgreSQL driver (@neondatabase/serverless)
- **Backend**: Express.js with TypeScript support

### UI & Animation Libraries
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Animations**: Framer Motion for interactive animations and transitions
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with custom configuration for romantic theme

### AI & External Services
- **AI Integration**: Google Gemini AI (@google/genai) for generating personalized content
- **Lottie Animations**: @lottiefiles/react-lottie-player for advanced animations

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Development**: Replit-specific plugins for enhanced development experience
- **Type Safety**: Zod for runtime validation and TypeScript for compile-time safety

### Database & Session Management
- **Database Provider**: Neon PostgreSQL serverless database
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Query Management**: TanStack Query for client-side data fetching and caching

The architecture prioritizes developer experience with hot reloading, type safety throughout the stack, and a component-driven approach that makes it easy to customize and extend the birthday celebration features.