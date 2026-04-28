import { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../utils/api";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all",         label: "All",          emoji: "✨" },
  { id: "breakfast",   label: "Breakfast",    emoji: "🌅" },
  { id: "lunch",       label: "Lunch",        emoji: "🥙" },
  { id: "dinner",      label: "Dinner",       emoji: "🍽️" },
  { id: "snack",       label: "Snacks",       emoji: "🍎" },
  { id: "highprotein", label: "High Protein", emoji: "💪" },
  { id: "lowcarb",     label: "Low Carb",     emoji: "🥦" },
  { id: "vegetarian",  label: "Vegetarian",   emoji: "🌿" },
];

const RECIPES = [
  {
    id: 1, name: "Greek Yogurt Parfait",
    category: ["breakfast", "snack", "vegetarian"],
    emoji: "🫙", color: "#e0f2fe", accentColor: "#0284c7",
    time: "5 min", difficulty: "Easy", calories: 320, protein: 22, carbs: 38, fat: 6, servings: 1,
    tags: ["Quick", "No-cook", "High protein"],
    description: "Creamy Greek yogurt layered with fresh berries, crunchy granola, and a drizzle of honey. Ready in 5 minutes and packed with protein to start your day right.",
    ingredients: ["1 cup plain Greek yogurt (0% fat)", "½ cup mixed berries (blueberries, raspberries)", "¼ cup granola", "1 tbsp honey", "1 tsp vanilla extract"],
    steps: ["Spoon half the Greek yogurt into a glass or bowl.", "Add a layer of mixed berries.", "Add the remaining yogurt on top.", "Sprinkle granola over the top.", "Drizzle with honey and add vanilla extract."],
  },
  {
    id: 2, name: "Grilled Chicken & Quinoa Bowl",
    category: ["lunch", "dinner", "highprotein"],
    emoji: "🥗", color: "#dcfce7", accentColor: "#16a34a",
    time: "25 min", difficulty: "Medium", calories: 520, protein: 48, carbs: 42, fat: 12, servings: 1,
    tags: ["High protein", "Meal prep", "Gluten-free"],
    description: "Tender grilled chicken breast over fluffy quinoa with roasted vegetables and a lemon-herb dressing. A complete meal that fuels performance.",
    ingredients: ["6 oz chicken breast", "½ cup dry quinoa", "1 cup mixed roasted vegetables", "2 tbsp olive oil", "1 lemon (juice)", "Salt, pepper, garlic powder"],
    steps: ["Cook quinoa according to package instructions.", "Season chicken with salt, pepper, and garlic powder.", "Grill chicken 6-7 minutes per side until cooked through.", "Toss vegetables with olive oil and roast at 400°F for 20 minutes.", "Slice chicken and serve over quinoa with vegetables.", "Drizzle with lemon juice."],
  },
  {
    id: 3, name: "Avocado Toast with Eggs",
    category: ["breakfast", "lunch", "vegetarian"],
    emoji: "🥑", color: "#fef9c3", accentColor: "#ca8a04",
    time: "10 min", difficulty: "Easy", calories: 410, protein: 18, carbs: 32, fat: 24, servings: 1,
    tags: ["Quick", "Vegetarian", "High fiber"],
    description: "Creamy mashed avocado on toasted sourdough topped with perfectly poached eggs and a sprinkle of red pepper flakes.",
    ingredients: ["2 slices sourdough bread", "1 ripe avocado", "2 large eggs", "Red pepper flakes", "Salt and black pepper", "Lemon juice"],
    steps: ["Toast the sourdough slices.", "Mash avocado with lemon juice, salt and pepper.", "Poach eggs in simmering water for 3 minutes.", "Spread avocado on toast.", "Top with poached eggs and red pepper flakes."],
  },
  {
    id: 4, name: "Salmon & Sweet Potato",
    category: ["dinner", "highprotein", "lowcarb"],
    emoji: "🐟", color: "#fce7f3", accentColor: "#db2777",
    time: "30 min", difficulty: "Medium", calories: 480, protein: 42, carbs: 28, fat: 18, servings: 1,
    tags: ["Omega-3", "High protein", "Gluten-free"],
    description: "Pan-seared salmon fillet with a honey-glazed sweet potato and steamed broccoli. Rich in omega-3s and antioxidants.",
    ingredients: ["6 oz salmon fillet", "1 medium sweet potato", "1 cup broccoli florets", "1 tbsp olive oil", "1 tsp honey", "Salt, pepper, paprika"],
    steps: ["Preheat oven to 400°F.", "Cube sweet potato, toss with olive oil and honey, roast 25 minutes.", "Season salmon with salt, pepper, and paprika.", "Sear salmon skin-side down 4 minutes, flip and cook 3 more minutes.", "Steam broccoli 4 minutes.", "Plate salmon with sweet potato and broccoli."],
  },
  {
    id: 5, name: "Protein Smoothie Bowl",
    category: ["breakfast", "snack", "highprotein", "vegetarian"],
    emoji: "🫐", color: "#ede9fe", accentColor: "#7c3aed",
    time: "8 min", difficulty: "Easy", calories: 380, protein: 28, carbs: 45, fat: 8, servings: 1,
    tags: ["No-cook", "High protein", "Antioxidants"],
    description: "Thick blended açaí and protein base topped with fresh fruit, seeds, and nut butter drizzle.",
    ingredients: ["1 scoop vanilla protein powder", "½ cup frozen mixed berries", "½ banana", "¼ cup almond milk", "Toppings: granola, blueberries, chia seeds, almond butter"],
    steps: ["Blend protein powder, berries, banana and almond milk until thick.", "Pour into a bowl.", "Top with granola, fresh blueberries, chia seeds.", "Drizzle with almond butter."],
  },
  {
    id: 6, name: "Turkey & Veggie Wrap",
    category: ["lunch", "lowcarb"],
    emoji: "🌯", color: "#f0fdf4", accentColor: "#15803d",
    time: "10 min", difficulty: "Easy", calories: 350, protein: 30, carbs: 30, fat: 10, servings: 1,
    tags: ["Quick", "Meal prep", "Low carb"],
    description: "Lean turkey slices with crisp vegetables, hummus, and feta in a whole-wheat wrap.",
    ingredients: ["1 large whole-wheat tortilla", "4 oz sliced turkey breast", "2 tbsp hummus", "1 oz feta cheese", "Lettuce, tomato, cucumber, red onion"],
    steps: ["Spread hummus on the tortilla.", "Layer turkey, vegetables, and feta.", "Roll tightly and slice in half."],
  },
];

// ─── Recipe Modal ─────────────────────────────────────────────────────────────
const RecipeModal = ({ recipe, visible, onClose, onLog }) => {
  const [logged, setLogged] = useState(false);

  const handleLog = () => {
    setLogged(true);
    onLog(recipe);
  };

  if (!recipe) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modal.safe}>
        <View style={modal.handle} />
        <ScrollView contentContainerStyle={modal.scroll}>
          <View style={[modal.hero, { backgroundColor: recipe.color }]}>
            <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
              <Text style={modal.closeTxt}>✕</Text>
            </TouchableOpacity>
            <Text style={modal.heroEmoji}>{recipe.emoji}</Text>
            <Text style={modal.heroName}>{recipe.name}</Text>
            <View style={modal.heroMeta}>
              <Text style={[modal.heroMetaItem, { color: recipe.accentColor }]}>⏱ {recipe.time}</Text>
              <Text style={modal.heroMetaDot}>·</Text>
              <Text style={[modal.heroMetaItem, { color: recipe.accentColor }]}>{recipe.difficulty}</Text>
              <Text style={modal.heroMetaDot}>·</Text>
              <Text style={[modal.heroMetaItem, { color: recipe.accentColor }]}>👤 {recipe.servings} serving</Text>
            </View>
          </View>

          <View style={modal.macrosRow}>
            {[
              { label: "Calories", value: recipe.calories, unit: "kcal", color: "#f97316" },
              { label: "Protein",  value: recipe.protein,  unit: "g",    color: "#10b981" },
              { label: "Carbs",    value: recipe.carbs,    unit: "g",    color: "#f59e0b" },
              { label: "Fat",      value: recipe.fat,      unit: "g",    color: "#ef4444" },
            ].map((m) => (
              <View key={m.label} style={modal.macroItem}>
                <Text style={[modal.macroVal, { color: m.color }]}>{m.value}</Text>
                <Text style={modal.macroUnit}>{m.unit}</Text>
                <Text style={modal.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          <View style={modal.tagsRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={[modal.tag, { backgroundColor: recipe.accentColor + "18" }]}>
                <Text style={[modal.tagText, { color: recipe.accentColor }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={modal.section}>
            <Text style={modal.sectionTitle}>About</Text>
            <Text style={modal.description}>{recipe.description}</Text>
          </View>

          <View style={modal.section}>
            <Text style={modal.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={modal.listRow}>
                <View style={[modal.bullet, { backgroundColor: recipe.accentColor }]} />
                <Text style={modal.listText}>{ing}</Text>
              </View>
            ))}
          </View>

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

          <TouchableOpacity
            style={[modal.logBtn, { backgroundColor: logged ? "#10b981" : recipe.accentColor }, logged && modal.logBtnDone]}
            onPress={handleLog}
            disabled={logged}
            activeOpacity={0.85}
          >
            <Text style={modal.logBtnTxt}>{logged ? "✓ Logged!" : `Log ${recipe.calories} kcal`}</Text>
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
      <View style={[card.macroSeg, { flex: recipe.carbs * 4,   backgroundColor: "#f59e0b" }]} />
      <View style={[card.macroSeg, { flex: recipe.fat * 9,     backgroundColor: "#ef4444" }]} />
    </View>
    <Text style={card.macroHint}>P {recipe.protein}g · C {recipe.carbs}g · F {recipe.fat}g</Text>
  </TouchableOpacity>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const { token } = useAuth();
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible,   setModalVisible]   = useState(false);
  const [loggedCount,    setLoggedCount]    = useState(0);
  const [toast,          setToast]          = useState("");

  const filtered = useMemo(() => RECIPES.filter((r) => {
    const matchCat    = activeCategory === "all" || r.category.includes(activeCategory);
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  }), [search, activeCategory]);

  const openRecipe = (recipe) => { setSelectedRecipe(recipe); setModalVisible(true); };

  // ─────────────────────────────────────────────────────────────────────────────
  // SETTER — POST /meals  (log a recipe as a meal)
  // DB table : meals
  // Fields   : foodName, calories, protein, carbs, fat
  // Notes    : Same endpoint as HomePage. loggedCount is local display state.
  //            Server stamps userId + loggedDate from the JWT.
  // ─────────────────────────────────────────────────────────────────────────────
  const handleLog = async (recipe) => {
    // Optimistic UI — update toast + count immediately
    setLoggedCount((c) => c + 1);
    setToast(`${recipe.name} logged! +${recipe.calories} kcal`);
    setTimeout(() => setToast(""), 2500);

    const result = await apiPost(token, "/meals", {
      foodName: recipe.name,
      calories: recipe.calories,
      protein:  recipe.protein,
      carbs:    recipe.carbs,
      fat:      recipe.fat,
    });
    if (!result.success) {
      console.error("POST /meals (recipe) failed:", result.error);
      // Revert the optimistic count if the server rejected it
      setLoggedCount((c) => Math.max(0, c - 1));
    }
  };

  const leftCol  = filtered.filter((_, i) => i % 2 === 0);
  const rightCol = filtered.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSub}>{RECIPES.length} recipes · {loggedCount} logged today</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 26 }}>🍳</Text>
        </View>
      </View>

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} style={styles.chipScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
            onPress={() => setActiveCategory(cat.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
            <Text style={[styles.chipLabel, activeCategory === cat.id && styles.chipLabelActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toast}</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptySub}>Try a different search or category</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>{filtered.length} recipe{filtered.length !== 1 ? "s" : ""}</Text>
            <View style={styles.grid}>
              <View style={styles.col}>{leftCol.map((r)  => <RecipeCard key={r.id} recipe={r} onPress={openRecipe} />)}</View>
              <View style={styles.col}>{rightCol.map((r) => <RecipeCard key={r.id} recipe={r} onPress={openRecipe} />)}</View>
            </View>
          </>
        )}
      </ScrollView>

      <RecipeModal recipe={selectedRecipe} visible={modalVisible} onClose={() => setModalVisible(false)} onLog={handleLog} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },

  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#1e1b4b", letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  headerIcon:  { width: 48, height: 48, borderRadius: 16, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center" },

  searchWrap:  { backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 12 },
  searchBar:   { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 14, paddingHorizontal: 14, gap: 8 },
  searchIcon:  { fontSize: 15 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#1e1b4b" },
  searchClear: { color: "#94a3b8", fontSize: 14, paddingLeft: 4 },

  chipScroll: { backgroundColor: "#fff", maxHeight: 56 },
  chipRow:    { paddingHorizontal: 16, paddingBottom: 10, gap: 8, flexDirection: "row" },
  chip:       { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 5, borderWidth: 1.5, borderColor: "transparent" },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
  chipEmoji:  { fontSize: 13 },
  chipLabel:  { fontSize: 12, fontWeight: "700", color: "#64748b" },
  chipLabelActive: { color: "#6366f1" },

  toast:     { position: "absolute", top: 160, alignSelf: "center", backgroundColor: "#10b981", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, zIndex: 100, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  toastText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  gridContent:  { padding: 12, paddingBottom: 40 },
  resultCount:  { fontSize: 11, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  grid:         { flexDirection: "row", gap: 10 },
  col:          { flex: 1, gap: 10 },
  empty:        { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyIcon:    { fontSize: 42, marginBottom: 4 },
  emptyTitle:   { fontSize: 16, fontWeight: "800", color: "#475569" },
  emptySub:     { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
});

const card = StyleSheet.create({
  wrap:      { borderRadius: 18, padding: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  top:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  emoji:     { fontSize: 30 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  diffText:  { fontSize: 10, fontWeight: "800" },
  name:      { fontSize: 14, fontWeight: "800", color: "#1e1b4b", lineHeight: 19, marginBottom: 6 },
  meta:      { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  metaText:  { fontSize: 11, fontWeight: "700" },
  dot:       { color: "#cbd5e1", fontSize: 10 },
  macroBar:  { flexDirection: "row", height: 4, borderRadius: 2, overflow: "hidden", backgroundColor: "#e2e8f0", marginBottom: 5, gap: 1 },
  macroSeg:  { height: "100%" },
  macroHint: { fontSize: 10, color: "#94a3b8", fontWeight: "600" },
});

const modal = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: "#fff" },
  handle:      { width: 40, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  scroll:      { paddingBottom: 48 },
  hero:        { padding: 28, alignItems: "center", position: "relative" },
  closeBtn:    { position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.08)", alignItems: "center", justifyContent: "center" },
  closeTxt:    { color: "#64748b", fontWeight: "700", fontSize: 13 },
  heroEmoji:   { fontSize: 56, marginBottom: 10 },
  heroName:    { fontSize: 22, fontWeight: "900", color: "#1e1b4b", textAlign: "center", marginBottom: 8 },
  heroMeta:    { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetaItem:{ fontSize: 13, fontWeight: "700" },
  heroMetaDot: { color: "#cbd5e1" },
  macrosRow:   { flexDirection: "row", marginHorizontal: 16, marginTop: 16, backgroundColor: "#f8fafc", borderRadius: 16, padding: 14 },
  macroItem:   { flex: 1, alignItems: "center", gap: 2 },
  macroVal:    { fontSize: 20, fontWeight: "900" },
  macroUnit:   { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  macroLabel:  { fontSize: 10, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" },
  section:     { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle:{ fontSize: 12, fontWeight: "800", color: "#6366f1", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  description: { fontSize: 14, color: "#475569", lineHeight: 22 },
  tagsRow:     { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginTop: 10 },
  tag:         { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText:     { fontSize: 12, fontWeight: "700" },
  listRow:     { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  bullet:      { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  stepRow:     { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  stepNum:     { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  stepNumTxt:  { color: "#fff", fontSize: 12, fontWeight: "800" },
  listText:    { flex: 1, fontSize: 14, color: "#334155", lineHeight: 21 },
  logBtn:      { marginHorizontal: 20, marginTop: 28, borderRadius: 16, paddingVertical: 16, alignItems: "center", shadowColor: "#6366f1", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  logBtnDone:  { shadowColor: "#10b981" },
  logBtnTxt:   { color: "#fff", fontWeight: "800", fontSize: 15 },
});
