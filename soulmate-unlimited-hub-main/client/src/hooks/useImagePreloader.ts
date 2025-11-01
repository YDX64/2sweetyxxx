import { useState, useEffect, useCallback, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
  timeout?: number;
}

interface PreloadedImage {
  src: string;
  loaded: boolean;
  error: boolean;
  element?: HTMLImageElement;
}

interface UseImagePreloaderReturn {
  preloadedImages: Map<string, PreloadedImage>;
  preloadImage: (src: string, options?: PreloadOptions) => Promise<HTMLImageElement>;
  preloadImages: (srcs: string[], options?: PreloadOptions) => Promise<HTMLImageElement[]>;
  isImageLoaded: (src: string) => boolean;
  getPreloadedImage: (src: string) => HTMLImageElement | null;
  clearCache: () => void;
  cacheSize: number;
}

const MAX_CACHE_SIZE = 50;
const DEFAULT_TIMEOUT = 10000; // 10 seconds

export const useImagePreloader = (): UseImagePreloaderReturn => {
  const [preloadedImages, setPreloadedImages] = useState<Map<string, PreloadedImage>>(new Map());
  const loadingPromises = useRef<Map<string, Promise<HTMLImageElement>>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Cleanup function to remove old entries when cache gets too large
  const cleanupCache = useCallback((newCache: Map<string, PreloadedImage>) => {
    if (newCache.size <= MAX_CACHE_SIZE) return newCache;

    // Convert to array, sort by some criteria (could be last used time), and keep most recent
    const entries = Array.from(newCache.entries());
    const sortedEntries = entries.slice(-MAX_CACHE_SIZE); // Keep last N entries

    return new Map(sortedEntries);
  }, []);

  // Preload a single image
  const preloadImage = useCallback(async (
    src: string,
    options: PreloadOptions = {}
  ): Promise<HTMLImageElement> => {
    const { priority = 'low', crossOrigin, timeout = DEFAULT_TIMEOUT } = options;

    // Check if already loaded
    const existing = preloadedImages.get(src);
    if (existing?.loaded && existing.element) {
      return existing.element;
    }

    // Check if already loading
    const existingPromise = loadingPromises.current.get(src);
    if (existingPromise) {
      return existingPromise;
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllers.current.set(src, abortController);

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      // Set up timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error(`Image load timeout: ${src}`));
      }, timeout);

      // Handle abort
      abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error(`Image load aborted: ${src}`));
      });

      img.onload = () => {
        clearTimeout(timeoutId);

        setPreloadedImages(prev => {
          const newCache = new Map(prev);
          newCache.set(src, {
            src,
            loaded: true,
            error: false,
            element: img
          });
          return cleanupCache(newCache);
        });

        loadingPromises.current.delete(src);
        abortControllers.current.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);

        setPreloadedImages(prev => {
          const newCache = new Map(prev);
          newCache.set(src, {
            src,
            loaded: false,
            error: true
          });
          return cleanupCache(newCache);
        });

        loadingPromises.current.delete(src);
        abortControllers.current.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Set image properties
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }

      // Set loading priority for modern browsers
      if ('loading' in img) {
        img.loading = priority === 'high' ? 'eager' : 'lazy';
      }

      // Set fetchPriority for modern browsers
      if ('fetchPriority' in img) {
        (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority;
      }

      // Mark as loading
      setPreloadedImages(prev => {
        const newCache = new Map(prev);
        newCache.set(src, {
          src,
          loaded: false,
          error: false
        });
        return newCache;
      });

      // Start loading
      img.src = src;
    });

    loadingPromises.current.set(src, loadPromise);
    return loadPromise;
  }, [preloadedImages, cleanupCache]);

  // Preload multiple images
  const preloadImages = useCallback(async (
    srcs: string[],
    options: PreloadOptions = {}
  ): Promise<HTMLImageElement[]> => {
    const promises = srcs.map(src => preloadImage(src, options));
    return Promise.allSettled(promises).then(results =>
      results
        .filter((result): result is PromiseFulfilledResult<HTMLImageElement> =>
          result.status === 'fulfilled'
        )
        .map(result => result.value)
    );
  }, [preloadImage]);

  // Check if image is loaded
  const isImageLoaded = useCallback((src: string): boolean => {
    const preloaded = preloadedImages.get(src);
    return preloaded?.loaded === true;
  }, [preloadedImages]);

  // Get preloaded image element
  const getPreloadedImage = useCallback((src: string): HTMLImageElement | null => {
    const preloaded = preloadedImages.get(src);
    return preloaded?.element || null;
  }, [preloadedImages]);

  // Clear cache
  const clearCache = useCallback(() => {
    // Abort all pending requests
    abortControllers.current.forEach(controller => controller.abort());
    abortControllers.current.clear();
    loadingPromises.current.clear();
    setPreloadedImages(new Map());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort all pending requests on unmount
      abortControllers.current.forEach(controller => controller.abort());
    };
  }, []);

  return {
    preloadedImages,
    preloadImage,
    preloadImages,
    isImageLoaded,
    getPreloadedImage,
    clearCache,
    cacheSize: preloadedImages.size
  };
};

// Hook for preloading next cards' images
export const useSwipeImagePreloader = (
  users: Array<{ id: string; photos?: string[] }>,
  currentIndex: number,
  preloadCount: number = 3
) => {
  const { preloadImages, isImageLoaded } = useImagePreloader();

  useEffect(() => {
    // Preload images for next few cards
    const nextUsers = users.slice(currentIndex, currentIndex + preloadCount);
    const imagesToPreload = nextUsers
      .flatMap(user => user.photos || [])
      .filter(photo => photo && !isImageLoaded(photo));

    if (imagesToPreload.length > 0) {
      preloadImages(imagesToPreload, { priority: 'low' }).catch(error => {
        console.warn('Failed to preload some images:', error);
      });
    }
  }, [users, currentIndex, preloadCount, preloadImages, isImageLoaded]);

  return { isImageLoaded };
};
