import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

const CalorieRing = ({ progress, totalCalories, dailyGoal }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = Math.min(progress / 100, 1) * circumference;
  const isOver = totalCalories > dailyGoal;

  return (
    <View style={styles.ringContainer}>
      <Svg width={128} height={128} viewBox="0 0 128 128">
        <Circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={10}
        />
        <Circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={isOver ? "#fbbf24" : "#fff"}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
        />
      </Svg>
      <View style={styles.ringTextContainer}>
        <Text style={styles.ringCalories}>{totalCalories}</Text>
        <Text style={styles.ringLabel}>consumed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default CalorieRing;
