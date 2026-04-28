import { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../utils/api";

const SORT_OPTIONS = ["Streak", "Longest", "Days Logged"];
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
  const order   = { 1: 1, 2: 0, 3: 2 };
  const color   = getRankColor(rank);
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
        <View style={[styles.rankBadge, { backgroundColor: color + "18" }]}>
          <Text style={[styles.rankBadgeText, { color }]}>{MEDALS[rank] || `#${rank}`}</Text>
        </View>
        <View style={[styles.leaderAvatar, isYou && styles.leaderAvatarYou]}>
          <Text style={styles.leaderAvatarEmoji}>{entry.emoji}</Text>
        </View>
        <View style={styles.leaderInfo}>
          <Text style={[styles.leaderName, isYou && styles.leaderNameYou]}>
            {isYou ? "You" : entry.name}
            {isYou && <Text style={styles.youBadge}> • you</Text>}
          </Text>
          <Text style={styles.leaderUsername}>@{entry.username}</Text>
        </View>
        <Text style={[styles.leaderPrimary, { color }]}>{primaryVal}</Text>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </View>
      {expanded && (
        <View style={styles.leaderExpanded}>
          <StatPill label="Current streak" value={`🔥 ${entry.streak}d`}        color="#f97316" />
          <StatPill label="Longest streak" value={`🏆 ${entry.longestStreak}d`}  color="#f59e0b" />
          <StatPill label="Days logged"    value={`📅 ${entry.daysLogged}`}      color="#6366f1" />
          <StatPill label="Avg kcal"       value={`⚡ ${entry.avgCalories}`}     color="#10b981" />
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
export default function AchievementsPage() {
  const { token } = useAuth();
  const [sortKey,     setSortKey]     = useState("Streak");
  const [isLoading,   setIsLoading]   = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [yourStats,   setYourStats]   = useState(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // GETTER — GET /leaderboard
  // DB table : streaks joined with users + friendships
  // Fields   : userId, name, username, emoji, streak, longestStreak,
  //            daysLogged, avgCalories, isYou
  // Notes    : Server returns current user + all friends ranked. isYou is set
  //            server-side based on the JWT. Sorting stays client-side.
  // ─────────────────────────────────────────────────────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    const result = await apiGet(token, "/leaderboard");
    if (result.success) {
      const data = result.data || [];
      setLeaderboard(data);
      const me = data.find((e) => e.isYou);
      if (me) setYourStats(me);
    } else {
      console.error("GET /leaderboard failed:", result.error);
    }
    setIsLoading(false);
  }, [token]);

  // ─────────────────────────────────────────────────────────────────────────────
  // GETTER — GET /streaks/me
  // DB table : streaks
  // Fields   : currentStreak, longestStreak, daysLogged, avgCalories
  // Notes    : Only called if GET /leaderboard doesn't already include your
  //            entry with isYou=true. Merges into yourStats.
  // ─────────────────────────────────────────────────────────────────────────────
  const loadMyStreak = useCallback(async () => {
    const result = await apiGet(token, "/streaks/me");
    if (result.success && result.data) {
      setYourStats((prev) => ({ ...prev, ...result.data }));
    } else {
      console.error("GET /streaks/me failed:", result.error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadLeaderboard();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedEntries = [...leaderboard].sort((a, b) => {
    if (sortKey === "Streak")  return b.streak        - a.streak;
    if (sortKey === "Longest") return b.longestStreak - a.longestStreak;
    return b.daysLogged - a.daysLogged;
  });

  const top3     = sortedEntries.slice(0, 3);
  const yourRank = sortedEntries.findIndex((e) => e.isYou) + 1;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>FRIENDS LEAGUE</Text>
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
        <View style={styles.yourRankChip}>
          <Text style={styles.yourRankLabel}>Your rank</Text>
          <Text style={styles.yourRankNum}>#{yourRank || "—"}</Text>
        </View>
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortTab, sortKey === opt && styles.sortTabActive]}
            onPress={() => setSortKey(opt)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortTabText, sortKey === opt && styles.sortTabTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Podium ── */}
        <View style={styles.podiumSection}>
          <View style={styles.podiumRow}>
            {[2, 1, 3].map((rank) => {
              const entry = top3[rank - 1];
              if (!entry) return null;
              return <PodiumCard key={entry.id} entry={entry} rank={rank} isYou={entry.isYou} />;
            })}
          </View>
        </View>

        {/* ── Your streak banner (if outside top 3) ── */}
        {yourRank > 3 && yourStats && (
          <View style={styles.yourStreakBanner}>
            <Text style={styles.yourStreakEmoji}>🔥</Text>
            <View style={styles.yourStreakText}>
              <Text style={styles.yourStreakTitle}>Your current streak</Text>
              <Text style={styles.yourStreakVal}>{yourStats.streak} days</Text>
            </View>
            <Text style={styles.yourStreakMotivation}>
              {yourStats.streak < top3[0]?.streak
                ? `${top3[0].streak - yourStats.streak} days behind #1!`
                : "You're on top! 🎉"}
            </Text>
          </View>
        )}

        {/* ── Full ranked list ── */}
        <Text style={styles.listLabel}>ALL RANKINGS</Text>
        <View style={styles.listContainer}>
          {sortedEntries.map((entry, i) => (
            <LeaderRow key={entry.id} entry={entry} rank={i + 1} sortKey={sortKey} isYou={entry.isYou} />
          ))}
        </View>

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

  header:        { backgroundColor: "#1e1b4b", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerEyebrow: { color: "#6366f1", fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  headerTitle:   { color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  yourRankChip:  { backgroundColor: "#6366f1", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" },
  yourRankLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "700" },
  yourRankNum:   { color: "#fff", fontSize: 22, fontWeight: "900", lineHeight: 26 },

  sortRow:          { flexDirection: "row", backgroundColor: "#1e1b4b", paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  sortTab:          { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  sortTabActive:    { backgroundColor: "#6366f1" },
  sortTabText:      { color: "#64748b", fontSize: 12, fontWeight: "700" },
  sortTabTextActive:{ color: "#fff" },

  scrollContent: { paddingBottom: 48 },

  podiumSection: { backgroundColor: "#1e1b4b", paddingBottom: 28, paddingTop: 8 },
  podiumRow:     { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 24, gap: 12 },
  podiumItem:    { flex: 1, alignItems: "center", gap: 6 },
  crownEmoji:    { fontSize: 22, marginBottom: -4 },
  podiumAvatar:  { width: 54, height: 54, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 2.5, borderColor: "#6366f1", alignItems: "center", justifyContent: "center" },
  podiumAvatarYou:  { borderColor: "#fbbf24", backgroundColor: "rgba(251,191,36,0.15)" },
  podiumAvatarEmoji:{ fontSize: 24 },
  podiumName:    { color: "#e2e8f0", fontSize: 12, fontWeight: "700", textAlign: "center" },
  podiumStreak:  { color: "#fbbf24", fontSize: 12, fontWeight: "800" },
  podiumBase:    { width: "100%", borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  podiumRankNum: { fontSize: 22, paddingVertical: 8 },

  yourStreakBanner:    { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1b4b", marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: "#f9731630" },
  yourStreakEmoji:     { fontSize: 32 },
  yourStreakText:      { flex: 1 },
  yourStreakTitle:     { color: "#94a3b8", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  yourStreakVal:       { color: "#fff", fontSize: 22, fontWeight: "900" },
  yourStreakMotivation:{ color: "#f97316", fontSize: 11, fontWeight: "700", textAlign: "right", maxWidth: 80 },

  listLabel:     { color: "#6366f1", fontSize: 10, fontWeight: "800", letterSpacing: 2, marginTop: 24, marginBottom: 10, marginHorizontal: 20 },
  listContainer: { marginHorizontal: 16, gap: 8 },

  leaderRow:     { backgroundColor: "#1e1b4b", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  leaderRowYou:  { borderColor: "#fbbf24" },
  leaderRowMain: { flexDirection: "row", alignItems: "center", gap: 10 },
  rankBadge:     { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rankBadgeText: { fontSize: 16, fontWeight: "800" },
  leaderAvatar:     { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  leaderAvatarYou:  { backgroundColor: "rgba(251,191,36,0.15)" },
  leaderAvatarEmoji:{ fontSize: 20 },
  leaderInfo:       { flex: 1 },
  leaderName:       { color: "#e2e8f0", fontSize: 14, fontWeight: "700" },
  leaderNameYou:    { color: "#fbbf24" },
  youBadge:         { color: "#6366f1", fontSize: 11, fontWeight: "600" },
  leaderUsername:   { color: "#475569", fontSize: 11, fontWeight: "500" },
  leaderPrimary:    { fontSize: 13, fontWeight: "800" },
  chevron:          { color: "#475569", fontSize: 10, marginLeft: 4 },

  leaderExpanded: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  statPill:       { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", minWidth: "45%", flex: 1 },
  statPillVal:    { fontSize: 15, fontWeight: "800" },
  statPillLabel:  { color: "#64748b", fontSize: 10, fontWeight: "600", marginTop: 2, textTransform: "uppercase" },

  infoCard:  { backgroundColor: "#1e1b4b", borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 20, borderWidth: 1, borderColor: "rgba(99,102,241,0.3)" },
  infoTitle: { color: "#e2e8f0", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  infoBody:  { color: "#64748b", fontSize: 13, lineHeight: 20 },
});
