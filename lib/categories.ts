import type { Category, Severity, Status } from "./types";

export interface CategoryMeta {
  key: Category;
  label: string;
  labelKz: string;
  color: string;
  emoji: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  roads: { key: "roads", label: "Дороги", labelKz: "Жолдар", color: "#ea6a12", emoji: "🛣️" },
  garbage: { key: "garbage", label: "Мусор", labelKz: "Қоқыс", color: "#5f9339", emoji: "🗑️" },
  lighting: { key: "lighting", label: "Освещение", labelKz: "Жарық", color: "#c29204", emoji: "💡" },
  ecology: { key: "ecology", label: "Экология", labelKz: "Экология", color: "#0e8f66", emoji: "🌿" },
  transport: { key: "transport", label: "Транспорт", labelKz: "Көлік", color: "#0284c7", emoji: "🚌" },
  landscaping: { key: "landscaping", label: "Благоустройство", labelKz: "Абаттандыру", color: "#7c53d6", emoji: "🌳" },
  safety: { key: "safety", label: "Безопасность", labelKz: "Қауіпсіздік", color: "#d92626", emoji: "🚨" },
  other: { key: "other", label: "Другое", labelKz: "Басқа", color: "#64748b", emoji: "📌" },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const SEVERITY_META: Record<Severity, { label: string; color: string; weight: number }> = {
  low: { label: "Низкая", color: "#16a34a", weight: 1 },
  medium: { label: "Средняя", color: "#d97706", weight: 3 },
  high: { label: "Высокая", color: "#dc2626", weight: 6 },
};

export const STATUS_META: Record<Status, { label: string; color: string; icon: string }> = {
  new: { label: "Новое", color: "#2f7fd0", icon: "🆕" },
  in_progress: { label: "В работе", color: "#d97706", icon: "🛠️" },
  resolved: { label: "Решено", color: "#16a34a", icon: "✅" },
  rejected: { label: "Отклонено", color: "#94a3b8", icon: "🚫" },
};
