import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// 🚀 IMPORTACIÓN DE LA URL CENTRALIZADA
import { BASE_URL } from "../../constants/Config";

// Paleta de colores iliAI
const colors = {
  background: "#121929",
  cardBackground: "#1E293B",
  inputBg: "#0F172A",
  accent: "#3B82F6",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Verificar si ya existe una sesión activa al cargar la pantalla
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          router.replace("/(tabs)/home");
        }
      } catch (e) {
        console.log("Error al verificar sesión", e);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, rellena todos los campos");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      console.log("Error en el login:", err);
      const msg = err.response?.data?.message || "Credenciales incorrectas";
      Alert.alert("Error de acceso", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Círculos decorativos de fondo */}
      <View style={styles.circleDecoration} />

      <View style={styles.header}>
        <View style={styles.logoIcon}>
          <Ionicons name="flash" size={40} color={colors.accent} />
        </View>
        <Text style={styles.title}>¡Hola de nuevo!</Text>
        <Text style={styles.subtitle}>Inicia sesión en iliAI</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#475569"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>CONTRASEÑA</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#475569"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Entrar</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.linkTextGrey}>¿No tienes cuenta? </Text>
        <Text style={styles.linkTextBlue}>Crear cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },
  circleDecoration: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    opacity: 0.05,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    padding: 24,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.inputBg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  linkTextGrey: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  linkTextBlue: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
});