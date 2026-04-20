import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const LoggedItem = ({ food, index, onRemove }) => (
  <View style={styles.loggedItem}>
    <View style={styles.loggedItemLeft}>
      <View style={styles.loggedIndex}>
        <Text style={styles.loggedIndexText}>{index + 1}</Text>
      </View>
      <Text style={styles.loggedName}>{food.name}</Text>
    </View>
    <View style={styles.loggedItemRight}>
      <Text style={styles.loggedCalories}>{food.calories} kcal</Text>
      <TouchableOpacity
        onPress={() => onRemove(index)}
        activeOpacity={0.6}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
});

export default LoggedItem;
