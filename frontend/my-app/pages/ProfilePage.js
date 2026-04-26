import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

// ─── Mock friends data ────────────────────────────────────────────────────────
const MOCK_USER_LOOKUP = {
  fitgirl99: { name: "Sofia R.", emoji: "🧘" },
  ironmike: { name: "Mike T.", emoji: "💪" },
  healthjoe: { name: "Joe K.", emoji: "🥦" },
  runneramy: { name: "Amy L.", emoji: "🏃" },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

// ─── Editable row ─────────────────────────────────────────────────────────────
const EditRow = ({ label, value, unit, onSave, keyboardType = "numeric", icon }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const num = parseFloat(draft);
    if (!isNaN(num) && num > 0) onSave(num);
    else setDraft(String(value));
    setEditing(false);
  };

  return (
    <View style={styles.editRow}>
      <View style={styles.editRowLeft}>
        <Text style={styles.editRowIcon}>{icon}</Text>
        <Text style={styles.editRowLabel}>{label}</Text>
      </View>
      {editing ? (
        <View style={styles.editRowInputWrap}>
          <TextInput
            style={styles.editRowInput}
            value={draft}
            onChangeText={setDraft}
            keyboardType={keyboardType}
            autoFocus
            selectTextOnFocus
            onSubmitEditing={commit}
            onBlur={commit}
          />
          <Text style={styles.editRowUnit}>{unit}</Text>
          <TouchableOpacity style={styles.editRowSaveBtn} onPress={commit}>
            <Text style={styles.editRowSaveTxt}>✓</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editRowValueWrap} onPress={() => { setDraft(String(value)); setEditing(true); }}>
          <Text style={styles.editRowValue}>{value}</Text>
          <Text style={styles.editRowUnit}>{unit}</Text>
          <Text style={styles.editPencil}>✏️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ label, icon, value, onToggle }) => (
  <View style={[styles.editRow, { paddingVertical: 10 }]}>
    <View style={styles.editRowLeft}>
      <Text style={styles.editRowIcon}>{icon}</Text>
      <Text style={styles.editRowLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#e2e8f0", true: "#a5b4fc" }}
      thumbColor={value ? "#6366f1" : "#94a3b8"}
    />
  </View>
);

// ─── Friend chip ──────────────────────────────────────────────────────────────
const FriendChip = ({ friend, onRemove }) => (
  <View style={styles.friendChip}>
    <View style={styles.friendAvatar}>
      <Text style={styles.friendAvatarEmoji}>{friend.emoji}</Text>
    </View>
    <View style={styles.friendInfo}>
      <Text style={styles.friendName}>{friend.name}</Text>
      <Text style={styles.friendUsername}>@{friend.username}</Text>
    </View>
    <TouchableOpacity onPress={onRemove} style={styles.friendRemoveBtn} activeOpacity={0.7}>
      <Text style={styles.friendRemoveTxt}>✕</Text>
    </TouchableOpacity>
  </View>
);

// ─── Macro split bar ──────────────────────────────────────────────────────────
function MacroSplitBar({ protein, carbs, fat }) {
  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatCal = fat * 9;
  const total = proteinCal + carbsCal + fatCal || 1;

  const pPct = (proteinCal / total) * 100;
  const cPct = (carbsCal / total) * 100;
  const fPct = (fatCal / total) * 100;

  return (
    <View style={styles.splitBarTrack}>
      <View style={[styles.splitBarSeg, { flex: pPct, backgroundColor: "#10b981" }]} />
      <View style={[styles.splitBarSeg, { flex: cPct, backgroundColor: "#f59e0b" }]} />
      <View style={[styles.splitBarSeg, { flex: fPct, backgroundColor: "#ef4444" }]} />
    </View>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage({ user, onSignOut }) {
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  // ── Goals state ──
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    water: 8,
  });

  // ── Body stats state ──
  const [stats, setStats] = useState({
    weight: 170,
    height: 68,
    age: 28,
    targetWeight: 155,
  });

  // ── Preferences ──
  const [prefs, setPrefs] = useState({
    notifications: true,
    weeklyReport: true,
    imperialUnits: true,
  });

  // ── Friends ──
  const [friends, setFriends] = useState([
    { username: "fitgirl99", name: "Sofia R.", emoji: "🧘" },
    { username: "ironmike", name: "Mike T.", emoji: "💪" },
  ]);
  const [friendInput, setFriendInput] = useState("");
  const [friendError, setFriendError] = useState("");
  const [friendSuccess, setFriendSuccess] = useState("");

  const setGoal = (key, val) => setGoals((g) => ({ ...g, [key]: val }));
  const setStat = (key, val) => setStats((s) => ({ ...s, [key]: val }));

  const bmi = (() => {
    const h = stats.height;
    const w = stats.weight;
    if (!h || !w) return null;
    return ((w / (h * h)) * 703).toFixed(1);
  })();

  const bmiLabel = (b) => {
    if (b < 18.5) return { label: "Underweight", color: "#38bdf8" };
    if (b < 25) return { label: "Normal", color: "#10b981" };
    if (b < 30) return { label: "Overweight", color: "#f59e0b" };
    return { label: "Obese", color: "#ef4444" };
  };

  const bmiInfo = bmi ? bmiLabel(parseFloat(bmi)) : null;

  const handleAddFriend = () => {
    setFriendError("");
    setFriendSuccess("");
    const username = friendInput.trim().toLowerCase();
    if (!username) return;

    if (friends.find((f) => f.username === username)) {
      setFriendError("Already in your friends list.");
      return;
    }
    const found = MOCK_USER_LOOKUP[username];
    if (!found) {
      setFriendError(`No user found for "@${username}".`);
      return;
    }
    setFriends((prev) => [...prev, { username, ...found }]);
    setFriendSuccess(`${found.name} added!`);
    setFriendInput("");
    setTimeout(() => setFriendSuccess(""), 2500);
  };

  const removeFriend = (username) => {
    Alert.alert("Remove Friend", `Remove @${username}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setFriends((prev) => prev.filter((f) => f.username !== username)),
      },
    ]);
  };

  const weightToGo = stats.weight - stats.targetWeight;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero header ── */}
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{displayEmail}</Text>

          {/* Quick stats strip */}
          <View style={styles.heroStrip}>
            <View style={styles.heroStripItem}>
              <Text style={styles.heroStripVal}>{stats.weight}</Text>
              <Text style={styles.heroStripLabel}>lbs</Text>
            </View>
            <View style={styles.heroStripDivider} />
            <View style={styles.heroStripItem}>
              <Text style={styles.heroStripVal}>{goals.calories}</Text>
              <Text style={styles.heroStripLabel}>kcal goal</Text>
            </View>
            <View style={styles.heroStripDivider} />
            <View style={styles.heroStripItem}>
              <Text style={styles.heroStripVal}>{friends.length}</Text>
              <Text style={styles.heroStripLabel}>friends</Text>
            </View>
          </View>
        </View>

        {/* ── Body Stats ── */}
        <Section title="📊 Body Stats">
          <EditRow label="Weight" value={stats.weight} unit="lbs" icon="⚖️" onSave={(v) => setStat("weight", v)} />
          <View style={styles.rowDivider} />
          <EditRow label="Height" value={stats.height} unit="in" icon="📏" onSave={(v) => setStat("height", v)} />
          <View style={styles.rowDivider} />
          <EditRow label="Age" value={stats.age} unit="yrs" icon="🎂" onSave={(v) => setStat("age", v)} />
          <View style={styles.rowDivider} />
          <EditRow label="Target Weight" value={stats.targetWeight} unit="lbs" icon="🎯" onSave={(v) => setStat("targetWeight", v)} />

          {bmi && (
            <View style={styles.bmiRow}>
              <View style={styles.bmiBlock}>
                <Text style={styles.bmiVal}>{bmi}</Text>
                <Text style={[styles.bmiLabel, { color: bmiInfo.color }]}>{bmiInfo.label}</Text>
                <Text style={styles.bmiCaption}>BMI</Text>
              </View>
              <View style={styles.bmiBlock}>
                <Text style={[styles.bmiVal, { color: weightToGo > 0 ? "#f59e0b" : "#10b981" }]}>
                  {weightToGo > 0 ? `-${weightToGo}` : `+${Math.abs(weightToGo)}`}
                </Text>
                <Text style={styles.bmiCaption}>lbs to goal</Text>
              </View>
            </View>
          )}
        </Section>

        {/* ── Daily Goals ── */}
        <Section title="🎯 Daily Goals">
          <EditRow label="Calories" value={goals.calories} unit="kcal" icon="🔥" onSave={(v) => setGoal("calories", v)} />
          <View style={styles.rowDivider} />
          <EditRow label="Protein" value={goals.protein} unit="g" icon="🥩" onSave={(v) => setGoal("protein", v)} />
          <View style={styles.rowDivider} />
          <EditRow label="Carbohydrates" value={goals.carbs} unit="g" icon="🍞" onSave={(v) => setGoal("carbs", v)} />
          <View style={styles.rowDivider} />
          <EditRow label="Fat" value={goals.fat} unit="g" icon="🥑" onSave={(v) => setGoal("fat", v)} />
          <View style={styles.rowDivider} />
          <EditRow label="Water" value={goals.water} unit="glasses" icon="💧" onSave={(v) => setGoal("water", v)} />

          {/* Macro breakdown bar */}
          <View style={styles.macroBar}>
            <View style={styles.macroBarLabel}>
              <Text style={styles.macroBarCaption}>Macro split</Text>
            </View>
            <MacroSplitBar protein={goals.protein} carbs={goals.carbs} fat={goals.fat} />
            <View style={styles.macroLegend}>
              {[
                { label: "Protein", color: "#10b981" },
                { label: "Carbs", color: "#f59e0b" },
                { label: "Fat", color: "#ef4444" },
              ].map((m) => (
                <View key={m.label} style={styles.macroLegendItem}>
                  <View style={[styles.macroLegendDot, { backgroundColor: m.color }]} />
                  <Text style={styles.macroLegendLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Section>

        {/* ── Preferences ── */}
        <Section title="⚙️ Preferences">
          <ToggleRow
            label="Push Notifications"
            icon="🔔"
            value={prefs.notifications}
            onToggle={(v) => setPrefs((p) => ({ ...p, notifications: v }))}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Weekly Summary Email"
            icon="📧"
            value={prefs.weeklyReport}
            onToggle={(v) => setPrefs((p) => ({ ...p, weeklyReport: v }))}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Imperial Units (lbs/in)"
            icon="🇺🇸"
            value={prefs.imperialUnits}
            onToggle={(v) => setPrefs((p) => ({ ...p, imperialUnits: v }))}
          />
        </Section>

        {/* ── Friends ── */}
        <Section title={`👥 Friends (${friends.length})`}>
          <View style={styles.friendInputRow}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={styles.friendInput}
              placeholder="username"
              placeholderTextColor="#94a3b8"
              value={friendInput}
              onChangeText={(t) => { setFriendInput(t); setFriendError(""); setFriendSuccess(""); }}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleAddFriend}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.friendAddBtn} onPress={handleAddFriend} activeOpacity={0.8}>
              <Text style={styles.friendAddBtnTxt}>Add</Text>
            </TouchableOpacity>
          </View>

          {friendError ? <Text style={styles.friendError}>⚠ {friendError}</Text> : null}
          {friendSuccess ? <Text style={styles.friendSuccess}>✓ {friendSuccess}</Text> : null}

          <Text style={styles.friendHint}>
            Try: fitgirl99, ironmike, healthjoe, runneramy
          </Text>

          {friends.length === 0 ? (
            <View style={styles.friendEmpty}>
              <Text style={styles.friendEmptyIcon}>🤝</Text>
              <Text style={styles.friendEmptyText}>No friends added yet</Text>
            </View>
          ) : (
            <View style={styles.friendList}>
              {friends.map((f) => (
                <FriendChip
                  key={f.username}
                  friend={f}
                  onRemove={() => removeFriend(f.username)}
                />
              ))}
            </View>
          )}
        </Section>

        {/* ── Sign out ── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: onSignOut },
            ]);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>NutriTrack v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef2ff" },
  scrollContent: { paddingBottom: 48 },

  // Hero
  hero: {
    backgroundColor: "#6366f1",
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 3,
  },
  heroEmail: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginBottom: 20,
  },
  heroStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: "100%",
    justifyContent: "space-around",
  },
  heroStripItem: { alignItems: "center", flex: 1 },
  heroStripVal: { color: "#fff", fontSize: 20, fontWeight: "900" },
  heroStripLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: "600", marginTop: 2 },
  heroStripDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.25)" },

  // Section
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Edit row
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  editRowLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  editRowIcon: { fontSize: 18, width: 26, textAlign: "center" },
  editRowLabel: { fontSize: 14, fontWeight: "600", color: "#334155" },
  editRowValueWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  editRowValue: { fontSize: 16, fontWeight: "800", color: "#6366f1" },
  editRowUnit: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  editPencil: { fontSize: 12, marginLeft: 2 },
  editRowInputWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  editRowInput: {
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: "800",
    color: "#6366f1",
    minWidth: 60,
    textAlign: "right",
    borderWidth: 1.5,
    borderColor: "#a5b4fc",
  },
  editRowSaveBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  editRowSaveTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },
  rowDivider: { height: 1, backgroundColor: "#f1f5f9", marginLeft: 36 },

  // BMI
  bmiRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 10,
    gap: 12,
  },
  bmiBlock: { flex: 1, alignItems: "center", gap: 2 },
  bmiVal: { fontSize: 26, fontWeight: "900", color: "#1e1b4b" },
  bmiLabel: { fontSize: 12, fontWeight: "700" },
  bmiCaption: { fontSize: 11, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" },

  // Macro bar
  macroBar: { paddingVertical: 14 },
  macroBarLabel: { marginBottom: 6 },
  macroBarCaption: { fontSize: 11, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  splitBarTrack: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    gap: 1,
  },
  splitBarSeg: { height: "100%" },
  macroLegend: { flexDirection: "row", gap: 14, marginTop: 8 },
  macroLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  macroLegendDot: { width: 8, height: 8, borderRadius: 4 },
  macroLegendLabel: { fontSize: 11, color: "#64748b", fontWeight: "600" },

  // Friends
  friendInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    marginVertical: 10,
    gap: 4,
  },
  atSign: { fontSize: 16, fontWeight: "800", color: "#6366f1" },
  friendInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1e1b4b",
  },
  friendAddBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  friendAddBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  friendError: { color: "#ef4444", fontSize: 12, fontWeight: "600", marginBottom: 6, marginLeft: 4 },
  friendSuccess: { color: "#10b981", fontSize: 12, fontWeight: "700", marginBottom: 6, marginLeft: 4 },
  friendHint: { fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginBottom: 10, marginLeft: 2 },
  friendList: { gap: 8, paddingBottom: 8 },
  friendChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarEmoji: { fontSize: 20 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 14, fontWeight: "700", color: "#1e1b4b" },
  friendUsername: { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  friendRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  friendRemoveTxt: { color: "#ef4444", fontSize: 12, fontWeight: "700" },
  friendEmpty: { alignItems: "center", paddingVertical: 24, gap: 8 },
  friendEmptyIcon: { fontSize: 32 },
  friendEmptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },

  // Sign out
  signOutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
  },
  signOutTxt: { color: "#ef4444", fontWeight: "800", fontSize: 15 },

  versionText: {
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: 11,
    marginTop: 16,
    fontWeight: "500",
  },
});
