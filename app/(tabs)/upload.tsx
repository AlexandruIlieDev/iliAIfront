import {
  Alert,
  View,
  Text,
  Image,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// 🚀 IMPORTACIÓN CENTRALIZADA
import { BASE_URL } from "../../constants/Config";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ✅ CATEGORÍAS SINCRONIZADAS CON EL BACKEND (ESP)
const CATEGORIES = [
  "superior",
  "inferior",
  "calzado",
  "abrigo",
  "accesorios",
  "deporte",
  "formal",
];

// 🎨 LISTA DE COLORES PARA EL MOTOR
const COLORS_LIST = [
  "black",
  "white",
  "grey",
  "blue",
  "navy",
  "beige",
  "cream",
  "red",
  "green",
  "pink",
  "brown",
  "terracota",
];

const COLOR_MAP: { [key: string]: string } = {
  black: "#000000",
  white: "#FFFFFF",
  grey: "#94A3B8",
  blue: "#3B82F6",
  navy: "#1E3A8A",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  red: "#EF4444",
  green: "#10B981",
  pink: "#EC4899",
  brown: "#78350F",
  terracota: "#A45A52",
};

const colors = {
  background: "#121929",
  cardBackground: "#1E293B",
  accent: "#3B82F6",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  inputBg: "#0F172A",
  success: "#10B981",
};

export default function Upload() {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const showErrorMessage = (msg: string) => {
    if (Platform.OS === "web") alert(msg);
    else Alert.alert("Error", msg);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showErrorMessage("Necesitamos permiso para acceder a tus fotos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return showErrorMessage("Selecciona una imagen");
    if (!name.trim()) return showErrorMessage("Dale un nombre a la prenda");
    if (!selectedCategory) return showErrorMessage("Elige una categoría");
    if (!selectedColor) return showErrorMessage("Elige un color");

    setLoading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append("image", blob, "upload.jpg");
      } else {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        // @ts-ignore
        formData.append("image", {
          uri: image,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      formData.append("name", name);
      formData.append("category", selectedCategory);
      formData.append("color", selectedColor);

      await api.post("/api/clothing/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      setSuccessModalVisible(true);

      // Limpiar formulario
      setImage(null);
      setName("");
      setSelectedCategory("");
      setSelectedColor("");
    } catch (err: any) {
      console.log("ERROR UPLOAD:", err.response?.data || err.message);
      showErrorMessage("Error al subir. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Nueva Prenda 👕</Text>

        <TouchableOpacity
          style={[styles.imagePicker, image ? styles.imageActive : null]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image }} style={styles.preview} />
              <View style={styles.changeBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
                <Text style={styles.changeText}>Cambiar</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-upload" size={32} color={colors.accent} />
              </View>
              <Text style={styles.pickerTitle}>Subir fotografía</Text>
              <Text style={styles.pickerSub}>Toca para seleccionar</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la prenda</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Camiseta de algodón"
            placeholderTextColor="#475569"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color principal</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {COLORS_LIST.map((colorItem) => (
              <TouchableOpacity
                key={colorItem}
                onPress={() => setSelectedColor(colorItem)}
                style={[
                  styles.chip,
                  selectedColor === colorItem && styles.chipActive,
                ]}
              >
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: COLOR_MAP[colorItem] },
                  ]}
                />
                <Text
                  style={[
                    styles.chipText,
                    selectedColor === colorItem && styles.chipTextActive,
                  ]}
                >
                  {colorItem.charAt(0).toUpperCase() + colorItem.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.chip,
                  selectedCategory === cat && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === cat && styles.chipTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} />
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadBtn,
                (!image || !name || !selectedColor || !selectedCategory) &&
                  styles.btnDisabled,
              ]}
              onPress={uploadImage}
              disabled={loading || !image}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.uploadBtnText}>Añadir al armario</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="shirt" size={40} color={colors.success} />
            </View>
            <Text style={styles.confirmTitle}>¡Logrado!</Text>
            <Text style={styles.confirmSubtitle}>
              Prenda guardada correctamente. Ya puedes usarla para tus outfits.
            </Text>
            <TouchableOpacity
              style={styles.successModalBtn}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.successBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: 24, paddingTop: 40 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 25,
  },
  imagePicker: {
    width: "100%",
    height: 240,
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.05)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    overflow: "hidden",
  },
  imageActive: { borderStyle: "solid", borderColor: colors.accent },
  placeholderContainer: { alignItems: "center" },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  pickerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  pickerSub: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  previewContainer: { width: "100%", height: "100%" },
  preview: { width: "100%", height: "100%" },
  changeBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  changeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  inputGroup: { marginBottom: 20 },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  categoriesScroll: { paddingVertical: 5 },
  chip: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  colorPreview: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  footer: { marginTop: 10, alignItems: "center", paddingBottom: 40 },
  uploadBtn: {
    backgroundColor: colors.accent,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 18,
    gap: 10,
    elevation: 8,
  },
  btnDisabled: { backgroundColor: "#334155", opacity: 0.6 },
  uploadBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
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
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  confirmSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  successModalBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.success,
    elevation: 5,
  },
  successBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
