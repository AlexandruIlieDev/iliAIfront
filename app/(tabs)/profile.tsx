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
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // Se mantiene para casos específicos si fuera necesario
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// 🚀 IMPORTACIÓN CENTRALIZADA
import { BASE_URL } from "../../constants/Config";

// Configuración de Axios usando la constante central
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
  text: "#FFFFFF",
  subtext: "#94A3B8",
  border: "rgba(255, 255, 255, 0.05)",
};

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // ✨ LIMPIEZA: Ahora usamos la instancia 'api' directamente
      const res = await api.get("/api/user/profile");

      const data = res.data;
      setUser(data);
      setUsername(data.username || "");
      setHeight(data.height?.toString() || "");
      setWeight(data.weight?.toString() || "");
      setTop(data.sizes?.top || "");
      setBottom(data.sizes?.bottom || "");
      setShoes(data.sizes?.shoes || "");
    } catch (error: any) {
      console.error(
        "Error al cargar perfil:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      await api.put("/api/user/profile", {
        username,
        height,
        weight,
        top,
        bottom,
        shoes,
      });
      alert("¡Perfil actualizado!");
      fetchProfile();
    } catch (error) {
      console.error("Error al actualizar:", error);
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

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Lógica para mostrar la foto (Cloudinary o Local)
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información</Text>
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

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.danger}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
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
    borderRadius: 20,
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
  mainBtn: {
    backgroundColor: colors.accent,
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
});
