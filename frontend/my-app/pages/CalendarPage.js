import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Mock data ──────────────────────────────────────────────────────────────
const DAILY_GOAL = 2000;

function makeMockData() {
  const data = {};
  const now = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = toKey(d);
    const rand = Math.random();
    if (rand > 0.15) {
      // ~85% of days have data
      const calories = Math.floor(1200 + Math.random() * 1400);
      data[key] = {
        calories,
        protein: Math.floor(60 + Math.random() * 100),
        carbs: Math.floor(100 + Math.random() * 200),
        fat: Math.floor(30 + Math.random() * 80),
      };
    }
  }
  return data;
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const MOCK_DATA = makeMockData();

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getWeekDates(anchor) {
  // Returns the 7 dates of the week containing `anchor` (Sun–Sat)
  const d = new Date(anchor);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    return day;
  });
}

function getMonthDates(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Pad leading empty slots
  const cells = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function calorieFill(calories) {
  if (!calories) return 0;
  return Math.min(calories / DAILY_GOAL, 1);
}

function statusColor(calories) {
  if (!calories) return "#e2e8f0";
  const pct = calories / DAILY_GOAL;
  if (pct < 0.7) return "#38bdf8";   // under — light blue
  if (pct <= 1.0) return "#6366f1";  // on track — indigo
  if (pct <= 1.15) return "#f59e0b"; // slightly over — amber
  return "#ef4444";                  // over — red
}

function statusLabel(calories) {
  if (!calories) return "No data";
  const pct = calories / DAILY_GOAL;
  if (pct < 0.7) return "Under";
  if (pct <= 1.0) return "On track";
  if (pct <= 1.15) return "Slightly over";
  return "Over";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const CalorieDot = ({ calories, size = 8 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: statusColor(calories),
    }}
  />
);

const WeekBar = ({ date, isToday, isSelected, onPress }) => {
  const key = toKey(date);
  const entry = MOCK_DATA[key];
  const calories = entry?.calories;
  const fill = calorieFill(calories);
  const color = statusColor(calories);

  return (
    <TouchableOpacity
      style={[styles.weekBarWrapper, isSelected && styles.weekBarSelected]}
      onPress={() => onPress(date)}
      activeOpacity={0.75}
    >
      <Text style={[styles.weekDayLabel, isToday && styles.todayLabel]}>
        {DAY_LABELS[date.getDay()]}
      </Text>
      <Text style={[styles.weekDateNum, isToday && styles.todayDateNum]}>
        {date.getDate()}
      </Text>

      {/* Bar track */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { height: `${Math.max(fill * 100, 4)}%`, backgroundColor: color },
          ]}
        />
      </View>

      <Text style={[styles.weekCalText, { color }]}>
        {calories ? `${calories}` : "—"}
      </Text>
    </TouchableOpacity>
  );
};

const MonthCell = ({ date, isToday, isSelected, onPress }) => {
  if (!date) return <View style={styles.monthCellEmpty} />;

  const key = toKey(date);
  const entry = MOCK_DATA[key];
  const calories = entry?.calories;
  const color = statusColor(calories);

  return (
    <TouchableOpacity
      style={[
        styles.monthCell,
        isSelected && { borderColor: "#6366f1", borderWidth: 2 },
        isToday && styles.monthCellToday,
      ]}
      onPress={() => onPress(date)}
      activeOpacity={0.75}
    >
      <Text
        style={[
          styles.monthCellNum,
          isToday && styles.monthCellNumToday,
        ]}
      >
        {date.getDate()}
      </Text>
      {calories ? (
        <CalorieDot calories={calories} size={6} />
      ) : (
        <View style={{ width: 6, height: 6 }} />
      )}
    </TouchableOpacity>
  );
};

const DayDetail = ({ date }) => {
  const key = toKey(date);
  const entry = MOCK_DATA[key];
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const label = isToday
    ? "Today"
    : date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailDateLabel}>{label}</Text>
        {entry && (
          <View
            style={[
              styles.detailStatusBadge,
              { backgroundColor: statusColor(entry.calories) + "22" },
            ]}
          >
            <Text
              style={[
                styles.detailStatusText,
                { color: statusColor(entry.calories) },
              ]}
            >
              {statusLabel(entry.calories)}
            </Text>
          </View>
        )}
      </View>

      {entry ? (
        <>
          <View style={styles.detailCalRow}>
            <Text style={styles.detailCalNum}>{entry.calories}</Text>
            <Text style={styles.detailCalUnit}> / {DAILY_GOAL} kcal</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.detailProgressTrack}>
            <View
              style={[
                styles.detailProgressFill,
                {
                  width: `${Math.min(calorieFill(entry.calories) * 100, 100)}%`,
                  backgroundColor: statusColor(entry.calories),
                },
              ]}
            />
          </View>

          <View style={styles.detailMacroRow}>
            {[
              { label: "Protein", value: entry.protein, color: "#10b981" },
              { label: "Carbs", value: entry.carbs, color: "#f59e0b" },
              { label: "Fat", value: entry.fat, color: "#ef4444" },
            ].map((m) => (
              <View key={m.label} style={styles.detailMacroItem}>
                <View
                  style={[styles.detailMacroDot, { backgroundColor: m.color }]}
                />
                <Text style={styles.detailMacroVal}>{m.value}g</Text>
                <Text style={styles.detailMacroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.detailEmpty}>
          <Text style={styles.detailEmptyIcon}>📭</Text>
          <Text style={styles.detailEmptyText}>No data logged for this day</Text>
        </View>
      )}
    </View>
  );
};

// ─── Legend ──────────────────────────────────────────────────────────────────
const Legend = () => (
  <View style={styles.legendRow}>
    {[
      { color: "#38bdf8", label: "Under" },
      { color: "#6366f1", label: "On track" },
      { color: "#f59e0b", label: "Slightly over" },
      { color: "#ef4444", label: "Over" },
      { color: "#e2e8f0", label: "No data" },
    ].map((item) => (
      <View key={item.label} style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
        <Text style={styles.legendLabel}>{item.label}</Text>
      </View>
    ))}
  </View>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState("month"); // "week" | "month"
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [monthYear, setMonthYear] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const weekDates = getWeekDates(weekAnchor);
  const monthCells = getMonthDates(monthYear.year, monthYear.month);

  const shiftWeek = (dir) => {
    const next = new Date(weekAnchor);
    next.setDate(weekAnchor.getDate() + dir * 7);
    setWeekAnchor(next);
  };

  const shiftMonth = (dir) => {
    setMonthYear((prev) => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0) { m = 11; y--; }
      return { year: y, month: m };
    });
  };

  const isToday = (date) =>
    date &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isSelected = (date) =>
    date &&
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Calendar</Text>
        <Text style={styles.pageSubtitle}>Your nutrition history</Text>

        {/* View toggle */}
        <View style={styles.viewToggle}>
          {["week", "month"].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.toggleBtn, view === v && styles.toggleBtnActive]}
              onPress={() => setView(v)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  view === v && styles.toggleBtnTextActive,
                ]}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── WEEK VIEW ── */}
        {view === "week" && (
          <View style={styles.card}>
            {/* Week nav */}
            <View style={styles.navRow}>
              <TouchableOpacity onPress={() => shiftWeek(-1)} style={styles.navBtn}>
                <Text style={styles.navBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.navTitle}>
                {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" – "}
                {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
              <TouchableOpacity
                onPress={() => shiftWeek(1)}
                style={styles.navBtn}
                disabled={weekDates[6] >= today}
              >
                <Text
                  style={[
                    styles.navBtnText,
                    weekDates[6] >= today && styles.navBtnDisabled,
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bars */}
            <View style={styles.weekBarsRow}>
              {weekDates.map((d, i) => (
                <WeekBar
                  key={i}
                  date={d}
                  isToday={isToday(d)}
                  isSelected={isSelected(d)}
                  onPress={setSelectedDate}
                />
              ))}
            </View>

            {/* Goal line label */}
            <View style={styles.goalLineRow}>
              <View style={styles.goalLineDash} />
              <Text style={styles.goalLineLabel}>Goal {DAILY_GOAL} kcal</Text>
            </View>
          </View>
        )}

        {/* ── MONTH VIEW ── */}
        {view === "month" && (
          <View style={styles.card}>
            {/* Month nav */}
            <View style={styles.navRow}>
              <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.navBtn}>
                <Text style={styles.navBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.navTitle}>
                {MONTH_NAMES[monthYear.month]} {monthYear.year}
              </Text>
              <TouchableOpacity
                onPress={() => shiftMonth(1)}
                style={styles.navBtn}
                disabled={
                  monthYear.year === today.getFullYear() &&
                  monthYear.month === today.getMonth()
                }
              >
                <Text
                  style={[
                    styles.navBtnText,
                    monthYear.year === today.getFullYear() &&
                      monthYear.month === today.getMonth() &&
                      styles.navBtnDisabled,
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Day-of-week headers */}
            <View style={styles.monthDowRow}>
              {DAY_LABELS.map((d) => (
                <Text key={d} style={styles.monthDowLabel}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.monthGrid}>
              {monthCells.map((date, i) => (
                <MonthCell
                  key={i}
                  date={date}
                  isToday={isToday(date)}
                  isSelected={isSelected(date)}
                  onPress={setSelectedDate}
                />
              ))}
            </View>
          </View>
        )}

        {/* Legend */}
        <Legend />

        {/* Day detail */}
        <DayDetail date={selectedDate} />

        {/* Stats summary */}
        <StatsSummary />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 30-day stats summary ────────────────────────────────────────────────────
function StatsSummary() {
  const today = new Date();
  const entries = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const entry = MOCK_DATA[toKey(d)];
    if (entry) entries.push(entry);
  }

  const avgCal =
    entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.calories, 0) / entries.length)
      : 0;
  const onTrack = entries.filter(
    (e) => e.calories >= DAILY_GOAL * 0.7 && e.calories <= DAILY_GOAL
  ).length;
  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (MOCK_DATA[toKey(d)]) s++;
      else break;
    }
    return s;
  })();

  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Last 30 Days</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{avgCal}</Text>
          <Text style={styles.statLabel}>Avg kcal/day</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{onTrack}</Text>
          <Text style={styles.statLabel}>Days on track</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#f59e0b" }]}>
            🔥 {streak}
          </Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef2ff" },

  // Page header
  pageHeader: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  pageTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  pageSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 3,
    alignSelf: "flex-start",
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: "#fff",
  },
  toggleBtnText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
    fontSize: 13,
  },
  toggleBtnTextActive: {
    color: "#6366f1",
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Nav row
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnText: {
    fontSize: 22,
    color: "#6366f1",
    fontWeight: "700",
    lineHeight: 26,
  },
  navBtnDisabled: { color: "#cbd5e1" },
  navTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e1b4b",
    textAlign: "center",
    flex: 1,
  },

  // Week bars
  weekBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 140,
  },
  weekBarWrapper: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingBottom: 2,
    paddingTop: 4,
    borderRadius: 10,
  },
  weekBarSelected: {
    backgroundColor: "#eef2ff",
  },
  weekDayLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  weekDateNum: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  todayLabel: { color: "#6366f1" },
  todayDateNum: { color: "#6366f1" },
  barTrack: {
    flex: 1,
    width: "70%",
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
    minHeight: 60,
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  weekCalText: {
    fontSize: 9,
    fontWeight: "700",
  },
  goalLineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  goalLineDash: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  goalLineLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
  },

  // Month grid
  monthDowRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  monthDowLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  monthCellEmpty: {
    width: "14.28%",
    aspectRatio: 1,
  },
  monthCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 2,
  },
  monthCellToday: {
    backgroundColor: "#eef2ff",
  },
  monthCellNum: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  monthCellNumToday: {
    color: "#6366f1",
    fontWeight: "800",
  },

  // Legend
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
  },

  // Detail card
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailDateLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1e1b4b",
    flex: 1,
  },
  detailStatusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  detailCalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  detailCalNum: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1e1b4b",
  },
  detailCalUnit: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600",
  },
  detailProgressTrack: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  detailProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  detailMacroRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailMacroItem: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  detailMacroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailMacroVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e1b4b",
  },
  detailMacroLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detailEmpty: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  detailEmptyIcon: { fontSize: 28 },
  detailEmptyText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },

  // Stats card
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statsTitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#6366f1",
  },
  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "center",
  },
});
