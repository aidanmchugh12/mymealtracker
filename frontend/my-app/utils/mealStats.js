export const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const mealDateKey = (meal) => {
  if (!meal?.timestamp) {
    return toDateKey(new Date());
  }
  return toDateKey(new Date(meal.timestamp));
};

export const mealDisplayName = (meal) => meal?.foodName || meal?.name || "Meal";

export const aggregateMealsByDate = (meals = []) =>
  meals.reduce((byDate, meal) => {
    const key = mealDateKey(meal);
    const entry =
      byDate[key] || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        count: 0,
        meals: [],
      };

    entry.calories += Number(meal.calories) || 0;
    entry.protein += Number(meal.protein) || 0;
    entry.carbs += Number(meal.carbs) || 0;
    entry.fat += Number(meal.fat) || 0;
    entry.count += 1;
    entry.meals.push(meal);
    byDate[key] = entry;
    return byDate;
  }, {});
