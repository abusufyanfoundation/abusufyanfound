"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const SHOW_AFTER_MS = 150; // instant actions never flash the loader
const LINGER_MS = 400; // covers the gap before a redirect (e.g. to Paystack)

// Only requests to our own site, and only ones that mean "the user did something"
function isUserAction(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const request = input instanceof Request ? input : null;
    const raw = request
      ? request.url
      : input instanceof URL
        ? input.href
        : String(input);
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return false;

    const headers = new Headers(init?.headers ?? request?.headers);
    if (headers.get("Next-Router-Prefetch")) return false;

    const method = (init?.method ?? request?.method ?? "GET").toUpperCase();
    if (method !== "GET") return true; // form submits and server actions
    return headers.get("RSC") === "1"; // page navigations
  } catch {
    return false;
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

  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );

  useEffect(() => {
    const original = window.fetch;
    let count = 0;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let lingerTimer: ReturnType<typeof setTimeout> | undefined;

    const start = () => {
      count += 1;
      clearTimeout(lingerTimer);
      if (count === 1) {
        showTimer = setTimeout(() => setActive(true), SHOW_AFTER_MS);
      }
    };

    const end = () => {
      count = Math.max(0, count - 1);
      if (count === 0) {
        lingerTimer = setTimeout(() => {
          clearTimeout(showTimer);
          setActive(false);
        }, LINGER_MS);
      }
    };

    window.fetch = (input, init) => {
      if (!isUserAction(input, init)) {
        return original.call(window, input, init);
      }
      start();
      return original.call(window, input, init).finally(end);
    };

    return () => {
      window.fetch = original;
      clearTimeout(showTimer);
      clearTimeout(lingerTimer);
    };
  }, []);

  const outer = reduced ? "1.5s" : "1.1s";
  const inner = reduced ? "2.5s" : "1.6s";
  const pulse = reduced ? "1.5s" : "1.4s";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!active}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/45 backdrop-blur-md transition-opacity duration-300 ${
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
