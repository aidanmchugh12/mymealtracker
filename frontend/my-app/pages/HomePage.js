import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, StatusBar, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Auth
import { useAuth } from "../context/AuthContext";

// Components
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import LogSection from "../components/LogSection";

// Constants
import { FOOD_DATABASE, DAILY_GOAL, today } from "../constants/foodDatabase";

// Utilities
import { apiGet, apiPost, apiDelete } from "../utils/api";

export default function HomePage() {
  const { token } = useAuth();
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load meals from backend on component mount
  useEffect(() => {
    if (token) {
      loadMealsFromBackend();
    }
  }, [token]);

  // Load meals from backend
  const loadMealsFromBackend = async () => {
    setIsLoading(true);
    const result = await apiGet(token, '/meals');
    if (result.success) {
      setLoggedFoods(result.data || []);
    } else {
      console.error('Failed to load meals:', result.error);
    }
    setIsLoading(false);
  };

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
  const addFood = async (food) => {
    setIsLoading(true);
    const mealData = {
      foodName: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    };

    const result = await apiPost(token, '/meals', mealData);
    if (result.success) {
      setLoggedFoods((prev) => [...prev, result.data]);
      Alert.alert('Success', `${food.name} logged!`);
    } else {
      Alert.alert('Error', `Failed to log meal: ${result.error}`);
    }
    setIsLoading(false);
  };

  const removeFood = async (index) => {
    const meal = loggedFoods[index];
    if (!meal || !meal.id) {
      setLoggedFoods((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setIsLoading(true);
    const result = await apiDelete(token, `/meals/${meal.id}`);
    if (result.success) {
      setLoggedFoods((prev) => prev.filter((_, i) => i !== index));
      Alert.alert('Success', 'Meal removed!');
    } else {
      Alert.alert('Error', `Failed to remove meal: ${result.error}`);
    }
    setIsLoading(false);
  };

  const clearLog = async () => {
    Alert.alert(
      'Clear Log',
      'Are you sure you want to remove all meals?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            setIsLoading(true);
            // Delete all meals in parallel
            const deletePromises = loggedFoods.map((meal) =>
              apiDelete(token, `/meals/${meal.id}`)
            );
            await Promise.all(deletePromises);
            setLoggedFoods([]);
            setIsLoading(false);
            Alert.alert('Success', 'All meals cleared!');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleLog = () => setShowLog(!showLog);

  if (isLoading && loggedFoods.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

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
