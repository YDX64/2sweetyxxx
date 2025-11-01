import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./adminRoutes";
import { sql } from "drizzle-orm";
import { getErrorMessage, getErrorStack } from "./types/common";

const app = express();

// IMPORTANT: Trust proxy for Coolify/Traefik reverse proxy
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.CLIENT_URL || 'https://2sweety.com',
        'https://2sweety.com',
        'https://www.2sweety.com',
        'http://localhost:5000' // Allow health checks from within container
      ]
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Register admin routes
app.use(adminRoutes);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Log ALL incoming requests for debugging
  log(`Incoming: ${req.method} ${path} from ${req.ip || req.connection.remoteAddress}`, "info");
  
  const originalResJson = res.json;
  res.json = function (bodyObj, ...args) {
    capturedJsonResponse = bodyObj;
    return originalResJson.apply(res, [bodyObj, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLevel: "info" | "warn" | "error" = "info";
    if (res.statusCode >= 400) logLevel = "warn";
    if (res.statusCode >= 500) logLevel = "error";

    const message = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    log(message, logLevel);

    if (capturedJsonResponse && logLevel !== "info") {
      log(`Response: ${JSON.stringify(capturedJsonResponse)}`, logLevel);
    }
  });

  res.on("error", (error) => {
    log(`Response error on ${req.method} ${path}: ${error.message}`, "error");
  });

  next();
});

(async () => {
  // Test database connection before starting server
  try {
    log("Testing database connection...", "info");
    log(`DATABASE_URL format: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`, "info");
    const { db } = await import("./db");
    const result = await db.execute(sql`SELECT 1 as health_check`);
    log(`Database connection successful: ${JSON.stringify(result[0])}`, "info");
  } catch (error) {
    log(`Database connection failed: ${getErrorMessage(error)}`, "error");
    log(`Full error:`, "error");
    log(String(getErrorStack(error) || error), "error");
    
    // Try to continue anyway - maybe the issue is specific to this query
    log("Continuing server startup despite database test failure...", "warn");
  }

  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error ${status} on ${req.method} ${req.path}: ${message}`, "error");
    log(`Error stack: ${err.stack}`, "error");
    
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    // Don't throw - just log and continue
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    // Dynamic import to avoid bundling Vite in production
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Yerel geliştirmede veya kendi sunucunuzda port açıp dinlemek isteyebilirsiniz,
  // fakat Vercel Serverless Function ortamında manuel olarak `server.listen`
  // çağırmak gerekmez (hatta yasaktır). Bu nedenle VERCEL ortam değişkeni
  // tanımlıysa bu adımı atlıyoruz.

  // Debug environment variables
  log(`Environment: NODE_ENV=${process.env.NODE_ENV}, PORT=${process.env.PORT}, COOLIFY=${process.env.COOLIFY}`);
  
  if (!process.env.VERCEL) {
    const port = parseInt(process.env.PORT || "5000");
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } else {
    log(`Skipping manual listen - detected Vercel serverless environment`);
  }
})();

// Vercel/Coolify (veya başka framework-less serverless) ortamlarında kullanılmak üzere
// Express uygulamasını dışa aktarıyoruz. Böylece `api/index.ts` gibi bir dosya
// bu app'i içe aktarıp doğrudan export edebilir.

export default app;
