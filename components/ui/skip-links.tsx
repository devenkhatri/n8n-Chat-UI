"use client";

import React from 'react';
import { Button } from './button';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#chat-input', label: 'Skip to chat input' },
  { href: '#navigation', label: 'Skip to navigation' },
];

/**
 * Skip links component for keyboard navigation accessibility
 */
export function SkipLinks({ links = defaultLinks }: SkipLinksProps) {
  return (
    <div className="skip-links">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          onFocus={(e) => {
            // Ensure the skip link is visible when focused
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onBlur={(e) => {
            // Hide the skip link when not focused
            e.currentTarget.style.transform = 'translateY(-100%)';
          }}
        >
          {link.label}
        </a>
      ))}
      
      <style jsx>{`
        .skip-links {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }
        
        .skip-link {
          position: absolute;
          top: 0;
          left: 0;
          background: var(--background);
          color: var(--foreground);
          padding: 0.5rem 1rem;
          text-decoration: none;
          border: 2px solid var(--primary);
          border-radius: 0 0 0.25rem 0;
          font-weight: 600;
          transform: translateY(-100%);
          transition: transform 0.2s ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .skip-link:focus {
          transform: translateY(0) !important;
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        
        .skip-link:hover {
          background: var(--primary);
          color: var(--primary-foreground);
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to create skip link targets
 */
export function useSkipLinkTarget(id: string) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set the ID for skip link targeting
    element.id = id;

    // Make the element focusable if it's not already
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }

    // Handle focus from skip links
    const handleFocus = () => {
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('class', 'sr-only');
      announcement.textContent = `Skipped to ${element.getAttribute('aria-label') || id}`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    };

    element.addEventListener('focus', handleFocus);

    return () => {
      element.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  return ref;
}