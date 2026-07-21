export type Category =
  | "roads"
  | "garbage"
  | "lighting"
  | "ecology"
  | "transport"
  | "landscaping"
  | "safety"
  | "other";

export type Severity = "low" | "medium" | "high";

export type Status = "new" | "in_progress" | "resolved" | "rejected";

export interface StatusEvent {
  status: Status;
  at: string; // ISO
  note?: string;
}

export interface Incident {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  lat: number;
  lng: number;
  district: string;
  photos: string[]; // data URIs for user uploads; empty => placeholder
  status: Status;
  statusHistory: StatusEvent[];
  createdAt: string; // ISO
  confirmations: number;
  resolvedVotes: number;
  reporter: string;
  aiConfidence?: number;
}

export type Role = "resident" | "akimat";

export interface User {
  id: string;
  name: string;
  role: Role;
}
