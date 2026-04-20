import { useState } from "react";
import { View, ScrollView, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import LogSection from "../components/LogSection";

// Constants
import { FOOD_DATABASE, DAILY_GOAL, today } from "../constants/foodDatabase";

export default function HomePage() {
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
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
