import { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Pages
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import CalendarPage from "./pages/CalendarPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";

// Components
import BottomNav from "./components/BottomNav";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "explore":
        return <ExplorePage />;
      case "calendar":
        return <CalendarPage />;
      case "achievements":
        return <AchievementsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {renderPage()}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}
