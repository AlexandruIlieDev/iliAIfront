import { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import { StatusBar } from "expo-status-bar";

// 🚀 IMPORTACIÓN CENTRALIZADA
import { BASE_URL } from "../constants/Config";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Un poco más de margen para el primer login
});

const colors = {
  background: "#121929",
  cardBackground: "#1E293B",
  inputBg: "#0F172A",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  accent: "#3B82F6",
};

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const token = res.data?.token;
      if (!token) throw new Error("Token no recibido");

      await AsyncStorage.setItem("token", token);

      // Redirigir al home de la app
      router.replace("/(tabs)/home");
    } catch (err: any) {
      console.log("ERROR LOGIN:", err);
      if (err.response?.status === 401) {
        setError("Credenciales incorrectas");
      } else if (err.code === "ECONNABORTED") {
        setError("El servidor tarda en responder. Reintenta.");
      } else {
        setError("Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) router.replace("/(tabs)/home");
    };
    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.emojiLogo}>🚀</Text>
        <Text style={styles.title}>iliAI</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#475569"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor="#475569"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.accent}
            style={{ marginTop: 20 }}
          />
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>
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
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  emojiLogo: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 5,
  },
  form: {
    width: "100%",
    backgroundColor: colors.cardBackground,
    padding: 25,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  errorText: {
    color: "#FB7185",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
