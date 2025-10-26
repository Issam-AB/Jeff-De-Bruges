// NUCLEAR OPTION: Force instant tap on mobile - overrides everything
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Detect if touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (!isTouchDevice) return;
  
  console.log('🔧 Forcing instant tap for mobile...');
  
  // Disable ALL hover effects immediately
  const style = document.createElement('style');
  style.textContent = `
    @media (hover: none) {
      * { pointer-events: auto !important; }
      *:hover { all: unset !important; }
      .group:hover * { all: unset !important; }
    }
  `;
  document.head.appendChild(style);
  
  // Remove 300ms delay - FastClick alternative
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });
  
  document.addEventListener('touchend', function(e) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Check if it's a tap (not a swipe)
    const moveX = Math.abs(touchEndX - touchStartX);
    const moveY = Math.abs(touchEndY - touchStartY);
    
    if (touchDuration < 200 && moveX < 10 && moveY < 10) {
      const target = document.elementFromPoint(touchEndX, touchEndY);
      const link = target?.closest('a, button, [role="button"]');
      
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        
        // Force instant click
        if (link.tagName === 'A' && link.href) {
          window.location.href = link.href;
        } else if (link.tagName === 'BUTTON' || link.getAttribute('role') === 'button') {
          link.click();
        }
      }
    }
  }, { passive: false });
  
  // Disable all Framer Motion hover/tap interactions on mount
  const observer = new MutationObserver(function(mutations) {
    document.querySelectorAll('[data-framer-component], [style*="pointer-events"]').forEach(el => {
      el.style.pointerEvents = 'auto';
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  console.log('✅ Mobile instant tap enabled');
})();
