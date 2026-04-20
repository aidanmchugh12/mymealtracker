import { View, Text, StyleSheet } from "react-native";

const MacroPill = ({ label, value, unit, color }) => (
  <View style={[styles.macroPill, { backgroundColor: color }]}>
    <Text style={styles.macroPillValue}>
      {Math.round(value)}
      {unit}
    </Text>
    <Text style={styles.macroPillLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
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
});

export default MacroPill;
