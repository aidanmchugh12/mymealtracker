import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "explore", label: "Explore", icon: "🔍" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "achievements", label: "Achievements", icon: "🏆" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text
            style={[styles.label, activeTab === tab.id && styles.activeLabel]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#6366f1",
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    textAlign: "center",
  },
  activeLabel: {
    color: "#6366f1",
  },
});

export default BottomNav;
