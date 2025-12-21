import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false,
     tabBarActiveTintColor: COLORS.primary,
     headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: COLORS.textPrimary},
     tabBarStyle:{backgroundColor: COLORS.cardBackground, borderTopColor: COLORS.border}
     }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarLabel: "Create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" color={color} size={size} />
          ),
        }}
      />

    </Tabs>
  );
}
