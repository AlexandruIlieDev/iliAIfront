import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { getToken } from "../../utils/authStorage";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // 🚀 Obtenemos el espacio inferior seguro ocupado por la barra del sistema
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        setHasToken(!!token && token !== "undefined");
      } catch (e) {
        setHasToken(false);
      } finally {
        setIsReady(true);
      }
    };
    checkToken();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#121929" }} />;
  }

  if (!hasToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopColor: "rgba(255,255,255,0.05)",
          // 🚀 Ajuste de altura dinámico según botones de navegación del móvil
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clothing"
        options={{
          title: "Armario",
          tabBarIcon: ({ color }) => <Ionicons name="shirt" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Subir",
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="outfit"
        options={{
          title: "Outfit",
          tabBarIcon: ({ color }) => <Ionicons name="sparkles" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}