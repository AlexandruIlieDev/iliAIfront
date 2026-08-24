import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { getToken, setToken } from "../../utils/authStorage";
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
  error: "#EF4444",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados del modal de error
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setErrorModalVisible(true);
  };

  // Ajustes de fondo para web
  useEffect(() => {
    if (Platform.OS === "web") {
      document.body.style.backgroundColor = colors.background;
      document.documentElement.style.backgroundColor = colors.background;
    }
  }, []);

  // Comprobación de sesión guardada
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await getToken();
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return triggerError("Por favor, rellena todos los campos.");
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return triggerError("Introduce un correo electrónico con formato válido.");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (res.data.token) {
        await setToken(res.data.token);
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      console.log("Error en el login:", err.response?.data || err.message);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.mensaje ||
        "Credenciales incorrectas o problema de conexión.";
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={styles.circleDecoration} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.responsiveWrapper}>
          {/* CABECERA */}
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="flash" size={40} color={colors.accent} />
            </View>
            <Text style={styles.title}>¡Hola de nuevo!</Text>
            <Text style={styles.subtitle}>Inicia sesión en iliAI</Text>
          </View>

          {/* TARJETA DE FORMULARIO */}
          <View style={styles.formCard}>
            {/* CAMPO EMAIL */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#475569"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#475569"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* CAMPO CONTRASEÑA */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>CONTRASEÑA</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#475569"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* BOTÓN ENTRAR */}
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

          {/* ENLACE REGISTRO */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.7}
          >
            <Text style={styles.linkTextGrey}>¿No tienes cuenta? </Text>
            <Text style={styles.linkTextBlue}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ⚠️ MODAL PERSONALIZADO DE ERROR */}
      <Modal visible={errorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert-circle" size={42} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Error de acceso</Text>
            <Text style={styles.modalSubtitle}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.errorBtn}
              onPress={() => setErrorModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    paddingVertical: 40,
  },
  responsiveWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  circleDecoration: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.accent,
    opacity: 0.04,
  },
  header: {
    alignItems: "center",
    marginBottom: 35,
  },
  logoIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
  },
  formCard: {
    backgroundColor: colors.cardBackground,
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    elevation: 8,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 26,
  },
  linkTextGrey: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkTextBlue: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 330,
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  errorIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  errorBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});