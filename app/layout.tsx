import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import './mobile-fix'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Jeff de Bruges - Chocolats",
  description: "Découvrez notre sélection de chocolats fins, pralinés, truffes et tablettes de qualité supérieure. Des boîtes cadeaux élégantes pour toutes les occasions.",
  keywords: "chocolats, pralinés, truffes, tablettes chocolat, boîtes cadeaux chocolat, chocolats de noël, chocolats de pâques, jeff de bruges",
  authors: [{ name: 'Jeff de Bruges' }],
  openGraph: {
    title: 'Jeff de Bruges - Chocolats',
    description: 'Découvrez notre sélection de chocolats fins, pralinés, truffes et tablettes de qualité supérieure. Des boîtes cadeaux élégantes pour toutes les occasions.',
    url: 'https://venteflash.sketch-design.ma',
    siteName: 'Jeff de Bruges',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://venteflash.sketch-design.ma/bf-logo.webp',
        width: 800,
        height: 600,
        alt: 'Jeff de Bruges Logo',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'add-your-google-site-verification-here',
  },
  alternates: {
    canonical: 'https://venteflash.sketch-design.ma',
  },
  icons: {
    icon: [
      {
        url: "/bf-logo.webp",
        href: "/bf-logo.webp",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            'use strict';
            console.log('🚀 Mobile tap fix loading...');
            
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (!isTouchDevice) {
              console.log('❌ Not a touch device, skipping');
              return;
            }
            
            console.log('✅ Touch device detected, applying fixes');
            
            // Add CSS to disable ONLY hover interactions on touch devices (not all styles)
            const style = document.createElement('style');
            style.textContent = \`
              @media (hover: none) and (pointer: coarse) {
                /* Don't trigger hover states on touch */
                *:hover {
                  /* Keep existing styles, just prevent hover-specific changes */
                }
              }
            \`;
            document.head.appendChild(style);
            
            // Track touch for instant navigation
            let touchStartX = 0, touchStartY = 0, touchStartTime = 0, touchMoved = false;
            
            document.addEventListener('touchstart', function(e) {
              touchStartX = e.touches[0].clientX;
              touchStartY = e.touches[0].clientY;
              touchStartTime = Date.now();
              touchMoved = false;
            }, { passive: true });
            
            document.addEventListener('touchmove', function(e) {
              const moveX = Math.abs(e.touches[0].clientX - touchStartX);
              const moveY = Math.abs(e.touches[0].clientY - touchStartY);
              if (moveX > 10 || moveY > 10) {
                touchMoved = true;
              }
            }, { passive: true });
            
            document.addEventListener('touchend', function(e) {
              const touchDuration = Date.now() - touchStartTime;
              
              // Only if it's a quick tap (not a swipe or long press)
              if (!touchMoved && touchDuration < 500) {
                const touchX = e.changedTouches[0].clientX;
                const touchY = e.changedTouches[0].clientY;
                const target = document.elementFromPoint(touchX, touchY);
                
                if (target) {
                  const clickable = target.closest('a, button, [role="button"], [onclick]');
                  
                  if (clickable) {
                    console.log('📱 Instant tap on:', clickable.tagName, clickable.textContent?.substring(0, 30));
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    // Force immediate navigation
                    if (clickable.tagName === 'A') {
                      const href = clickable.getAttribute('href');
                      if (href && !href.startsWith('#')) {
                        console.log('🔗 Navigating to:', href);
                        window.location.href = href;
                        return;
                      }
                    }
                    
                    // Click buttons
                    setTimeout(() => clickable.click(), 0);
                  }
                }
              }
            }, { capture: true, passive: false });
            
            console.log('✅ Mobile instant tap ACTIVE');
          })();
        ` }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-900`}>
        {/* Animated background layers */}
        <div className="fixed inset-0 bg-gray-900" />
        <div className="fixed inset-0">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(249, 115, 22) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(249, 115, 22) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Glowing orbs */}
          <div className="absolute top-0 left-1/4 w-24 h-24 bg-orange-500 rounded-full blur-[80px] animate-pulse opacity-20" />
          <div className="absolute top-0 right-1/4 w-24 h-24 bg-red-500 rounded-full blur-[80px] animate-pulse delay-700 opacity-20" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}