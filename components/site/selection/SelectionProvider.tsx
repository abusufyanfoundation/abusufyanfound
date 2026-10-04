"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type SelectedItem = {
  bookId: string;
  title: string;
  priceKobo: number;
  quantity: number;
  max: number;
};

type Items = Record<string, SelectedItem>;

type SelectionContextValue = {
  items: Items;
  count: number;
  totalKobo: number;
  setItem: (item: SelectedItem) => void;
  removeItem: (bookId: string) => void;
  clear: () => void;
};

/* ───────── Tiny external store backed by sessionStorage ───────── */

const STORAGE_KEY = "asaf-book-selection";
const EMPTY: Items = {};

let cachedRaw: string | null = null;
let cachedItems: Items = EMPTY;
let memoryOnly = false; // true if sessionStorage is unavailable
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Must return the same object until the data actually changes
function getSnapshot(): Items {
  if (memoryOnly) return cachedItems;

  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    memoryOnly = true;
    return cachedItems;
  }

  if (raw === cachedRaw) return cachedItems;

  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    cachedItems = parsed && typeof parsed === "object" ? parsed : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function getServerSnapshot(): Items {
  return EMPTY;
}

function write(next: Items) {
  cachedItems = next;
  cachedRaw = JSON.stringify(next);
  try {
    sessionStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    memoryOnly = true; // keep working in memory for this session
  }
  listeners.forEach((l) => l());
}

function setItem(item: SelectedItem) {
  write({ ...getSnapshot(), [item.bookId]: item });
}

function removeItem(bookId: string) {
  const next = { ...getSnapshot() };
  delete next[bookId];
  write(next);
}

function clear() {
  write(EMPTY);
}

/* ───────── Provider and hook ───────── */

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<SelectionContextValue>(() => {
    const list = Object.values(items);
    return {
      items,
      count: list.reduce((n, i) => n + i.quantity, 0),
      totalKobo: list.reduce((n, i) => n + i.priceKobo * i.quantity, 0),
      setItem,
      removeItem,
      clear,
    };
  }, [items]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx)
    throw new Error("useSelection must be used inside SelectionProvider");
  return ctx;
}
