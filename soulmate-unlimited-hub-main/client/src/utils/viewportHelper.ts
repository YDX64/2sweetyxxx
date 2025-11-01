// Dynamic viewport height fix for mobile devices
export const initViewportHeight = () => {
  // Function to update viewport height
  const updateViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Update on load
  updateViewportHeight();

  // Update on resize and orientation change
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', updateViewportHeight);

  // Update when keyboard might appear/disappear
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      setTimeout(updateViewportHeight, 300);
    });
    input.addEventListener('blur', () => {
      setTimeout(updateViewportHeight, 300);
    });
  });

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', updateViewportHeight);
    window.removeEventListener('orientationchange', updateViewportHeight);
  };
};

// Prevent zoom on input focus (iOS)
export const preventInputZoom = () => {
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    meta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
};

// Handle safe area insets
export const handleSafeAreaInsets = () => {
  const root = document.documentElement;
  
  // Check if env() is supported
  if (CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')) {
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
  }
};

// Initialize all mobile fixes
export const initMobileFixes = () => {
  initViewportHeight();
  preventInputZoom();
  handleSafeAreaInsets();
};