import { useState } from "react";
import { View, ScrollView, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import Header from "./components/Header";
import SearchSection from "./components/SearchSection";
import LogSection from "./components/LogSection";

// Constants
import { FOOD_DATABASE, DAILY_GOAL, today } from "./constants/foodDatabase";

export default function CalorieTracker() {
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [showLog, setShowLog] = useState(false);

  // Calculations
  const totalCalories = loggedFoods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = loggedFoods.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = loggedFoods.reduce((sum, f) => sum + f.carbs, 0);
  const totalFat = loggedFoods.reduce((sum, f) => sum + f.fat, 0);

  const remaining = DAILY_GOAL - totalCalories;
  const progress = (totalCalories / DAILY_GOAL) * 100;
  const isOver = totalCalories > DAILY_GOAL;

  const filtered = FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Handlers
  const addFood = (food) => setLoggedFoods((prev) => [...prev, food]);
  const removeFood = (index) =>
    setLoggedFoods((prev) => prev.filter((_, i) => i !== index));
  const clearLog = () => setLoggedFoods([]);
  const toggleLog = () => setShowLog(!showLog);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header Component */}
      <Header
        today={today}
        progress={progress}
        totalCalories={totalCalories}
        remaining={remaining}
        isOver={isOver}
        totalProtein={totalProtein}
        totalCarbs={totalCarbs}
        totalFat={totalFat}
        dailyGoal={DAILY_GOAL}
        loggedFoodCount={loggedFoods.length}
        showLog={showLog}
        onToggleLog={toggleLog}
      />

      {/* Body Content */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!showLog ? (
          <SearchSection
            search={search}
            onSearchChange={setSearch}
            filtered={filtered}
            onAddFood={addFood}
          />
        ) : (
          <LogSection
            loggedFoods={loggedFoods}
            totalCalories={totalCalories}
            onRemove={removeFood}
            onClearLog={clearLog}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },

  // Header
  header: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  dateText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  logToggle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logToggleText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  // Ring
  ringContainer: {
    width: 128,
    height: 128,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ringTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringCalories: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
  },
  ringLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
  },

  // Stats
  statsRight: {
    flex: 1,
  },
  goalText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 4,
  },
  goalBold: {
    color: "#fff",
    fontWeight: "700",
  },
  remainingText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 30,
    marginBottom: 10,
  },
  remainingOver: {
    color: "#fbbf24",
  },
  remainingUnit: {
    fontSize: 13,
    fontWeight: "600",
  },
  macroRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  macroPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    minWidth: 58,
  },
  macroPillValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  macroPillLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // Body
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 4,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1e1b4b",
  },
  clearSearch: {
    color: "#94a3b8",
    fontSize: 14,
    paddingLeft: 8,
  },

  // Food card
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  foodCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e1b4b",
  },
  foodMacros: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 3,
  },
  foodCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  foodCalories: {
    fontWeight: "700",
    color: "#6366f1",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "400",
  },

  // Logged items
  loggedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(99,102,241,0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  loggedItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  loggedIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
  loggedIndexText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  loggedName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e1b4b",
    flex: 1,
  },
  loggedItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loggedCalories: {
    fontWeight: "700",
    color: "#6366f1",
    fontSize: 13,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    color: "#cbd5e1",
    fontSize: 14,
  },

  // Total row
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  totalLabel: {
    fontWeight: "800",
    color: "#1e1b4b",
    fontSize: 15,
  },
  totalCalories: {
    fontWeight: "900",
    fontSize: 18,
    color: "#6366f1",
  },

  // Clear button
  clearButton: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#fee2e2",
    borderRadius: 14,
    padding: 13,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  emptySubText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },
});
