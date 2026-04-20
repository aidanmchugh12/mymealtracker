import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const FoodItem = ({ food, onAdd }) => (
  <View style={styles.foodCard}>
    <View style={styles.foodCardLeft}>
      <Text style={styles.foodName}>{food.name}</Text>
      <Text style={styles.foodMacros}>
        P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
      </Text>
    </View>
    <View style={styles.foodCardRight}>
      <Text style={styles.foodCalories}>{food.calories} kcal</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onAdd(food)}
        activeOpacity={0.75}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
});

export default FoodItem;
