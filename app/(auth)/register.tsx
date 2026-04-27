import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
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
  success: "#22C55E",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
};

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        email,
        password,
      });
      // Tras registro exitoso, mandamos al login
      router.replace("/(auth)/login");
    } catch (err) {
      console.log("Error en el registro:", err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.circleDecoration} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="person-add-outline"
              size={40}
              color={colors.accent}
            />
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Únete a la revolución de tu armario
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              placeholder="tu@email.com"
              placeholderTextColor="#475569"
              style={styles.input}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#475569"
              secureTextEntry
              style={styles.input}
              onChangeText={setPassword}
            />
          </View>

          <Text style={styles.termsText}>
            Al registrarte, aceptas nuestros términos y condiciones.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.linkTextGrey}>¿Ya tienes una cuenta? </Text>
          <Text style={styles.linkTextBlue}>Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  },
  circleDecoration: {
    position: "absolute",
    bottom: -50,
    left: -50,
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
  iconContainer: {
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
  termsText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
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
