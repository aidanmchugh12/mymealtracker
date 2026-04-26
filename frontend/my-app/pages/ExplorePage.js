import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all",        label: "All",        emoji: "✨" },
  { id: "breakfast",  label: "Breakfast",  emoji: "🌅" },
  { id: "lunch",      label: "Lunch",      emoji: "🥙" },
  { id: "dinner",     label: "Dinner",     emoji: "🍽️" },
  { id: "snack",      label: "Snacks",     emoji: "🍎" },
  { id: "highprotein",label: "High Protein",emoji: "💪" },
  { id: "lowcarb",    label: "Low Carb",   emoji: "🥦" },
  { id: "vegetarian", label: "Vegetarian", emoji: "🌿" },
];

const RECIPES = [
  {
    id: 1,
    name: "Greek Yogurt Parfait",
    category: ["breakfast", "snack", "vegetarian"],
    emoji: "🫙",
    color: "#e0f2fe",
    accentColor: "#0284c7",
    time: "5 min",
    difficulty: "Easy",
    calories: 320,
    protein: 22,
    carbs: 38,
    fat: 6,
    servings: 1,
    tags: ["Quick", "No-cook", "High protein"],
    description: "Creamy Greek yogurt layered with fresh berries, crunchy granola, and a drizzle of honey. Ready in 5 minutes and packed with protein to start your day right.",
    ingredients: [
      "1 cup plain Greek yogurt (0% fat)",
      "½ cup mixed berries (blueberries, raspberries)",
      "¼ cup granola",
      "1 tbsp honey",
      "1 tsp vanilla extract",
    ],
    steps: [
      "Spoon half the Greek yogurt into a glass or bowl.",
      "Add a layer of mixed berries.",
      "Add the remaining yogurt on top.",
      "Sprinkle granola over the top.",
      "Drizzle with honey and add vanilla extract.",
    ],
  },
  {
    id: 2,
    name: "Grilled Chicken & Quinoa Bowl",
    category: ["lunch", "dinner", "highprotein"],
    emoji: "🥗",
    color: "#dcfce7",
    accentColor: "#16a34a",
    time: "25 min",
    difficulty: "Medium",
    calories: 520,
    protein: 48,
    carbs: 42,
    fat: 12,
    servings: 1,
    tags: ["High protein", "Meal prep", "Gluten-free"],
    description: "Tender grilled chicken breast over fluffy quinoa with roasted vegetables and a lemon-herb dressing. A complete meal that fuels performance.",
    ingredients: [
      "6 oz chicken breast",
      "½ cup dry quinoa",
      "1 cup mixed roasted vegetables",
      "2 tbsp olive oil",
      "Juice of 1 lemon",
      "1 tsp garlic powder",
      "Salt, pepper, and herbs to taste",
    ],
    steps: [
      "Cook quinoa according to package instructions.",
      "Season chicken with garlic powder, salt, and pepper.",
      "Grill chicken 6-7 min per side until cooked through.",
      "Roast vegetables at 400°F for 20 minutes.",
      "Slice chicken and assemble bowl. Drizzle with lemon and olive oil.",
    ],
  },
  {
    id: 3,
    name: "Avocado Toast with Eggs",
    category: ["breakfast", "vegetarian"],
    emoji: "🥑",
    color: "#fef9c3",
    accentColor: "#ca8a04",
    time: "10 min",
    difficulty: "Easy",
    calories: 410,
    protein: 18,
    carbs: 32,
    fat: 24,
    servings: 1,
    tags: ["Quick", "Vegetarian", "Trending"],
    description: "Smashed avocado on sourdough toast topped with a perfectly poached egg, red pepper flakes, and flaky sea salt. Brunch perfection.",
    ingredients: [
      "2 slices sourdough bread",
      "1 ripe avocado",
      "2 eggs",
      "Red pepper flakes",
      "Flaky sea salt",
      "1 tsp lemon juice",
    ],
    steps: [
      "Toast bread until golden and crispy.",
      "Mash avocado with lemon juice, salt, and pepper.",
      "Poach eggs in simmering water for 3 minutes.",
      "Spread avocado on toast.",
      "Top with poached eggs, red pepper flakes, and sea salt.",
    ],
  },
  {
    id: 4,
    name: "Tuna Lettuce Wraps",
    category: ["lunch", "snack", "highprotein", "lowcarb"],
    emoji: "🥬",
    color: "#f0fdf4",
    accentColor: "#22c55e",
    time: "10 min",
    difficulty: "Easy",
    calories: 240,
    protein: 32,
    carbs: 8,
    fat: 9,
    servings: 2,
    tags: ["Low carb", "High protein", "No-cook"],
    description: "Light and crispy romaine leaves filled with seasoned tuna, diced celery, and a light Greek yogurt dressing. Low carb, high satisfaction.",
    ingredients: [
      "2 cans tuna in water, drained",
      "4 large romaine lettuce leaves",
      "2 stalks celery, diced",
      "3 tbsp Greek yogurt",
      "1 tsp Dijon mustard",
      "Salt, pepper, dill to taste",
    ],
    steps: [
      "Drain tuna and flake into a bowl.",
      "Mix in diced celery, Greek yogurt, and Dijon mustard.",
      "Season with salt, pepper, and dill.",
      "Spoon filling into lettuce leaves.",
      "Serve immediately with lemon wedges.",
    ],
  },
  {
    id: 5,
    name: "Overnight Oats",
    category: ["breakfast", "vegetarian"],
    emoji: "🌙",
    color: "#fae8ff",
    accentColor: "#a855f7",
    time: "5 min + overnight",
    difficulty: "Easy",
    calories: 380,
    protein: 14,
    carbs: 58,
    fat: 10,
    servings: 1,
    tags: ["Meal prep", "No-cook", "Vegetarian"],
    description: "Thick, creamy oats soaked overnight in almond milk with chia seeds and topped with banana and almond butter. Zero morning effort required.",
    ingredients: [
      "½ cup rolled oats",
      "¾ cup almond milk",
      "1 tbsp chia seeds",
      "1 tbsp maple syrup",
      "½ banana, sliced",
      "1 tbsp almond butter",
    ],
    steps: [
      "Combine oats, almond milk, chia seeds, and maple syrup in a jar.",
      "Stir well to combine.",
      "Cover and refrigerate overnight (at least 6 hours).",
      "In the morning, top with sliced banana.",
      "Add a dollop of almond butter and serve cold.",
    ],
  },
  {
    id: 6,
    name: "Salmon with Roasted Asparagus",
    category: ["dinner", "highprotein", "lowcarb"],
    emoji: "🐟",
    color: "#fff1f2",
    accentColor: "#f43f5e",
    time: "20 min",
    difficulty: "Medium",
    calories: 460,
    protein: 42,
    carbs: 10,
    fat: 28,
    servings: 1,
    tags: ["Omega-3", "Low carb", "High protein"],
    description: "Pan-seared salmon fillet with crispy skin served alongside roasted asparagus with garlic and lemon. Elegant, healthy, and on the table in 20 minutes.",
    ingredients: [
      "6 oz salmon fillet",
      "1 bunch asparagus, trimmed",
      "3 cloves garlic, minced",
      "2 tbsp olive oil",
      "Juice of 1 lemon",
      "Salt, pepper, and dill",
    ],
    steps: [
      "Preheat oven to 425°F. Toss asparagus with olive oil, garlic, salt, and pepper.",
      "Roast asparagus for 12-15 minutes until tender.",
      "Season salmon with salt, pepper, and dill.",
      "Sear salmon skin-side up in an oven-safe pan for 3 min, flip.",
      "Finish in oven for 5 minutes. Serve with lemon.",
    ],
  },
  {
    id: 7,
    name: "Black Bean Tacos",
    category: ["dinner", "lunch", "vegetarian", "lowcarb"],
    emoji: "🌮",
    color: "#fff7ed",
    accentColor: "#f97316",
    time: "15 min",
    difficulty: "Easy",
    calories: 390,
    protein: 16,
    carbs: 54,
    fat: 11,
    servings: 2,
    tags: ["Vegetarian", "Budget-friendly", "Quick"],
    description: "Smoky spiced black beans in warm corn tortillas with fresh pico de gallo, avocado crema, and lime. Proof that meatless meals hit different.",
    ingredients: [
      "1 can black beans, drained",
      "6 small corn tortillas",
      "1 avocado",
      "½ cup pico de gallo",
      "¼ cup sour cream",
      "1 tsp cumin, smoked paprika, garlic powder",
      "Lime and cilantro to serve",
    ],
    steps: [
      "Heat beans in a pan with cumin, paprika, garlic powder, salt, and pepper.",
      "Warm tortillas in a dry pan or directly over flame.",
      "Mash avocado with lime juice and salt for crema.",
      "Fill tortillas with beans and top with pico de gallo.",
      "Add avocado crema, cilantro, and a squeeze of lime.",
    ],
  },
  {
    id: 8,
    name: "Protein Smoothie Bowl",
    category: ["breakfast", "snack", "highprotein", "vegetarian"],
    emoji: "🫐",
    color: "#ede9fe",
    accentColor: "#7c3aed",
    time: "8 min",
    difficulty: "Easy",
    calories: 430,
    protein: 30,
    carbs: 50,
    fat: 10,
    servings: 1,
    tags: ["High protein", "Antioxidants", "Quick"],
    description: "Thick blended acai and protein powder bowl topped with granola, fresh fruit, coconut flakes, and a drizzle of honey. Instagram-worthy and macro-friendly.",
    ingredients: [
      "1 scoop vanilla protein powder",
      "1 frozen acai packet (or frozen mixed berries)",
      "½ frozen banana",
      "¼ cup almond milk",
      "Toppings: granola, fresh berries, coconut flakes, honey",
    ],
    steps: [
      "Blend protein powder, acai, frozen banana, and almond milk until very thick.",
      "Pour into a bowl — it should be thick enough to hold toppings.",
      "Add granola in a line across the bowl.",
      "Arrange fresh berries and coconut flakes.",
      "Drizzle with honey and serve immediately.",
    ],
  },
  {
    id: 9,
    name: "Turkey & Veggie Stir-Fry",
    category: ["dinner", "lunch", "highprotein", "lowcarb"],
    emoji: "🥘",
    color: "#fef3c7",
    accentColor: "#d97706",
    time: "20 min",
    difficulty: "Medium",
    calories: 480,
    protein: 44,
    carbs: 22,
    fat: 16,
    servings: 2,
    tags: ["High protein", "Low carb", "Meal prep"],
    description: "Lean ground turkey stir-fried with colorful bell peppers, broccoli, and a savory ginger-soy glaze. Fast, filling, and endlessly customizable.",
    ingredients: [
      "12 oz lean ground turkey",
      "2 bell peppers, sliced",
      "2 cups broccoli florets",
      "3 tbsp soy sauce (low sodium)",
      "1 tbsp sesame oil",
      "1 tsp fresh ginger, grated",
      "2 cloves garlic, minced",
      "1 tsp cornstarch + 2 tbsp water",
    ],
    steps: [
      "Cook turkey in a wok over high heat, breaking up as it cooks.",
      "Add garlic and ginger, cook 1 minute.",
      "Add vegetables and stir-fry for 4-5 minutes until tender-crisp.",
      "Mix soy sauce, sesame oil, and cornstarch slurry.",
      "Pour sauce over, toss to coat, and cook 1 minute until glazed.",
    ],
  },
  {
    id: 10,
    name: "Apple & Almond Butter Snack",
    category: ["snack", "vegetarian", "lowcarb"],
    emoji: "🍏",
    color: "#f0fdf4",
    accentColor: "#15803d",
    time: "2 min",
    difficulty: "Easy",
    calories: 190,
    protein: 5,
    carbs: 24,
    fat: 9,
    servings: 1,
    tags: ["No-cook", "Quick", "Low calorie"],
    description: "Crisp apple slices with creamy almond butter and a sprinkle of cinnamon. The simplest snack that actually keeps you full.",
    ingredients: [
      "1 medium apple, sliced",
      "2 tbsp almond butter",
      "Pinch of cinnamon",
    ],
    steps: [
      "Core and slice the apple into wedges.",
      "Arrange on a plate.",
      "Add almond butter for dipping.",
      "Sprinkle with cinnamon and enjoy.",
    ],
  },
];

// ─── Recipe Detail Modal ───────────────────────────────────────────────────────
const RecipeModal = ({ recipe, visible, onClose, onLog }) => {
  if (!recipe) return null;
  const [logged, setLogged] = useState(false);

  const handleLog = () => {
    setLogged(true);
    onLog(recipe);
    setTimeout(onClose, 800);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modal.safe}>
        {/* Handle bar */}
        <View style={modal.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modal.scroll}>
          {/* Hero */}
          <View style={[modal.hero, { backgroundColor: recipe.color }]}>
            <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
              <Text style={modal.closeTxt}>✕</Text>
            </TouchableOpacity>
            <Text style={modal.heroEmoji}>{recipe.emoji}</Text>
            <Text style={modal.heroName}>{recipe.name}</Text>
            <View style={modal.heroMeta}>
              <Text style={[modal.heroMetaItem, { color: recipe.accentColor }]}>⏱ {recipe.time}</Text>
              <Text style={modal.heroMetaDot}>·</Text>
              <Text style={[modal.heroMetaItem, { color: recipe.accentColor }]}>👤 {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}</Text>
              <Text style={modal.heroMetaDot}>·</Text>
              <Text style={[modal.heroMetaItem, { color: recipe.accentColor }]}>{recipe.difficulty}</Text>
            </View>
          </View>

          {/* Macros */}
          <View style={modal.macrosRow}>
            {[
              { label: "Calories", val: recipe.calories, unit: "kcal", color: "#6366f1" },
              { label: "Protein", val: recipe.protein, unit: "g", color: "#10b981" },
              { label: "Carbs", val: recipe.carbs, unit: "g", color: "#f59e0b" },
              { label: "Fat", val: recipe.fat, unit: "g", color: "#ef4444" },
            ].map((m) => (
              <View key={m.label} style={modal.macroItem}>
                <Text style={[modal.macroVal, { color: m.color }]}>{m.val}</Text>
                <Text style={modal.macroUnit}>{m.unit}</Text>
                <Text style={modal.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={modal.section}>
            <Text style={modal.sectionTitle}>About</Text>
            <Text style={modal.description}>{recipe.description}</Text>
          </View>

          {/* Tags */}
          <View style={modal.tagsRow}>
            {recipe.tags.map((t) => (
              <View key={t} style={[modal.tag, { backgroundColor: recipe.accentColor + "18" }]}>
                <Text style={[modal.tagText, { color: recipe.accentColor }]}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Ingredients */}
          <View style={modal.section}>
            <Text style={modal.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={modal.listRow}>
                <View style={[modal.bullet, { backgroundColor: recipe.accentColor }]} />
                <Text style={modal.listText}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View style={modal.section}>
            <Text style={modal.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, i) => (
              <View key={i} style={modal.stepRow}>
                <View style={[modal.stepNum, { backgroundColor: recipe.accentColor }]}>
                  <Text style={modal.stepNumTxt}>{i + 1}</Text>
                </View>
                <Text style={modal.listText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Log button */}
          <TouchableOpacity
            style={[modal.logBtn, logged && modal.logBtnDone, { backgroundColor: logged ? "#10b981" : recipe.accentColor }]}
            onPress={handleLog}
            activeOpacity={0.85}
            disabled={logged}
          >
            <Text style={modal.logBtnTxt}>
              {logged ? "✓ Logged to Today!" : `Log ${recipe.calories} kcal to Today`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Recipe Card ──────────────────────────────────────────────────────────────
const RecipeCard = ({ recipe, onPress }) => (
  <TouchableOpacity style={[card.wrap, { backgroundColor: recipe.color }]} onPress={() => onPress(recipe)} activeOpacity={0.82}>
    <View style={card.top}>
      <Text style={card.emoji}>{recipe.emoji}</Text>
      <View style={[card.diffBadge, { backgroundColor: recipe.accentColor + "22" }]}>
        <Text style={[card.diffText, { color: recipe.accentColor }]}>{recipe.difficulty}</Text>
      </View>
    </View>
    <Text style={card.name} numberOfLines={2}>{recipe.name}</Text>
    <View style={card.meta}>
      <Text style={[card.metaText, { color: recipe.accentColor }]}>⏱ {recipe.time}</Text>
      <Text style={card.dot}>·</Text>
      <Text style={[card.metaText, { color: recipe.accentColor }]}>🔥 {recipe.calories} kcal</Text>
    </View>
    <View style={card.macroBar}>
      <View style={[card.macroSeg, { flex: recipe.protein * 4, backgroundColor: "#10b981" }]} />
      <View style={[card.macroSeg, { flex: recipe.carbs * 4, backgroundColor: "#f59e0b" }]} />
      <View style={[card.macroSeg, { flex: recipe.fat * 9, backgroundColor: "#ef4444" }]} />
    </View>
    <Text style={card.macroHint}>
      P {recipe.protein}g · C {recipe.carbs}g · F {recipe.fat}g
    </Text>
  </TouchableOpacity>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loggedCount, setLoggedCount] = useState(0);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    return RECIPES.filter((r) => {
      const matchCat = activeCategory === "all" || r.category.includes(activeCategory);
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const handleLog = (recipe) => {
    setLoggedCount((c) => c + 1);
    setToast(`${recipe.name} logged! +${recipe.calories} kcal`);
    setTimeout(() => setToast(""), 2500);
  };

  // Split into 2 columns
  const leftCol = filtered.filter((_, i) => i % 2 === 0);
  const rightCol = filtered.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSub}>{RECIPES.length} recipes · {loggedCount} logged today</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 26 }}>🍳</Text>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes or tags..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
            onPress={() => setActiveCategory(cat.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
            <Text style={[styles.chipLabel, activeCategory === cat.id && styles.chipLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Toast ── */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toast}</Text>
        </View>
      ) : null}

      {/* ── Recipe grid ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptySub}>Try a different search or category</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>
              {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
            </Text>
            <View style={styles.grid}>
              {/* Left column */}
              <View style={styles.col}>
                {leftCol.map((r) => <RecipeCard key={r.id} recipe={r} onPress={openRecipe} />)}
              </View>
              {/* Right column */}
              <View style={styles.col}>
                {rightCol.map((r) => <RecipeCard key={r.id} recipe={r} onPress={openRecipe} />)}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Recipe detail modal ── */}
      <RecipeModal
        recipe={selectedRecipe}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLog={handleLog}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#1e1b4b", letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: { backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#1e1b4b" },
  searchClear: { color: "#94a3b8", fontSize: 14, paddingLeft: 4 },

  chipScroll: { backgroundColor: "#fff", maxHeight: 56 },
  chipRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, flexDirection: "row" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  chipLabelActive: { color: "#6366f1" },

  toast: {
    position: "absolute",
    top: 160,
    alignSelf: "center",
    backgroundColor: "#10b981",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  toastText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  gridContent: { padding: 12, paddingBottom: 40 },
  resultCount: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  grid: { flexDirection: "row", gap: 10 },
  col: { flex: 1, gap: 10 },

  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyIcon: { fontSize: 42, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#475569" },
  emptySub: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
});

// Card styles
const card = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  emoji: { fontSize: 30 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  diffText: { fontSize: 10, fontWeight: "800" },
  name: { fontSize: 14, fontWeight: "800", color: "#1e1b4b", lineHeight: 19, marginBottom: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  metaText: { fontSize: 11, fontWeight: "700" },
  dot: { color: "#cbd5e1", fontSize: 10 },
  macroBar: {
    flexDirection: "row",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    marginBottom: 5,
    gap: 1,
  },
  macroSeg: { height: "100%" },
  macroHint: { fontSize: 10, color: "#94a3b8", fontWeight: "600" },
});

// Modal styles
const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  scroll: { paddingBottom: 48 },

  hero: {
    padding: 28,
    alignItems: "center",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeTxt: { color: "#64748b", fontWeight: "700", fontSize: 13 },
  heroEmoji: { fontSize: 56, marginBottom: 10 },
  heroName: { fontSize: 22, fontWeight: "900", color: "#1e1b4b", textAlign: "center", marginBottom: 8 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetaItem: { fontSize: 13, fontWeight: "700" },
  heroMetaDot: { color: "#cbd5e1" },

  macrosRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
  },
  macroItem: { flex: 1, alignItems: "center", gap: 2 },
  macroVal: { fontSize: 20, fontWeight: "900" },
  macroUnit: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  macroLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  description: { fontSize: 14, color: "#475569", lineHeight: 22 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginTop: 10 },
  tag: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 12, fontWeight: "700" },

  listRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },
  listText: { flex: 1, fontSize: 14, color: "#334155", lineHeight: 21 },

  logBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logBtnDone: { shadowColor: "#10b981" },
  logBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
