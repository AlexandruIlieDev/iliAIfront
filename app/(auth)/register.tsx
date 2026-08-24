import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// 🚀 URL CENTRALIZADA
import { BASE_URL } from "../../constants/Config";

// Paleta de colores iliAI
const colors = {
  background: "#121929",
  cardBackground: "#1E293B",
  inputBg: "#0F172A",
  accent: "#3B82F6",
  success: "#10B981",
  error: "#EF4444",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const router = useRouter();

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de modales de alerta
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setErrorModalVisible(true);
  };

  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    // 1. Validar campos vacíos
    if (!cleanEmail || !cleanPassword || !cleanConfirmPassword) {
      return triggerError("Por favor, completa todos los campos.");
    }

    // 2. Validar formato de correo electrónico
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return triggerError("Introduce un correo electrónico válido (ej: nombre@correo.com).");
    }

    // 3. Validar longitud de contraseña
    if (cleanPassword.length < 6) {
      return triggerError("La contraseña debe contener un mínimo de 6 caracteres.");
    }

    // 4. Validar coincidencia de contraseñas
    if (cleanPassword !== cleanConfirmPassword) {
      return triggerError("Las contraseñas no coinciden. Verifícalas.");
    }

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        email: cleanEmail,
        password: cleanPassword,
      });

      // Registro exitoso -> abrir modal
      setSuccessModalVisible(true);
    } catch (err: any) {
      console.log("Error en registro:", err.response?.data || err.message);

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.mensaje ||
        "No se pudo completar el registro. Comprueba tu conexión a internet o intenta más tarde.";

      triggerError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessRedirect = () => {
    setSuccessModalVisible(false);
    router.replace("/(auth)/login");
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add-outline" size={38} color={colors.accent} />
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la revolución de tu armario</Text>
        </View>

        <View style={styles.formCard}>
          {/* CAMPO CORREO */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#475569" style={styles.inputIcon} />
              <TextInput
                placeholder="tu@email.com"
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
              <Ionicons name="lock-closed-outline" size={20} color="#475569" style={styles.inputIcon} />
              <TextInput
                placeholder="Mínimo 6 caracteres"
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

          {/* CAMPO CONFIRMAR CONTRASEÑA */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>REPETIR CONTRASEÑA</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#475569" style={styles.inputIcon} />
              <TextInput
                placeholder="Repite tu contraseña"
                placeholderTextColor="#475569"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.termsText}>
            Al registrarte, aceptas nuestros términos y políticas de uso.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Registrarse</Text>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.7}
        >
          <Text style={styles.linkTextGrey}>¿Ya tienes una cuenta? </Text>
          <Text style={styles.linkTextBlue}>Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 🚀 MODAL DE ÉXITO */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={42} color={colors.success} />
            </View>
            <Text style={styles.modalTitle}>¡Cuenta Creada!</Text>
            <Text style={styles.modalSubtitle}>
              Tu usuario ha sido registrado con éxito. Inicia sesión para empezar a estructurar tus outfits con IA.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={handleSuccessRedirect}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Iniciar Sesión</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ⚠️ MODAL DE ERROR */}
      <Modal visible={errorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert-circle" size={42} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Aviso</Text>
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
    padding: 24,
    paddingVertical: 40,
  },
  circleDecoration: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.accent,
    opacity: 0.04,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconContainer: {
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
  termsText: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
    marginVertical: 14,
    lineHeight: 16,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  loginLink: {
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
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
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
  successBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.success,
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