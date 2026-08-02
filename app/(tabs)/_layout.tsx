import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

// 🔧 SUGERENCIA: define aquí un icono único para "éxito" en toda la app
// y reutilízalo en profile.tsx, upload.tsx, clothing.tsx, etc.
// export const SUCCESS_ICON = "checkmark-circle";

export default function TabsLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        // Si el token existe y es válido
        setHasToken(!!token && token !== "undefined");
      } catch (e) {
        setHasToken(false);
      } finally {
        setIsReady(true);
      }
    };
    checkToken();
  }, []);

  // 1. Mientras comprueba, fondo oscuro total (evita parpadeo blanco)
  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#121929" }} />;
  }

  // 2. LA CLAVE: Si ya comprobó y NO hay token, redirigimos al login
  // antes de que se llegue a dibujar la estructura de los Tabs.
  if (!hasToken) {
    return <Redirect href="/(auth)/login" />;
  }

  // 3. Si hay token, dibujamos los Tabs normalmente
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",
        // 🔧 FIX: tamaños más compactos para que 5 tabs quepan sin overflow
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
          height: 60,
          paddingBottom: 10,
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
      {/* 🔧 FIX: la pestaña que faltaba registrar.
          Antes Expo Router la añadía sola, sin icono ni título,
          y eso era el icono roto + la flecha "<" que veías en todas las pantallas. */}
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
