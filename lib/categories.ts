import type { Category, Severity, Status } from "./types";

export interface CategoryMeta {
  key: Category;
  label: string;
  labelKz: string;
  color: string;
  emoji: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  roads: { key: "roads", label: "Дороги", labelKz: "Жолдар", color: "#f97316", emoji: "🛣️" },
  garbage: { key: "garbage", label: "Мусор", labelKz: "Қоқыс", color: "#65a30d", emoji: "🗑️" },
  lighting: { key: "lighting", label: "Освещение", labelKz: "Жарық", color: "#eab308", emoji: "💡" },
  ecology: { key: "ecology", label: "Экология", labelKz: "Экология", color: "#059669", emoji: "🌿" },
  transport: { key: "transport", label: "Транспорт", labelKz: "Көлік", color: "#0ea5e9", emoji: "🚌" },
  landscaping: { key: "landscaping", label: "Благоустройство", labelKz: "Абаттандыру", color: "#8b5cf6", emoji: "🌳" },
  safety: { key: "safety", label: "Безопасность", labelKz: "Қауіпсіздік", color: "#dc2626", emoji: "🚨" },
  other: { key: "other", label: "Другое", labelKz: "Басқа", color: "#64748b", emoji: "📌" },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const SEVERITY_META: Record<Severity, { label: string; color: string; weight: number }> = {
  low: { label: "Низкая", color: "#22c55e", weight: 1 },
  medium: { label: "Средняя", color: "#f59e0b", weight: 3 },
  high: { label: "Высокая", color: "#ef4444", weight: 6 },
};

export const STATUS_META: Record<Status, { label: string; color: string; icon: string }> = {
  new: { label: "Новое", color: "#3b82f6", icon: "🆕" },
  in_progress: { label: "В работе", color: "#f59e0b", icon: "🛠️" },
  resolved: { label: "Решено", color: "#22c55e", icon: "✅" },
  rejected: { label: "Отклонено", color: "#94a3b8", icon: "🚫" },
};
