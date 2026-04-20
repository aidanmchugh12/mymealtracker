import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LoggedItem from "./LoggedItem";

const LogSection = ({ loggedFoods, totalCalories, onRemove, onClearLog }) => {
  return (
    <>
      <Text style={styles.sectionLabel}>
        Today's Log · {loggedFoods.length} item
        {loggedFoods.length !== 1 ? "s" : ""}
      </Text>

      {loggedFoods.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No foods logged yet.</Text>
          <Text style={styles.emptySubText}>
            Search and add foods to get started.
          </Text>
        </View>
      ) : (
        <>
          {loggedFoods.map((food, i) => (
            <LoggedItem key={i} food={food} index={i} onRemove={onRemove} />
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalCalories}>{totalCalories} kcal</Text>
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearLog}
            activeOpacity={0.75}
          >
            <Text style={styles.clearButtonText}>Clear Log</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 4,
  },
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
});

export default LogSection;
