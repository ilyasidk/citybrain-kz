"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Category, Incident, Role, Status, User } from "./types";
import { SEED_INCIDENTS } from "./seed";
import { haversineMeters } from "./geo";

const LS_INCIDENTS = "citybrain.incidents.v1";
const LS_USER = "citybrain.user.v1";
const LS_META = "citybrain.meta.v1";

interface NewIncidentInput {
  category: Category;
  severity: Incident["severity"];
  title: string;
  description: string;
  lat: number;
  lng: number;
  district: string;
  photos: string[];
  aiConfidence?: number;
}

interface StoreValue {
  hydrated: boolean;
  incidents: Incident[];
  user: User;
  confirmationsGiven: number;
  setRole: (role: Role) => void;
  setName: (name: string) => void;
  addIncident: (input: NewIncidentInput) => Incident;
  confirmIncident: (id: string) => void;
  voteResolved: (id: string) => void;
  setStatus: (id: string, status: Status, note?: string) => void;
  findDuplicates: (category: Category, lat: number, lng: number) => Incident[];
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const DEFAULT_USER: User = { id: "guest", name: "Гость", role: "resident" };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>(SEED_INCIDENTS);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [confirmationsGiven, setConfirmationsGiven] = useState(0);

  useEffect(() => {
    try {
      const rawI = localStorage.getItem(LS_INCIDENTS);
      if (rawI) setIncidents(JSON.parse(rawI));
      const rawU = localStorage.getItem(LS_USER);
      if (rawU) setUser(JSON.parse(rawU));
      const rawM = localStorage.getItem(LS_META);
      if (rawM) setConfirmationsGiven(JSON.parse(rawM).confirmationsGiven ?? 0);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_INCIDENTS, JSON.stringify(incidents));
    } catch {}
  }, [incidents, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } catch {}
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_META, JSON.stringify({ confirmationsGiven }));
    } catch {}
  }, [confirmationsGiven, hydrated]);

  const setRole = useCallback((role: Role) => setUser((u) => ({ ...u, role })), []);
  const setName = useCallback(
    (name: string) => setUser((u) => ({ ...u, name: name.trim() || "Гость" })),
    [],
  );

  const findDuplicates = useCallback(
    (category: Category, lat: number, lng: number) => {
      const now = Date.now();
      const THIRTY_DAYS = 30 * 86400000;
      return incidents
        .filter((i) => i.category === category && i.status !== "resolved" && i.status !== "rejected")
        .filter((i) => now - new Date(i.createdAt).getTime() <= THIRTY_DAYS)
        .map((i) => ({ i, d: haversineMeters({ lat, lng }, { lat: i.lat, lng: i.lng }) }))
        .filter((x) => x.d <= 100)
        .sort((a, b) => a.d - b.d)
        .map((x) => x.i);
    },
    [incidents],
  );

  const addIncident = useCallback(
    (input: NewIncidentInput): Incident => {
      const nowISO = new Date().toISOString();
      const incident: Incident = {
        id: `usr-${Date.now().toString(36)}`,
        ...input,
        status: "new",
        statusHistory: [{ status: "new", at: nowISO }],
        createdAt: nowISO,
        confirmations: 0,
        resolvedVotes: 0,
        reporter: user.name,
      };
      setIncidents((prev) => [incident, ...prev]);
      return incident;
    },
    [user.name],
  );

  const confirmIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, confirmations: i.confirmations + 1 } : i)),
    );
    setConfirmationsGiven((n) => n + 1);
  }, []);

  const voteResolved = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resolvedVotes: i.resolvedVotes + 1 } : i)),
    );
  }, []);

  const setStatus = useCallback((id: string, status: Status, note?: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              statusHistory: [
                ...i.statusHistory,
                { status, at: new Date().toISOString(), note },
              ],
            }
          : i,
      ),
    );
  }, []);

  const reset = useCallback(() => {
    setIncidents(SEED_INCIDENTS);
    setConfirmationsGiven(0);
    try {
      localStorage.removeItem(LS_INCIDENTS);
      localStorage.removeItem(LS_META);
    } catch {}
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      incidents,
      user,
      confirmationsGiven,
      setRole,
      setName,
      addIncident,
      confirmIncident,
      voteResolved,
      setStatus,
      findDuplicates,
      reset,
    }),
    [
      hydrated,
      incidents,
      user,
      confirmationsGiven,
      setRole,
      setName,
      addIncident,
      confirmIncident,
      voteResolved,
      setStatus,
      findDuplicates,
      reset,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
