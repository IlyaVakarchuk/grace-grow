import { PlantSpecies, TrefleSearchHit } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/labels";

export type PlantCardData = {
  key: string;
  name: string;
  scientificName?: string | null;
  imageUrl?: string | null;
  typeKey?: string;
  typeLabel?: string;
  tags: string[];
  facts: { icon: string; label: string; value: string }[];
  footer?: string;
  source?: string;
};

export function speciesToCard(item: PlantSpecies): PlantCardData {
  const tags = [TYPE_LABELS[item.type] ?? item.type];
  if (item.family) tags.push(item.family);
  if (item.genus) tags.push(item.genus);

  const facts = [
    { icon: "☀️", label: "Свет", value: item.light },
    { icon: "💧", label: "Влажность", value: item.humidity },
    { icon: "🚿", label: "Полив", value: `каждые ${item.water_days} дн.` },
  ];

  const meta = item.trefle_data;
  if (meta?.growth_habit) {
    facts.push({ icon: "🌿", label: "Форма", value: meta.growth_habit });
  }
  if (meta?.days_to_harvest) {
    facts.push({
      icon: "🍃",
      label: "Урожай",
      value: `~${meta.days_to_harvest} дн.`,
    });
  }

  return {
    key: item.id,
    name: item.name,
    scientificName: item.scientific_name,
    imageUrl: item.image_url,
    typeKey: item.type,
    typeLabel: TYPE_LABELS[item.type] ?? item.type,
    tags,
    facts,
    footer: item.source === "trefle" ? "Trefle" : "Локальная база",
    source: item.source,
  };
}

export function trefleHitToCard(
  hit: TrefleSearchHit,
  importing?: boolean
): PlantCardData {
  const tags = [];
  if (hit.genus) tags.push(hit.genus);
  if (hit.family) tags.push(hit.family);

  return {
    key: `trefle-${hit.trefle_id}`,
    name: hit.name,
    scientificName: hit.scientific_name,
    imageUrl: hit.image_url,
    tags,
    facts: [
      { icon: "🔬", label: "Наука", value: hit.scientific_name },
      ...(hit.genus
        ? [{ icon: "🌱", label: "Род", value: hit.genus }]
        : []),
      ...(hit.family
        ? [{ icon: "📚", label: "Семейство", value: hit.family }]
        : []),
    ],
    footer: hit.imported
      ? "Уже в библиотеке"
      : importing
        ? "Импорт..."
        : "Нажмите, чтобы импортировать",
    source: "trefle",
  };
}

export type DetailSection = {
  title: string;
  rows: { label: string; value: string }[];
};

export function speciesToDetailSections(item: PlantSpecies): DetailSection[] {
  const sections: DetailSection[] = [];

  const taxonomy: DetailSection = {
    title: "Таксономия",
    rows: [],
  };
  if (item.scientific_name) {
    taxonomy.rows.push({ label: "Научное название", value: item.scientific_name });
  }
  if (item.family) taxonomy.rows.push({ label: "Семейство", value: item.family });
  if (item.genus) taxonomy.rows.push({ label: "Род", value: item.genus });
  if (taxonomy.rows.length) sections.push(taxonomy);

  const care: DetailSection = {
    title: "Уход",
    rows: [
      { label: "Свет", value: item.light },
      { label: "Влажность", value: item.humidity },
      { label: "Полив", value: `каждые ${item.water_days} дн.` },
    ],
  };
  if (item.fertilize_days) {
    care.rows.push({
      label: "Удобрение",
      value: `каждые ${item.fertilize_days} дн.`,
    });
  }
  if (item.repot_days) {
    care.rows.push({
      label: "Пересадка",
      value: `каждые ${item.repot_days} дн.`,
    });
  }
  sections.push(care);

  const meta = item.trefle_data;
  if (meta) {
    const growth: DetailSection = { title: "Trefle · рост", rows: [] };
    if (meta.growth_description) {
      growth.rows.push({ label: "Описание", value: meta.growth_description });
    }
    if (meta.growth_habit) {
      growth.rows.push({ label: "Привычка роста", value: meta.growth_habit });
    }
    if (meta.growth_form) {
      growth.rows.push({ label: "Форма роста", value: meta.growth_form });
    }
    if (meta.ligneous_type) {
      growth.rows.push({ label: "Тип", value: meta.ligneous_type });
    }
    if (meta.light_label) {
      growth.rows.push({
        label: "Свет",
        value: meta.light_level
          ? `${meta.light_label} (${meta.light_level}/10)`
          : meta.light_label,
      });
    }
    if (meta.soil_humidity_label) {
      growth.rows.push({
        label: "Влажность почвы",
        value: meta.soil_humidity_level
          ? `${meta.soil_humidity_label} (${meta.soil_humidity_level}/10)`
          : meta.soil_humidity_label,
      });
    }
    if (meta.atmospheric_humidity_label) {
      growth.rows.push({
        label: "Влажность воздуха",
        value: meta.atmospheric_humidity_level
          ? `${meta.atmospheric_humidity_label} (${meta.atmospheric_humidity_level}/10)`
          : meta.atmospheric_humidity_label,
      });
    }
    if (meta.days_to_harvest) {
      growth.rows.push({
        label: "Дней до урожая",
        value: String(meta.days_to_harvest),
      });
    }
    if (growth.rows.length) sections.push(growth);
  }

  return sections;
}
