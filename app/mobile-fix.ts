// Mobile Touch Fix - Removes double-tap delay
if (typeof window !== 'undefined') {
  // Disable 300ms tap delay on mobile
  document.addEventListener('DOMContentLoaded', () => {
    // Add touch-action to all clickable elements
    const clickableElements = document.querySelectorAll('a, button, [role="button"], [onclick]');
    clickableElements.forEach((el) => {
      (el as HTMLElement).style.touchAction = 'manipulation';
    });

    // Force immediate click on tap for all links
    document.addEventListener('touchstart', function(e) {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && !link.hasAttribute('data-no-instant')) {
        // Don't prevent default, just ensure it's ready
        link.style.pointerEvents = 'auto';
      }
    }, { passive: true });
  });
}

export {};
