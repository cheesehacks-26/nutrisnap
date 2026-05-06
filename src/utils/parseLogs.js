/**
 * Groups flat meal_log rows into meal-type buckets with nutrition totals.
 * @param {Array} logs - raw rows from GET /api/log
 * @returns {Array} grouped meal objects
 */
export function parseLogs(logs) {
  const groups = {};
  (logs || []).forEach(log => {
    const mt = log.meal_type || "snack";
    if (!groups[mt]) {
      groups[mt] = {
        meal_id: mt,
        meal_type: mt,
        logged_at: log.logged_at,
        dishes: [],
        total_nutrition: { calories: 0, g_protein: 0, g_carbs: 0, g_fat: 0 },
      };
    }
    groups[mt].dishes.push({
      log_id:   log.id ?? log.log_id,
      food_id:  log.food_id || log.id,
      name:     log.food_name,
      station:  log.hall || "",
      servings: log.quantity || 1,
      nutrition: {
        calories:  log.calories   || 0,
        g_protein: log.protein_g  || 0,
        g_carbs:   log.carbs_g    || 0,
        g_fat:     log.fat_g      || 0,
        mg_sodium: log.sodium_mg  || 0,
      },
    });
    groups[mt].total_nutrition.calories  += log.calories   || 0;
    groups[mt].total_nutrition.g_protein += log.protein_g  || 0;
    groups[mt].total_nutrition.g_carbs   += log.carbs_g    || 0;
    groups[mt].total_nutrition.g_fat     += log.fat_g      || 0;
  });
  return Object.values(groups);
}
