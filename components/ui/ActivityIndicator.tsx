"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const SHOW_AFTER_MS = 0;
const LINGER_MS = 800; // covers the gap before a redirect (e.g. to Paystack)
const NAVIGATION_WAIT_MS = 1500; // the longest a page change is waited for
const PAINT_MS = 150; // lets the new page paint before the loader goes

// Only requests to our own site, and only ones that mean "the user did something"
type Kind = "navigation" | "action" | null;

// Only requests to our own site, and only ones that mean "the user did something"
function classify(input: RequestInfo | URL, init?: RequestInit): Kind {
  try {
    const request = input instanceof Request ? input : null;
    const raw = request
      ? request.url
      : input instanceof URL
        ? input.href
        : String(input);
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return null;

    const headers = new Headers(init?.headers ?? request?.headers);
    if (headers.get("Next-Router-Prefetch")) return null;

    const method = (init?.method ?? request?.method ?? "GET").toUpperCase();
    if (method !== "GET") return "action"; // form submits and server actions
    return headers.get("RSC") === "1" ? "navigation" : null; // page navigations
  } catch {
    return null;
  }
}

// People with reduced motion still get a spinner, just a slower one
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function ActivityIndicator() {
  const [active, setActive] = useState(false);
  const pathname = usePathname();
  const count = useRef(0);
  const navigating = useRef(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );

  useEffect(() => {
    const original = window.fetch;

    const hideAfter = (ms: number) => {
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        hideTimer.current = undefined;
        clearTimeout(showTimer.current);
        setActive(false);
      }, ms);
    };

    const start = (kind: "navigation" | "action") => {
      count.current += 1;
      if (kind === "navigation") navigating.current = true;
      clearTimeout(hideTimer.current);
      hideTimer.current = undefined;
      if (count.current === 1) {
        showTimer.current = setTimeout(() => setActive(true), SHOW_AFTER_MS);
      }
    };

    const end = () => {
      count.current = Math.max(0, count.current - 1);
      if (count.current === 0) {
        // A page change waits for the new page to arrive (see below)
        hideAfter(navigating.current ? NAVIGATION_WAIT_MS : LINGER_MS);
        navigating.current = false;
      }
    };

    window.fetch = (input, init) => {
      const kind = classify(input, init);
      if (!kind) return original.call(window, input, init);
      start(kind);
      return original.call(window, input, init).then(
        (response) => {
          // A server action that redirects is a page change too
          if (response.headers.has("x-action-redirect")) {
            navigating.current = true;
          }
          end();
          return response;
        },
        (error) => {
          end();
          throw error;
        },
      );
    };

    return () => {
      window.fetch = original;
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  // The new page has arrived: let it paint, then hide the loader
  useEffect(() => {
    if (count.current === 0 && hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        hideTimer.current = undefined;
        clearTimeout(showTimer.current);
        setActive(false);
      }, PAINT_MS);
    }
  }, [pathname]);

  const outer = reduced ? "1.5s" : "1.1s";
  const inner = reduced ? "2.5s" : "1.6s";
  const pulse = reduced ? "1.5s" : "1.4s";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!active}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-300 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="sr-only">{active ? "Loading, please wait" : ""}</span>

      {/* The turning is drawn inside the SVG itself, so no CSS or browser
          motion setting can switch it off */}
      <svg
        viewBox="0 0 100 100"
        className="h-20 w-20"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer ring: navy arc over a faint track, turning clockwise */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="3"
          className="text-navy"
        />
        <g className="text-navy">
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="78 199"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur={outer}
            repeatCount="indefinite"
          />
        </g>

        {/* Inner ring: gold arc turning the other way */}
        <g className="text-gold">
          <circle
            cx="50"
            cy="50"
            r="30"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="48 141"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur={inner}
            repeatCount="indefinite"
          />
        </g>

        {/* Soft pulsing centre */}
        <circle cx="50" cy="50" r="5" fill="currentColor" className="text-gold">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur={pulse}
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
