import { useState, useEffect, useCallback, useMemo } from "react";
import { View, ScrollView, StyleSheet, StatusBar, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import LogSection from "../components/LogSection";
import { FOOD_DATABASE, DAILY_GOAL } from "../constants/foodDatabase";
import { apiGet, apiPost, apiDelete } from "../utils/api";

export default function HomePage() {
  const { token } = useAuth();
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [search,      setSearch]      = useState("");
  const [showLog,     setShowLog]     = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    [],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // GETTER — GET /meals
  // DB table : meals
  // Fields   : id, foodName, calories, protein, carbs, fat, loggedDate
  // Notes    : Server filters by userId (from JWT) + today's date.
  // ─────────────────────────────────────────────────────────────────────────────
  const loadMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiGet(token, "/meals");
      if (result.success) {
        setLoggedFoods(result.data || []);
      } else {
        console.error("GET /meals failed:", result.error);
      }
    } catch (err) {
      console.error("GET /meals error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadMeals();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCalories = loggedFoods.reduce((sum, f) => sum + (f.calories ?? 0), 0);
  const totalProtein  = loggedFoods.reduce((sum, f) => sum + (f.protein  ?? 0), 0);
  const totalCarbs    = loggedFoods.reduce((sum, f) => sum + (f.carbs    ?? 0), 0);
  const totalFat      = loggedFoods.reduce((sum, f) => sum + (f.fat      ?? 0), 0);
  const remaining     = DAILY_GOAL - totalCalories;
  const progress      = (totalCalories / DAILY_GOAL) * 100;
  const isOver        = totalCalories > DAILY_GOAL;

  const filtered = FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SETTER — POST /meals
  // DB table : meals
  // Fields   : foodName, calories, protein, carbs, fat
  // Notes    : Server stamps userId + loggedDate, returns the full created row.
  // ─────────────────────────────────────────────────────────────────────────────
  const addFood = async (food) => {
    setIsLoading(true);
    try {
      const result = await apiPost(token, "/meals", {
        foodName: food.name,
        calories: food.calories,
        protein:  food.protein,
        carbs:    food.carbs,
        fat:      food.fat,
      });
      if (result.success) {
        setLoggedFoods((prev) => [...prev, result.data]);
        Alert.alert("Success", `${food.name} logged!`);
      } else {
        Alert.alert("Error", `Failed to log meal: ${result.error}`);
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred.");
      console.error("POST /meals error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SETTER — DELETE /meals/:id
  // DB table : meals
  // Fields   : id (primary key)
  // Notes    : Server verifies ownership before deleting.
  // ─────────────────────────────────────────────────────────────────────────────
  const removeFood = async (id) => {
    const meal = loggedFoods.find((f) => f.id === id);
    if (!meal?.id) {
      setLoggedFoods((prev) => prev.filter((f) => f.id !== id));
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiDelete(token, `/meals/${meal.id}`);
      if (result.success) {
        setLoggedFoods((prev) => prev.filter((f) => f.id !== id));
        Alert.alert("Success", "Meal removed!");
      } else {
        Alert.alert("Error", `Failed to remove meal: ${result.error}`);
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred.");
      console.error("DELETE /meals/:id error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SETTER — DELETE /meals/:id  (called in parallel for each meal)
  // DB table : meals
  // Notes    : No bulk-delete endpoint yet. If backend later adds
  //            DELETE /meals?date=today this loop can be replaced.
  // ─────────────────────────────────────────────────────────────────────────────
  const clearLog = async () => {
    Alert.alert("Clear Log", "Are you sure you want to remove all meals?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            const results = await Promise.all(
              loggedFoods
                .filter((meal) => meal.id)
                .map((meal) => apiDelete(token, `/meals/${meal.id}`)),
            );
            if (results.some((r) => !r.success)) {
              await loadMeals();
              Alert.alert("Error", "Some meals could not be deleted.");
            } else {
              setLoggedFoods([]);
              Alert.alert("Success", "All meals cleared!");
            }
          } catch (err) {
            await loadMeals();
            Alert.alert("Error", "An unexpected error occurred.");
            console.error("clearLog error:", err);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  if (isLoading && loggedFoods.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
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
        onToggleLog={() => setShowLog((prev) => !prev)}
      />
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
  safe:        { flex: 1, backgroundColor: "#eef2ff" },
  body:        { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 32 },
});
