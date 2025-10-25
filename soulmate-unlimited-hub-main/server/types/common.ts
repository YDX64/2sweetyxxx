// Common type definitions for server-side code

// Error types
export interface AppError extends Error {
  code?: string;
  details?: unknown;
  hint?: string;
}

// Helper type for unknown errors
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  if (typeof error === 'object' && error !== null && 'stack' in error) {
    return String(error.stack);
  }
  return undefined;
}