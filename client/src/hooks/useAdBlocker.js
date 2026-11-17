import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to continuously detect client-side ad blockers.
 * Street vendor discovery platforms rely on OpenStreetMap tiles, Leaflet markers,
 * geolocation coordinates, and direct WhatsApp links, which aggressive ad blocker
 * filter lists (EasyList, Fanboy, etc.) occasionally block as "third-party trackers".
 */
export function useAdBlocker() {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('hezal_adblock_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const checkCountRef = useRef(0);

  const checkAdBlocker = useCallback(async () => {
    // Check 1: DOM Bait Element with common ad network class names
    let baitDetected = false;
    try {
      const bait = document.createElement('div');
      bait.className = 'adsbox pub_300x250 ad-placement ad-banner textads banner-ad ad-slot ads-area';
      bait.setAttribute('aria-hidden', 'true');
      bait.style.cssText =
        'position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; pointer-events: none !important;';
      document.body.appendChild(bait);

      // Allow DOM style calculation
      await new Promise((r) => setTimeout(r, 60));

      const style = window.getComputedStyle(bait);
      if (
        bait.offsetHeight === 0 ||
        bait.clientHeight === 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
      ) {
        baitDetected = true;
      }

      if (bait.parentNode) {
        bait.parentNode.removeChild(bait);
      }
    } catch {
      // Ignore DOM errors
    }

    if (baitDetected) {
      setIsAdBlockerActive(true);
      return true;
    }

    // Check 2: Benign network canary check against standard ad script path
    // Only perform when navigator is online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const canaryUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        await fetch(canaryUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        });

        clearTimeout(timeout);
        // If fetch succeeded without error, no network-level ad block
      } catch (err) {
        // Network errors on canary URL indicate network-level filter (uBlock Origin / Pi-hole / Brave Shields)
        if (err.name !== 'AbortError') {
          setIsAdBlockerActive(true);
          return true;
        }
      }
    }

    checkCountRef.current += 1;
    return false;
  }, []);

  useEffect(() => {
    // Initial check on mount
    checkAdBlocker();

    // Continuous check on window focus (e.g. user toggles extension in toolbar)
    const handleFocus = () => {
      checkAdBlocker();
    };

    window.addEventListener('focus', handleFocus);

    // Continuous interval check every 15 seconds
    const intervalId = setInterval(() => {
      checkAdBlocker();
    }, 15000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [checkAdBlocker]);

  const dismissAdBlocker = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem('hezal_adblock_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const resetDismiss = useCallback(() => {
    setDismissed(false);
    try {
      localStorage.removeItem('hezal_adblock_dismissed');
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    isAdBlockerActive,
    dismissed,
    dismissAdBlocker,
    resetDismiss,
    checkNow: checkAdBlocker,
  };
}

export default useAdBlocker;
