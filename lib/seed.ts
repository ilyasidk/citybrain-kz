import type { Category, Incident, Severity, Status } from "./types";
import { districtForPoint } from "./geo";

interface Template {
  category: Category;
  title: string;
  description: string;
  severity: Severity;
}

const TEMPLATES: Template[] = [
  { category: "roads", title: "Глубокая яма на проезжей части", description: "Большая яма на дороге, машины объезжают по встречной. Опасно в тёмное время суток.", severity: "high" },
  { category: "roads", title: "Провал асфальта у остановки", description: "Разрушение дорожного покрытия рядом с автобусной остановкой.", severity: "medium" },
  { category: "roads", title: "Стёртая разметка на перекрёстке", description: "Не видно пешеходного перехода, водители не пропускают людей.", severity: "medium" },
  { category: "garbage", title: "Переполненные мусорные контейнеры", description: "Контейнеры не вывозили несколько дней, мусор вокруг площадки.", severity: "medium" },
  { category: "garbage", title: "Стихийная свалка во дворе", description: "Строительный мусор свалили у детской площадки.", severity: "high" },
  { category: "garbage", title: "Разбросанный мусор в парке", description: "После выходных много мусора, урны переполнены.", severity: "low" },
  { category: "lighting", title: "Не работает уличное освещение", description: "Тёмный участок улицы, фонари не горят уже неделю.", severity: "medium" },
  { category: "lighting", title: "Сломанный фонарь у школы", description: "Разбит плафон фонаря рядом с входом в школу.", severity: "high" },
  { category: "lighting", title: "Мигает фонарь во дворе", description: "Фонарь постоянно мигает, ночью почти нет света.", severity: "low" },
  { category: "ecology", title: "Слив в арык неизвестной жидкости", description: "В арык сливают что-то с резким запахом.", severity: "high" },
  { category: "ecology", title: "Сухие деревья вдоль дороги", description: "Несколько засохших деревьев, могут упасть.", severity: "medium" },
  { category: "ecology", title: "Задымление от сжигания листвы", description: "Регулярно жгут листву, сильный дым во дворе.", severity: "medium" },
  { category: "transport", title: "Разбитый павильон остановки", description: "Разбито стекло павильона, негде укрыться от дождя.", severity: "low" },
  { category: "transport", title: "Отсутствует пандус на остановке", description: "Людям с колясками невозможно подняться.", severity: "medium" },
  { category: "transport", title: "Долгое ожидание автобуса №", description: "Интервал движения слишком большой в час пик.", severity: "low" },
  { category: "landscaping", title: "Сломанная скамейка в сквере", description: "Скамейка сломана, торчат острые части.", severity: "low" },
  { category: "landscaping", title: "Неухоженный газон и кусты", description: "Давно не косили траву, зарос тротуар.", severity: "low" },
  { category: "landscaping", title: "Повреждённая детская площадка", description: "Сломаны качели и горка, играть опасно.", severity: "high" },
  { category: "safety", title: "Открытый канализационный люк", description: "Люк без крышки на тротуаре, ходят дети.", severity: "high" },
  { category: "safety", title: "Оголённые провода на столбе", description: "Свисают провода на уровне человека.", severity: "high" },
  { category: "safety", title: "Скользкий спуск без перил", description: "Крутой спуск, зимой очень скользко, нет перил.", severity: "medium" },
];

const REPORTERS = ["Айгуль", "Данияр", "Мария", "Ерлан", "Ольга", "Нурлан", "Асель", "Тимур", "Гость"];

const ANCHOR = new Date("2026-07-15T09:00:00Z").getTime();

function pseudo(n: number, mod: number): number {
  // Детерминированная псевдослучайность на основе индекса.
  const x = Math.sin(n * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return Math.floor(frac * mod);
}

function buildStatus(i: number): { status: Status; history: { status: Status; at: string; note?: string }[]; createdISO: string } {
  const daysAgo = 1 + pseudo(i * 3 + 1, 58); // за последние ~2 месяца
  const createdMs = ANCHOR - daysAgo * 86400000;
  const createdISO = new Date(createdMs).toISOString();
  const roll = pseudo(i * 7 + 2, 100);
  const takeDays = 1 + pseudo(i * 23 + 8, 4); // срок до взятия в работу
  const fixDays = takeDays + 1 + pseudo(i * 29 + 9, 13); // срок до закрытия

  const history: { status: Status; at: string; note?: string }[] = [
    { status: "new", at: createdISO },
  ];
  let status: Status = "new";

  if (roll < 40) {
    status = "new";
  } else if (roll < 70) {
    status = "in_progress";
    history.push({ status: "in_progress", at: new Date(createdMs + takeDays * 86400000).toISOString(), note: "Передано в коммунальную службу" });
  } else if (roll < 90) {
    status = "resolved";
    history.push({ status: "in_progress", at: new Date(createdMs + takeDays * 86400000).toISOString() });
    history.push({ status: "resolved", at: new Date(createdMs + fixDays * 86400000).toISOString(), note: "Проблема устранена" });
  } else {
    status = "rejected";
    history.push({ status: "rejected", at: new Date(createdMs + takeDays * 86400000).toISOString(), note: "Не входит в зону ответственности акимата" });
  }

  return { status, history, createdISO };
}

function generate(): Incident[] {
  const out: Incident[] = [];
  const count = 42;
  for (let i = 0; i < count; i++) {
    const tpl = TEMPLATES[i % TEMPLATES.length];
    // Разброс координат вокруг центра Алматы (~ ±0.05°).
    const lat = 43.238949 + (pseudo(i * 5 + 3, 1000) / 1000 - 0.5) * 0.11;
    const lng = 76.889709 + (pseudo(i * 11 + 4, 1000) / 1000 - 0.5) * 0.16;
    const { status, history, createdISO } = buildStatus(i);
    const confirmations = pseudo(i * 13 + 5, 24);
    out.push({
      id: `seed-${(i + 1).toString().padStart(3, "0")}`,
      category: tpl.category,
      severity: tpl.severity,
      title: tpl.title,
      description: tpl.description,
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      district: districtForPoint({ lat, lng }),
      photos: [],
      status,
      statusHistory: history,
      createdAt: createdISO,
      confirmations,
      resolvedVotes: pseudo(i * 17 + 6, 5),
      reporter: REPORTERS[i % REPORTERS.length],
      aiConfidence: 0.7 + pseudo(i * 19 + 7, 30) / 100,
    });
  }
  return out;
}

export const SEED_INCIDENTS: Incident[] = generate();
