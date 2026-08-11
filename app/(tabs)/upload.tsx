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
  }
);

// ✅ LISTA DE CATEGORÍAS DETALLADA Y SINCRONIZADA CON IA
const CATEGORIES = [
  "camiseta",
  "camisa",
  "sudadera",
  "pantalón",
  "pantalón corto",
  "chaqueta",
  "abrigo",
  "zapatillas",
  "zapatos",
  "botas",
  "accesorio",
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

// 🔄 MAPEO DE COLORES EN ESPAÑOL DE GEMINI A NUESTRA LISTA
const SPANISH_TO_ENGLISH_COLOR: { [key: string]: string } = {
  negro: "black",
  blanco: "white",
  gris: "grey",
  azul: "blue",
  "azul marino": "navy",
  navy: "navy",
  beige: "beige",
  crema: "cream",
  rojo: "red",
  verde: "green",
  rosa: "pink",
  rosado: "pink",
  marrón: "brown",
  marron: "brown",
  terracota: "terracota",
};

const colors = {
  background: "#121929",
  cardBackground: "#1E293B",
  accent: "#3B82F6",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  inputBg: "#0F172A",
  success: "#10B981",
  aiBubble: "rgba(59, 130, 246, 0.2)",
};

export default function Upload() {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const showErrorMessage = (msg: string) => {
    if (Platform.OS === "web") alert(msg);
    else Alert.alert("Error", msg);
  };

  // 🤖 FUNCIÓN PARA AUTO-DETECTAR CON GEMINI VISION
  const autoDetectWithAI = async (imageUri: string) => {
    try {
      setAnalyzing(true);

      const formData = new FormData();
      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("imagen", blob, "prenda.jpg");
      } else {
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        // @ts-ignore
        formData.append("imagen", {
          uri: imageUri,
          name: `prenda.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const res = await api.post("/api/clothing/analizar-imagen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 20000,
      });

      if (res.data && res.data.exito && res.data.datos) {
        const { name: aiName, category: aiCat, color: aiColor } = res.data.datos;

        // 1. Asignamos Nombre
        if (aiName) setName(aiName);

        // 2. Mapeamos Categoría Ampliada
        if (aiCat) {
          const catLower = aiCat.toLowerCase().trim();
          if (CATEGORIES.includes(catLower)) {
            setSelectedCategory(catLower);
          } else if (catLower.includes("pant") || catLower.includes("vaquero") || catLower.includes("jeans") || catLower.includes("inferior")) {
            setSelectedCategory("pantalón");
          } else if (catLower.includes("zapa") || catLower.includes("snk") || catLower.includes("calzado")) {
            setSelectedCategory("zapatillas");
          } else if (catLower.includes("suda") || catLower.includes("hoodie")) {
            setSelectedCategory("sudadera");
          } else if (catLower.includes("chaq") || catLower.includes("jack")) {
            setSelectedCategory("chaqueta");
          } else if (catLower.includes("abri") || catLower.includes("coat")) {
            setSelectedCategory("abrigo");
          } else if (catLower.includes("cami") || catLower.includes("top") || catLower.includes("superior")) {
            setSelectedCategory("camiseta");
          } else {
            setSelectedCategory("camiseta");
          }
        }

        // 3. Mapeamos Color
        if (aiColor) {
          const colorLower = aiColor.toLowerCase().trim();
          const mappedColor = SPANISH_TO_ENGLISH_COLOR[colorLower] || colorLower;
          if (COLORS_LIST.includes(mappedColor)) {
            setSelectedColor(mappedColor);
          }
        }
      }
    } catch (err: any) {
      console.log("Error en auto-detección de IA:", err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // 🖼️ SELECCIONAR DESDE LA GALERÍA
  const pickImageFromGallery = async () => {
    setPickerModalVisible(false);
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

    if (!result.canceled && result.assets[0]) {
      const selectedUri = result.assets[0].uri;
      setImage(selectedUri);
      autoDetectWithAI(selectedUri);
    }
  };

  // 📷 HACER FOTO CON LA CÁMARA
  const takePhotoWithCamera = async () => {
    setPickerModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showErrorMessage("Necesitamos permiso para acceder a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedUri = result.assets[0].uri;
      setImage(selectedUri);
      autoDetectWithAI(selectedUri);
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
          onPress={() => setPickerModalVisible(true)}
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
                <Ionicons name="camera-reverse" size={32} color={colors.accent} />
              </View>
              <Text style={styles.pickerTitle}>Hacer foto o Galería</Text>
              <Text style={styles.pickerSub}>Toca para seleccionar</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 🤖 BARRA DE DETECCIÓN IA */}
        {analyzing && (
          <View style={styles.aiAnalyzingBox}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Ionicons name="sparkles" size={18} color={colors.accent} />
            <Text style={styles.aiAnalyzingText}>
              Gemini IA analizando prenda y removiendo fondo...
            </Text>
          </View>
        )}

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

      {/* 🚀 MODAL PARA ELEGIR CÁMARA O GALERÍA */}
      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.confirmCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.pickerIconCircle}>
              <Ionicons name="camera" size={36} color={colors.accent} />
            </View>
            <Text style={styles.confirmTitle}>Subir fotografía</Text>
            <Text style={styles.confirmSubtitle}>
              ¿Cómo quieres añadir la imagen de tu prenda?
            </Text>

            <TouchableOpacity
              style={styles.pickerOptionBtn}
              onPress={takePhotoWithCamera}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.pickerOptionText}>Hacer foto con la cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerOptionBtn, { marginTop: 12 }]}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="images-outline" size={20} color="#fff" />
              <Text style={styles.pickerOptionText}>Elegir de la galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setPickerModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 🚀 MODAL DE ÉXITO */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="shirt" size={40} color={colors.success} />
            </View>
            <Text style={styles.confirmTitle}>¡Logrado!</Text>
            <Text style={styles.confirmSubtitle}>
              Prenda guardada correctamente sin fondo. Ya puedes usarla para tus
              outfits.
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
    marginBottom: 15,
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
  aiAnalyzingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.aiBubble,
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  aiAnalyzingText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
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
  pickerIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  pickerOptionBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    gap: 10,
  },
  pickerOptionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  cancelModalBtn: {
    width: "100%",
    paddingVertical: 12,
    marginTop: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
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
    marginBottom: 8,
  },
  confirmSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
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