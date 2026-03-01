export const TAG_COLOR = { Vegan: "#4ade80", Vegetarian: "#86efac", "Gluten-Free": "#fbbf24" };
export const TAG_STYLE = {
  Vegan:         { bg: "#4ade8018", border: "#4ade8040", color: "#4ade80" },
  Vegetarian:    { bg: "#86efac18", border: "#86efac40", color: "#86efac" },
  "Gluten-Free": { bg: "#fbbf2418", border: "#fbbf2440", color: "#fbbf24" },
};

export const MEAL_ICONS = { breakfast: "\uD83C\uDF73", lunch: "\u2600\uFE0F", dinner: "\uD83C\uDF19", snack: "\uD83C\uDF4E" };

// Added "snack" window for late-night / pre-dawn hours
export const MEAL_FOR_HOUR = (h) =>
  h < 5 ? "CLOSED" : h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 20 ? "dinner" : "CLOSED";

// When dining is closed, return the next open meal for recommendations (breakfast).
export const MEAL_FOR_RECOMMEND = (h) => {
  const meal = MEAL_FOR_HOUR(h);
  return meal === "CLOSED" ? "breakfast" : meal;
};

export const TODAY = new Date().toISOString().slice(0, 10);

export const HALL_NAMES = {
  "gordon-avenue-market":  "Gordon Ave",
  "rheta-s-benson-market": "Rheta's Market",
  "four-lakes-market":     "Four Lakes",
  "lakeshore-dining":      "Lakeshore",
};

// Station icons are hall-specific; leave empty until we have a full hall map.
export const STATION_ICONS = {};

export const CAT_COLOR = {
  entree: "#60a5fa", meat: "#f87171", grain: "#fbbf24",
  vegetable: "#4ade80", dessert: "#f472b6", condiment: "#a78bfa", other: "#94a3b8",
};

// Lifestyle / religious dietary preferences
export const DIETARY_PREFS = [
  { key: "vegan",      label: "Vegan",      icon: "\uD83C\uDF31" },
  { key: "vegetarian", label: "Vegetarian", icon: "\uD83E\uDD6C" },
  { key: "halal",      label: "Halal",      icon: "\u262A\uFE0F" },
  { key: "kosher",     label: "Kosher",     icon: "\u2721\uFE0F" },
];

// Food allergens â€” ingredients to avoid
export const ALLERGEN_OPTIONS = [
  { key: "no_meat",      label: "Meat",      icon: "\uD83C\uDF56" },
  { key: "no_eggs",      label: "Eggs",      icon: "\uD83C\uDF5A" },
  { key: "no_fish",      label: "Fish",      icon: "\uD83D\uDC1F" },
  { key: "no_shellfish", label: "Shellfish", icon: "\uD83E\uDD90" },
  { key: "dairy_free",   label: "Dairy",     icon: "\uD83E\uDD5B" },
  { key: "gluten_free",  label: "Gluten",    icon: "\uD83C\uDF5E" },
  { key: "nut_free",     label: "Peanuts",   icon: "\uD83C\uDF5C" },
  { key: "no_tree_nuts", label: "Tree Nuts", icon: "\uD83C\uDF30" },
  { key: "no_soy",       label: "Soy",       icon: "\uD83C\uDF31" },
];

// Combined â€” for backwards-compatible imports
export const DIETARY_OPTIONS = [...DIETARY_PREFS, ...ALLERGEN_OPTIONS];




