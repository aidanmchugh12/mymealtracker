import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Mock leaderboard data ────────────────────────────────────────────────────
const YOU = {
  id: "you",
  name: "You",
  username: "me",
  emoji: "⭐",
  streak: 14,
  longestStreak: 21,
  daysLogged: 38,
  avgCalories: 1940,
  isYou: true,
};

const MOCK_FRIENDS = [
  { id: "1", name: "Sofia R.",  username: "fitgirl99",  emoji: "🧘", streak: 22, longestStreak: 30, daysLogged: 55, avgCalories: 1780 },
  { id: "2", name: "Mike T.",   username: "ironmike",   emoji: "💪", streak: 19, longestStreak: 45, daysLogged: 61, avgCalories: 2450 },
  { id: "3", name: "Amy L.",    username: "runneramy",  emoji: "🏃", streak: 14, longestStreak: 28, daysLogged: 42, avgCalories: 1620 },
  { id: "4", name: "Joe K.",    username: "healthjoe",  emoji: "🥦", streak: 7,  longestStreak: 14, daysLogged: 29, avgCalories: 2100 },
  { id: "5", name: "Dana W.",   username: "dana_eats",  emoji: "🥗", streak: 3,  longestStreak: 12, daysLogged: 18, avgCalories: 1850 },
];

const SORT_OPTIONS = ["Streak", "Longest", "Days Logged"];

// ─── Rank medal ───────────────────────────────────────────────────────────────
const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

function getRankColor(rank) {
  if (rank === 1) return "#f59e0b";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#cd7c3a";
  return "#6366f1";
}

// ─── Podium (top 3) ───────────────────────────────────────────────────────────
const PodiumCard = ({ entry, rank, isYou }) => {
  const heights = { 1: 100, 2: 78, 3: 62 };
  const order = { 1: 1, 2: 0, 3: 2 }; // visual order: 2nd, 1st, 3rd
  const color = getRankColor(rank);

  return (
    <View style={[styles.podiumItem, { order: order[rank] }]}>
      {rank === 1 && <Text style={styles.crownEmoji}>👑</Text>}
      <View style={[styles.podiumAvatar, isYou && styles.podiumAvatarYou, { borderColor: color }]}>
        <Text style={styles.podiumAvatarEmoji}>{entry.emoji}</Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {isYou ? "You" : entry.name.split(" ")[0]}
      </Text>
      <Text style={styles.podiumStreak}>🔥 {entry.streak}</Text>
      <View style={[styles.podiumBase, { height: heights[rank], backgroundColor: color + "22", borderColor: color + "55" }]}>
        <Text style={[styles.podiumRankNum, { color }]}>{MEDALS[rank] || `#${rank}`}</Text>
      </View>
    </View>
  );
};

// ─── List row ─────────────────────────────────────────────────────────────────
const LeaderRow = ({ entry, rank, sortKey, isYou }) => {
  const color = getRankColor(rank);
  const [expanded, setExpanded] = useState(false);

  const primaryVal = sortKey === "Streak"
    ? `🔥 ${entry.streak} day${entry.streak !== 1 ? "s" : ""}`
    : sortKey === "Longest"
    ? `🏆 ${entry.longestStreak} days`
    : `📅 ${entry.daysLogged} days`;

  return (
    <TouchableOpacity
      style={[styles.leaderRow, isYou && styles.leaderRowYou]}
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.75}
    >
      <View style={styles.leaderRowMain}>
        {/* Rank badge */}
        <View style={[styles.rankBadge, { backgroundColor: color + "18" }]}>
          <Text style={[styles.rankBadgeText, { color }]}>
            {MEDALS[rank] || `#${rank}`}
          </Text>
        </View>

        {/* Avatar */}
        <View style={[styles.leaderAvatar, isYou && styles.leaderAvatarYou]}>
          <Text style={styles.leaderAvatarEmoji}>{entry.emoji}</Text>
        </View>

        {/* Name + username */}
        <View style={styles.leaderInfo}>
          <Text style={[styles.leaderName, isYou && styles.leaderNameYou]}>
            {isYou ? "You" : entry.name}
            {isYou && <Text style={styles.youBadge}> • you</Text>}
          </Text>
          <Text style={styles.leaderUsername}>@{entry.username}</Text>
        </View>

        {/* Primary value */}
        <Text style={[styles.leaderPrimary, { color }]}>{primaryVal}</Text>

        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </View>

      {/* Expanded stats */}
      {expanded && (
        <View style={styles.leaderExpanded}>
          <StatPill label="Current streak" value={`🔥 ${entry.streak}d`} color="#f97316" />
          <StatPill label="Longest streak" value={`🏆 ${entry.longestStreak}d`} color="#f59e0b" />
          <StatPill label="Days logged" value={`📅 ${entry.daysLogged}`} color="#6366f1" />
          <StatPill label="Avg kcal" value={`⚡ ${entry.avgCalories}`} color="#10b981" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const StatPill = ({ label, value, color }) => (
  <View style={[styles.statPill, { borderColor: color + "40", backgroundColor: color + "10" }]}>
    <Text style={[styles.statPillVal, { color }]}>{value}</Text>
    <Text style={styles.statPillLabel}>{label}</Text>
  </View>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AchievementsPage({ user }) {
  const [sortKey, setSortKey] = useState("Streak");

  // Combine you + friends, sort
  const allEntries = [YOU, ...MOCK_FRIENDS];

  const sortedEntries = [...allEntries].sort((a, b) => {
    if (sortKey === "Streak") return b.streak - a.streak;
    if (sortKey === "Longest") return b.longestStreak - a.longestStreak;
    return b.daysLogged - a.daysLogged;
  });

  const top3 = sortedEntries.slice(0, 3);
  const rest = sortedEntries.slice(3);

  const yourRank = sortedEntries.findIndex((e) => e.isYou) + 1;
  const yourEntry = YOU;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />

      {/* ── Dark header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>FRIENDS LEAGUE</Text>
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
        <View style={styles.yourRankChip}>
          <Text style={styles.yourRankLabel}>Your rank</Text>
          <Text style={styles.yourRankNum}>#{yourRank}</Text>
        </View>
      </View>

      {/* ── Sort tabs ── */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortTab, sortKey === opt && styles.sortTabActive]}
            onPress={() => setSortKey(opt)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortTabText, sortKey === opt && styles.sortTabTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Podium ── */}
        <View style={styles.podiumSection}>
          <View style={styles.podiumRow}>
            {[2, 1, 3].map((rank) => {
              const entry = top3[rank - 1];
              if (!entry) return null;
              return (
                <PodiumCard
                  key={entry.id}
                  entry={entry}
                  rank={rank}
                  isYou={entry.isYou}
                />
              );
            })}
          </View>
        </View>

        {/* ── Your streak highlight (if not in top 3) ── */}
        {yourRank > 3 && (
          <View style={styles.yourStreakBanner}>
            <Text style={styles.yourStreakEmoji}>🔥</Text>
            <View style={styles.yourStreakText}>
              <Text style={styles.yourStreakTitle}>Your current streak</Text>
              <Text style={styles.yourStreakVal}>{yourEntry.streak} days</Text>
            </View>
            <Text style={styles.yourStreakMotivation}>
              {yourEntry.streak < top3[0]?.streak
                ? `${top3[0].streak - yourEntry.streak} days behind #1!`
                : "You're on top! 🎉"}
            </Text>
          </View>
        )}

        {/* ── Full ranked list ── */}
        <Text style={styles.listLabel}>ALL RANKINGS</Text>
        <View style={styles.listContainer}>
          {sortedEntries.map((entry, i) => (
            <LeaderRow
              key={entry.id}
              entry={entry}
              rank={i + 1}
              sortKey={sortKey}
              isYou={entry.isYou}
            />
          ))}
        </View>

        {/* ── Streak info card ── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔥 How streaks work</Text>
          <Text style={styles.infoBody}>
            Log your meals every day to keep your streak alive. Miss a day and it resets to zero. The leaderboard updates daily at midnight.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f0e1a" },

  // Header
  header: {
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerEyebrow: {
    color: "#6366f1",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  yourRankChip: {
    backgroundColor: "#6366f1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  yourRankLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "700" },
  yourRankNum: { color: "#fff", fontSize: 22, fontWeight: "900", lineHeight: 26 },

  // Sort
  sortRow: {
    flexDirection: "row",
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sortTabActive: { backgroundColor: "#6366f1" },
  sortTabText: { color: "#64748b", fontSize: 12, fontWeight: "700" },
  sortTabTextActive: { color: "#fff" },

  // Scroll
  scrollContent: { paddingBottom: 48 },

  // Podium
  podiumSection: {
    backgroundColor: "#1e1b4b",
    paddingBottom: 28,
    paddingTop: 8,
  },
  podiumRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    gap: 12,
  },
  podiumItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  crownEmoji: { fontSize: 22, marginBottom: -4 },
  podiumAvatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2.5,
    borderColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
  podiumAvatarYou: { borderColor: "#fbbf24", backgroundColor: "rgba(251,191,36,0.15)" },
  podiumAvatarEmoji: { fontSize: 24 },
  podiumName: { color: "#e2e8f0", fontSize: 12, fontWeight: "700", textAlign: "center" },
  podiumStreak: { color: "#fbbf24", fontSize: 12, fontWeight: "800" },
  podiumBase: {
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumRankNum: { fontSize: 22, paddingVertical: 8 },

  // Your streak banner
  yourStreakBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1b4b",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#f9731630",
  },
  yourStreakEmoji: { fontSize: 32 },
  yourStreakText: { flex: 1 },
  yourStreakTitle: { color: "#94a3b8", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  yourStreakVal: { color: "#fff", fontSize: 22, fontWeight: "900" },
  yourStreakMotivation: { color: "#f97316", fontSize: 11, fontWeight: "700", textAlign: "right", maxWidth: 80 },

  // List
  listLabel: {
    color: "#6366f1",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  listContainer: {
    marginHorizontal: 16,
    gap: 8,
  },

  // Leader row
  leaderRow: {
    backgroundColor: "#1e1b4b",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  leaderRowYou: {
    borderColor: "#fbbf24",
    backgroundColor: "#1e1b4b",
  },
  leaderRowMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: { fontSize: 16, fontWeight: "800" },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  leaderAvatarYou: { backgroundColor: "rgba(251,191,36,0.15)" },
  leaderAvatarEmoji: { fontSize: 20 },
  leaderInfo: { flex: 1 },
  leaderName: { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
  leaderNameYou: { color: "#fbbf24" },
  youBadge: { color: "#6366f1", fontSize: 11, fontWeight: "600" },
  leaderUsername: { color: "#475569", fontSize: 11, fontWeight: "500" },
  leaderPrimary: { fontSize: 13, fontWeight: "800" },
  chevron: { color: "#475569", fontSize: 10, marginLeft: 4 },

  // Expanded stats
  leaderExpanded: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  statPill: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: "45%",
    flex: 1,
  },
  statPillVal: { fontSize: 15, fontWeight: "800" },
  statPillLabel: { color: "#64748b", fontSize: 10, fontWeight: "600", marginTop: 2, textTransform: "uppercase" },

  // Info card
  infoCard: {
    backgroundColor: "#1e1b4b",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  infoTitle: { color: "#e2e8f0", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  infoBody: { color: "#64748b", fontSize: 13, lineHeight: 20 },
});
