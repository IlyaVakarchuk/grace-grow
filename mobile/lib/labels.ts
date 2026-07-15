export const TASK_LABELS: Record<string, string> = {
  water: "💧 Полить",
  fertilize: "🌿 Удобрить",
  repot: "🪴 Пересадить",
  prune: "✂️ Обрезать",
  harvest: "🍅 Собрать",
  other: "📝 Другое",
};

export const TYPE_LABELS: Record<string, string> = {
  vegetable: "Овощ",
  herb: "Зелень",
  spice: "Специя",
  fruit: "Фрукт",
  indoor: "Комнатное",
  other: "Другое",
};

export const TYPE_EMOJI: Record<string, string> = {
  vegetable: "🍅",
  herb: "🌿",
  spice: "🌶️",
  fruit: "🍋",
  indoor: "🪴",
  other: "🌱",
};

export const FILTER_CHIPS = [
  { key: "", label: "Все" },
  { key: "vegetable", label: "Овощ" },
  { key: "herb", label: "Зелень" },
  { key: "spice", label: "Специя" },
  { key: "indoor", label: "Комнатное" },
];
