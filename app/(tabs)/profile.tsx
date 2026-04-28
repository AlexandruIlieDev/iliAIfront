import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// 🚀 IMPORTACIÓN DE CONFIGURACIÓN Y VERSIÓN
import { BASE_URL } from "../../constants/Config";
const packageInfo = require("../../app.json");

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const colors = {
  background: "#121929",
  card: "#1E293B",
  input: "#0F172A",
  accent: "#3B82F6",
  danger: "#EF4444",
  success: "#10B981",
  text: "#FFFFFF",
  subtext: "#94A3B8",
  border: "rgba(255, 255, 255, 0.05)",
};

const seasonsData = [
  { 
    id: 'Invierno', 
    title: '❄️ Invierno (Fría e Intensa)', 
    desc: 'Eres Invierno si hay mucho contraste entre tu pelo y piel.\n• Piel: Muy clara, rosada o muy oscura.\n• Pelo: Negro, castaño oscuro o canoso.\n• Ojos: Negros, azules intensos o verdes oscuros.',
    dots: ['#000000', '#FFFFFF', '#1E40AF', '#BE185D']
  },
  { 
    id: 'Verano', 
    title: '☀️ Verano (Fría y Suave)', 
    desc: 'Eres Verano si tus rasgos son suaves y poco contrastados.\n• Piel: Clara, rosada o muy pálida.\n• Pelo: Rubio ceniza o castaño claro.\n• Ojos: Azules, grises o verdes claros.',
    dots: ['#94A3B8', '#F1F5F9', '#A5B4FC', '#FDA4AF']
  },
  { 
    id: 'Otoño', 
    title: '🍂 Otoño (Cálida y Profunda)', 
    desc: 'Eres Otoño si tienes matices dorados y terrosos.\n• Piel: Dorada, melocotón o con pecas.\n• Pelo: Pelirrojo, castaño cálido o dorado.\n• Ojos: Marrón chocolate, miel o verdes oliva.',
    dots: ['#451A03', '#365314', '#92400E', '#B45309']
  },
  { 
    id: 'Primavera', 
    title: '🌸 Primavera (Cálida y Brillante)', 
    desc: 'Eres Primavera si tus tonos son luminosos y vitales.\n• Piel: Beige, marfil o melocotón dorado.\n• Pelo: Rubio dorado, cobrizo claro o castaño miel.\n• Ojos: Azules brillantes, verdes agua o avellana.',
    dots: ['#FB923C', '#2DD4BF', '#A8DADC', '#FDE047']
  }
];

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Estados del formulario
  const [username, setUsername] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");
  const [shoes, setShoes] = useState("");
  const [colorSeason, setColorSeason] = useState("");

  // 🌟 Estados para los Modales
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      const res = await api.get("/api/user/profile");
      const data = res.data;

      setUser(data);
      setUsername(data.username || "");
      setHeight(data.height?.toString() || "");
      setWeight(data.weight?.toString() || "");
      setTop(data.sizes?.top || "");
      setBottom(data.sizes?.bottom || "");
      setShoes(data.sizes?.shoes || "");
      setColorSeason(data.colorSeason || "");
    } catch (error: any) {
      console.error(
        "Error al cargar perfil:",
        error.response?.data || error.message,
      );
      if (error.response?.status === 401) {
        handleForcedLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleForcedLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/(auth)/login");
  };

  const handleUpdate = async () => {
    try {
      await api.put("/api/user/profile", {
        username,
        height,
        weight,
        top,
        bottom,
        shoes,
        colorSeason,
      });
      setSuccessModalVisible(true);
      fetchProfile();
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  const handleAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const formData = new FormData();
    // @ts-ignore
    formData.append("avatar", {
      uri: result.assets[0].uri,
      name: "profile.jpg",
      type: "image/jpeg",
    });

    try {
      await api.put("/api/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProfile();
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.clear();
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const userImage = user?.photo
    ? {
        uri: user.photo.startsWith("http")
          ? user.photo
          : `${BASE_URL}/${user.photo.replace(/\\/g, "/")}`,
      }
    : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
      >
        <StatusBar style="light" />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleAvatar} style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {userImage ? (
                <Image source={userImage} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={50} color={colors.subtext} />
              )}
            </View>
            <View style={styles.badge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* PERSONAL INFO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Personal</Text>
          <Text style={styles.label}>NOMBRE DE USUARIO</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Tu nombre"
            placeholderTextColor="#475569"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>ALTURA (CM)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="175"
                placeholderTextColor="#475569"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>PESO (KG)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
        </View>

        {/* COLORIMETRÍA */}
        <View style={styles.card}>
          <View style={styles.rowCenteredBetween}>
            <View style={styles.rowCentered}>
              <Ionicons
                name="color-palette-outline"
                size={18}
                color={colors.accent}
              />
              <Text
                style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}
              >
                Colorimetría
              </Text>
            </View>
            <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>
            SELECCIONA TU ESTACIÓN
          </Text>
          <View style={styles.seasonPickerContainer}>
            {seasonsData.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.seasonOption,
                  colorSeason === s.id && styles.seasonOptionActive,
                ]}
                onPress={() => setColorSeason(s.id)}
              >
                <Text
                  style={[
                    styles.seasonOptionText,
                    colorSeason === s.id && styles.seasonOptionTextActive,
                  ]}
                >
                  {s.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TALLAS */}
        <View style={styles.card}>
          <View style={styles.rowCentered}>
            <Ionicons name="shirt-outline" size={18} color={colors.accent} />
            <Text
              style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}
            >
              Mis Tallas
            </Text>
          </View>

          <Text style={[styles.label, { marginTop: 15 }]}>PARTE SUPERIOR</Text>
          <TextInput
            style={styles.input}
            value={top}
            onChangeText={setTop}
            placeholder="M, L, XL..."
            placeholderTextColor="#475569"
          />

          <Text style={styles.label}>INFERIOR / PANTALÓN</Text>
          <TextInput
            style={styles.input}
            value={bottom}
            onChangeText={setBottom}
            placeholder="42, M..."
            placeholderTextColor="#475569"
          />

          <Text style={styles.label}>CALZADO</Text>
          <TextInput
            style={styles.input}
            value={shoes}
            onChangeText={setShoes}
            placeholder="43, 44..."
            placeholderTextColor="#475569"
          />
        </View>

        <TouchableOpacity style={styles.mainBtn} onPress={handleUpdate}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.mainBtnText}>Guardar Cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.danger}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Versión {packageInfo.expo.version}
        </Text>
      </ScrollView>

      {/* 🚀 MODAL DE ÉXITO */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons name="person-circle" size={40} color={colors.success} />
            </View>
            <Text style={styles.confirmTitle}>Perfil Actualizado</Text>
            <Text style={styles.confirmSubtitle}>
              Tus cambios se han guardado con éxito.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.accent }]}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ⚠️ MODAL DE INFO COLORIMETRÍA */}
      <Modal visible={infoModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.infoCard}>
            <Text style={styles.confirmTitle}>Guía de Estaciones</Text>
            <Text style={styles.confirmSubtitle}>
              Descubre qué colores resaltan más tu belleza natural.
            </Text>

            <ScrollView
              style={{ maxHeight: 350 }}
              showsVerticalScrollIndicator={false}
            >
              {seasonsData.map((s) => (
                <View key={s.id} style={styles.seasonInfoBox}>
                  <Text style={styles.seasonInfoTitle}>{s.title}</Text>
                  <Text style={styles.seasonInfoDesc}>{s.desc}</Text>
                  <View style={styles.colorRow}>
                    {s.dots.map((c, i) => (
                      <View
                        key={i}
                        style={[styles.colorDot, { backgroundColor: c }]}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: colors.accent, marginTop: 20 },
              ]}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ⚠️ MODAL DE CERRAR SESIÓN */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: "rgba(239, 68, 68, 0.1)" },
              ]}
            >
              <Ionicons name="log-out" size={40} color={colors.danger} />
            </View>
            <Text style={styles.confirmTitle}>Cerrar Sesión</Text>
            <Text style={styles.confirmSubtitle}>
              ¿Estás seguro de que quieres salir?
            </Text>
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtnHalf,
                  {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.subtext }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnHalf,
                  { backgroundColor: colors.danger },
                ]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalBtnText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 50 },
  header: { alignItems: "center", marginBottom: 30 },
  avatarWrapper: { position: "relative" },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.accent,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  emailText: { color: colors.subtext, marginTop: 12, fontSize: 14 },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    color: colors.subtext,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.input,
    color: colors.text,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row" },
  rowCentered: { flexDirection: "row", alignItems: "center" },
  rowCenteredBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  seasonPickerContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seasonOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  seasonOptionActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  seasonOptionText: { color: colors.subtext, fontSize: 13 },
  seasonOptionTextActive: { color: colors.accent, fontWeight: "bold" },
  mainBtn: {
    backgroundColor: colors.accent,
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  mainBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  logoutBtn: {
    flexDirection: "row",
    padding: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutBtnText: { color: colors.danger, fontWeight: "bold" },
  versionText: {
    color: colors.subtext,
    textAlign: "center",
    fontSize: 12,
    marginTop: 25,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  infoCard: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  seasonInfoBox: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: colors.input,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seasonInfoTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  seasonInfoDesc: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  colorRow: { flexDirection: "row", gap: 6 },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  confirmSubtitle: {
    color: colors.subtext,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalRow: { flexDirection: "row", width: "100%", gap: 12 },
  modalBtnHalf: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
});
