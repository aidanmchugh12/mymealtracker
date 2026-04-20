import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import FoodItem from "./FoodItem";

const SearchSection = ({ search, onSearchChange, filtered, onAddFood }) => {
  return (
    <>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search foods..."
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange("")}
            activeOpacity={0.7}
          >
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionLabel}>Food Database</Text>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No foods found.</Text>
          <Text style={styles.emptySubText}>Try a different search term.</Text>
        </View>
      ) : (
        filtered.map((food) => (
          <FoodItem key={food.id} food={food} onAdd={onAddFood} />
        ))
      )}
    </>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1e1b4b",
  },
  clearSearch: {
    color: "#94a3b8",
    fontSize: 14,
    paddingLeft: 8,
  },
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
});

export default SearchSection;
