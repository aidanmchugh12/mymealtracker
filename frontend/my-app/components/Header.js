import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import CalorieRing from "./CalorieRing";
import MacroPill from "./MacroPill";

const Header = ({
  today,
  progress,
  totalCalories,
  remaining,
  isOver,
  totalProtein,
  totalCarbs,
  totalFat,
  dailyGoal,
  loggedFoodCount,
  showLog,
  onToggleLog,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.headerTitle}>Daily Calories</Text>
        </View>
        <TouchableOpacity
          style={styles.logToggle}
          onPress={onToggleLog}
          activeOpacity={0.75}
        >
          <Text style={styles.logToggleText}>
            {showLog ? "← Search" : `Log (${loggedFoodCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerStats}>
        <CalorieRing
          progress={progress}
          totalCalories={totalCalories}
          dailyGoal={dailyGoal}
        />

        <View style={styles.statsRight}>
          <Text style={styles.goalText}>
            Goal: <Text style={styles.goalBold}>{dailyGoal} kcal</Text>
          </Text>
          <Text style={[styles.remainingText, isOver && styles.remainingOver]}>
            {isOver ? `+${Math.abs(remaining)}` : remaining}
            <Text style={styles.remainingUnit}>
              {" "}
              kcal {isOver ? "over" : "left"}
            </Text>
          </Text>
          <View style={styles.macroRow}>
            <MacroPill
              label="Protein"
              value={totalProtein}
              unit="g"
              color="rgba(16,185,129,0.85)"
            />
            <MacroPill
              label="Carbs"
              value={totalCarbs}
              unit="g"
              color="rgba(245,158,11,0.85)"
            />
            <MacroPill
              label="Fat"
              value={totalFat}
              unit="g"
              color="rgba(239,68,68,0.85)"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default Header;
