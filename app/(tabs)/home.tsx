import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Paleta de colores iliAI
const colors = {
  background: "#121929",
  cardBackground: "#1E293B",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  danger: "#EF4444",
};

export default function Home() {
  const router = useRouter();

  // 🛡️ SEGURIDAD: Si no hay token, no puedes estar aquí
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // Usamos replace para que no pueda volver atrás
        router.replace("/(auth)/login");
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Text style={styles.emojiLogo}>👕</Text>

        <Text style={styles.welcomeText}>Bienvenido a</Text>
        <Text style={styles.brandTitle}>iliAI 🔥</Text>

        <View style={styles.buttonSpacer} />

        {/* BOTÓN: SUBIR ROPA */}
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push("/upload")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add"
            size={18}
            color="#fff"
            style={styles.iconBefore}
          />
          <Text style={styles.customButtonText}>Ir a subir ropa</Text>
        </TouchableOpacity>

        <View style={styles.interButtonSpace} />

        {/* BOTÓN: VER ARMARIO */}
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push("/clothing")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="shirt"
            size={18}
            color="#fff"
            style={styles.iconBefore}
          />
          <Text style={styles.customButtonText}>Ver mi armario</Text>
        </TouchableOpacity>

        <View style={styles.interButtonSpace} />

        {/* 🔥 BOTÓN: OUTFIT */}
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push("/outfit")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="sparkles"
            size={18}
            color="#fff"
            style={styles.iconBefore}
          />
          <Text style={styles.customButtonText}>Generar outfit</Text>
        </TouchableOpacity>

        <View style={styles.logoutSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    alignItems: "center",
    maxWidth: 400,
  },
  emojiLogo: {
    fontSize: 60,
    marginBottom: 10,
  },
  welcomeText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginBottom: 5,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonSpacer: {
    height: 40,
  },
  interButtonSpace: {
    height: 15,
  },
  logoutSpacer: {
    height: 40,
  },
  customButton: {
    backgroundColor: colors.cardBackground,
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  customButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  iconBefore: {
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});