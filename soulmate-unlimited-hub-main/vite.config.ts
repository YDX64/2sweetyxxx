import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to exclude test files from production builds
function excludeTestFiles(): Plugin {
  return {
    name: 'exclude-test-files',
    resolveId(source) {
      if (process.env.NODE_ENV === 'production') {
        // Block test file imports in production
        if (source.includes('Test') || 
            source.includes('test') || 
            source.includes('Debug') ||
            source.includes('ExecuteSQL') ||
            source.includes('FixDatabase')) {
          console.warn(`Blocking test file in production: ${source}`);
          return { id: 'virtual:empty', external: true };
        }
      }
      return null;
    },
    load(id) {
      if (id === 'virtual:empty') {
        return 'export default {}';
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    excludeTestFiles(),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Tree-shake test files in production
      treeshake: {
        moduleSideEffects: (id) => {
          // Remove test files from the bundle
          if (id.includes('Test') || 
              id.includes('test') || 
              id.includes('Debug') ||
              id.includes('ExecuteSQL') ||
              id.includes('FixDatabase')) {
            return false;
          }
          return true;
        }
      },
      output: {
        manualChunks: (id) => {
          // Don't create chunks for test files in production
          if (process.env.NODE_ENV === 'production' &&
              id.includes('/pages/') && 
              (id.includes('Test') || 
               id.includes('Debug') || 
               id.includes('ExecuteSQL') ||
               id.includes('FixDatabase'))) {
            return false; // Exclude from build entirely
          }
          // Default chunking for other files
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      }
    }
  },
});
