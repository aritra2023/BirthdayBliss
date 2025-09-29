import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Environment validation - fail fast for critical misconfigurations
const validateEnvironment = () => {
  const errors: string[] = [];
  
  // Always required
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
  
  // Validate PORT
  const port = process.env.PORT;
  if (port && (isNaN(parseInt(port)) || parseInt(port) < 1 || parseInt(port) > 65535)) {
    errors.push(`Invalid PORT value: ${port}`);
  }
  
  // Conditional validation based on enabled features
  const isProduction = process.env.NODE_ENV === 'production';
  const pollingEnabled = isProduction || process.env.ENABLE_TELEGRAM_POLLING === 'true';
  
  // Telegram validation - required if polling is enabled
  if (pollingEnabled) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken || botToken.length < 10) {
      errors.push('TELEGRAM_BOT_TOKEN is required when polling is enabled but is missing or invalid');
    }
  }
  
  // Database validation - required if MONGODB_URI is provided
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      errors.push('MONGODB_URI is provided but has invalid format (must start with mongodb:// or mongodb+srv://)');
    }
  } else if (isProduction) {
    console.warn('⚠️  MONGODB_URI not provided in production - will use memory storage (data will not persist)');
  }
  
  // Fail fast if there are validation errors
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n💡 Please fix these environment variables and restart the application');
    process.exit(1);
  }
  
  // Log configuration
  console.log('✅ Environment validation passed');
  console.log(`📍 Mode: ${process.env.NODE_ENV}`);
  console.log(`🤖 Telegram polling: ${pollingEnabled ? 'enabled' : 'disabled'}`);
  console.log(`🗄️  Database: ${mongoUri ? 'MongoDB' : 'Memory (fallback)'}`);
};

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit immediately, let application handle it gracefully
  setTimeout(() => {
    console.error('🔄 Attempting graceful shutdown after uncaught exception');
    process.exit(1);
  }, 5000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  
  // In production, exit to let the platform restart the service
  if (process.env.NODE_ENV === 'production') {
    console.error('🔄 Exiting process due to unhandled rejection in production');
    setTimeout(() => process.exit(1), 1000);
  }
});

// Validate environment on startup
validateEnvironment();

const app = express();

// Security middleware
app.use((req, res, next) => {
  res.header('X-Powered-By', 'Birthday Website');
  next();
});

// Body parsing with error handling
app.use(express.json({ 
  limit: '10mb'
}));

app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb'
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log('🚀 Starting server initialization...');
    
    const server = await registerRoutes(app);
    log('✅ Routes registered successfully');

    // Enhanced error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      // Log error details
      console.error('❌ Server Error:', {
        status,
        message,
        stack: err.stack,
        url: _req.url,
        method: _req.method
      });

      // Don't expose stack traces in production
      const responsePayload = process.env.NODE_ENV === 'production' 
        ? { error: message, status }
        : { error: message, status, stack: err.stack };

      res.status(status).json(responsePayload);
    });

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV
      });
    });


    // Setup development or production environment
    try {
      if (process.env.NODE_ENV === "development") {
        log('🔧 Setting up development environment with Vite');
        await setupVite(app, server);
      } else {
        log('📦 Setting up production static file serving');
        serveStatic(app);
      }
    } catch (envError) {
      console.error('❌ Error setting up environment:', envError);
      throw envError;
    }

    // 404 handler for unknown routes
    app.use('*', (_req, res) => {
      res.status(404).json({ 
        error: 'Route not found',
        path: _req.originalUrl
      });
    });

    // Port configuration with validation
    const port = parseInt(process.env.PORT || '5000', 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port number: ${process.env.PORT}`);
    }

    // Start server with error handling
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✅ Server successfully started on port ${port}`);
      log(`🌐 Environment: ${process.env.NODE_ENV}`);
      log(`🔗 Health check: http://localhost:${port}/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      log(`🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        log('✅ Server closed successfully');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
})();
