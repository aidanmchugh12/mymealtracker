import { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Auth
<<<<<<< HEAD
import AuthPage from "./pages/AuthPage";
=======
import { AuthProvider, useAuth } from "./context/AuthContext";
>>>>>>> f31ca5909be269835767e159a3f37709d0444e1c

// Pages
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import CalendarPage from "./pages/CalendarPage";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";

// Components
import BottomNav from "./components/BottomNav";

<<<<<<< HEAD
export default function App() {
  const [user, setUser] = useState(null); // null = not signed in
=======
function AppContent() {
>>>>>>> f31ca5909be269835767e159a3f37709d0444e1c
  const [activeTab, setActiveTab] = useState("home");
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Called by AuthPage on successful sign-in or sign-up
  const handleAuth = (userData) => {
    setUser(userData);
    setActiveTab("home");
  };

  // Show auth screen if not signed in
  if (!user) {
    return (
      <SafeAreaProvider>
        <AuthPage onAuth={handleAuth} />
      </SafeAreaProvider>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage user={user} />;
      case "explore":
        return <ExplorePage />;
      case "calendar":
        return <CalendarPage />;
      case "achievements":
        return <AchievementsPage />;
      case "profile":
        return <ProfilePage user={user} onSignOut={() => setUser(null)} />;
      default:
        return <HomePage user={user} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderPage()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
