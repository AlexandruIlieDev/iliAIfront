import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  RefreshControl,
  Platform,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getToken } from "../../utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";

// 🚀 IMPORTACIÓN CENTRALIZADA
import { BASE_URL } from "../../constants/Config";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: 0,
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

type ClothingItem = {
  _id: string;
  name: string;
  image: string;
  category?: string;
  color?: string;
  isFavorite?: boolean;
};

const colors = {
  background: "#121929",
  cardBackground: "#1E293B",
  accent: "#3B82F6",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  danger: "#EF4444",
};

export default function Clothing() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"az" | "za" | "none">("none");
  const [showSearch, setShowSearch] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 🗑️ Estados para el nuevo modal de borrado
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const openImageViewer = (image: string) => {
    setSelectedImage(image);
    setImageViewerVisible(true);
  };

  const getClothes = async (showFullLoading = false) => {
    try {
      if (showFullLoading) setLoading(true);
      const timestamp = new Date().getTime();
      const res = await api.get(`/api/clothing?t=${timestamp}`);
      setClothes(res.data);
    } catch (err) {
      console.log("Error al cargar ropa:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getClothes();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    getClothes();
  };

  const toggleFavorite = async (id: string) => {
    try {
      const res = await api.put(`/api/clothing/${id}/favorite`);
      const updatedItem = res.data;
      const updatedClothes = clothes.map((item) =>
        item._id === id ? updatedItem : item,
      );
      setClothes(updatedClothes);
    } catch (err) {
      console.log("ERROR FAVORITE:", err);
    }
  };

  // 🗑️ Lógica de borrado con el modal personalizado
  const requestDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/api/clothing/${itemToDelete}`);
      const updated = clothes.filter((item) => item._id !== itemToDelete);
      setClothes(updated);
    } catch (err) {
      console.log("ERROR DELETE:", err);
    } finally {
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  useEffect(() => {
    let result = [...clothes];
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }
    if (searchText.trim() !== "") {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    if (showFavoritesOnly) {
      result = result.filter((item) => item.isFavorite);
    }
    if (sortOrder === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    setFilteredClothes(result);
  }, [selectedCategory, searchText, showFavoritesOnly, clothes, sortOrder]);

  const categories: string[] = [
    "all",
    ...new Set(
      clothes
        .map((c) => c.category)
        .filter((cat): cat is string => typeof cat === "string"),
    ),
  ];

  const renderClothingItem = ({ item }: { item: ClothingItem }) => {
    const imageUrl = item.image;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => openImageViewer(imageUrl)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heart}
          onPress={() => toggleFavorite(item._id)}
        >
          <View style={styles.iconOverlay}>
            <Ionicons
              name={item.isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={item.isFavorite ? colors.danger : "white"}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => requestDelete(item._id)}
        >
          <View
            style={[
              styles.iconOverlay,
              { backgroundColor: "rgba(239, 68, 68, 0.8)" },
            ]}
          >
            <Ionicons name="trash" size={16} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>{item.category}</Text>
            <View style={styles.dotSeparator} />
            <View
              style={[
                styles.colorDot,
                {
                  backgroundColor:
                    item.color === "beige" ? "#F5F5DC" : item.color || "#ccc",
                  borderWidth: item.color === "white" || !item.color ? 1 : 0,
                  borderColor: colors.textSecondary,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  if (loading && clothes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.text, { marginTop: 10 }]}>
          Abriendo armario...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Mi armario 👕</Text>

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons
            name="search"
            size={20}
            color={showSearch ? colors.accent : "#fff"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Ionicons
            name={showFavoritesOnly ? "heart" : "heart-outline"}
            size={20}
            color={showFavoritesOnly ? colors.danger : "#fff"}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            onPress={() => setSortOrder("az")}
            style={styles.sortBtn}
          >
            <Text
              style={[
                styles.smallText,
                sortOrder === "az" && styles.activeSortText,
              ]}
            >
              A-Z
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => setSortOrder("za")}
            style={styles.sortBtn}
          >
            <Text
              style={[
                styles.smallText,
                sortOrder === "za" && styles.activeSortText,
              ]}
            >
              Z-A
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <TextInput
          placeholder="¿Qué prenda buscas?"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      )}

      <View style={{ height: 48, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
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
                {cat === "all"
                  ? "Todo"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredClothes}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        renderItem={renderClothingItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.text}>No hay prendas aquí todavía</Text>
          </View>
        }
      />

      {/* 🗑️ MODAL DE BORRADO PERSONALIZADO */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.warningIconCircle}>
              <Ionicons name="alert-circle" size={40} color={colors.danger} />
            </View>
            <Text style={styles.confirmTitle}>¿Eliminar prenda?</Text>
            <Text style={styles.confirmSubtitle}>
              Esta acción no se puede deshacer. La prenda desaparecerá de tu
              armario virtual.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalBtn}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Visor de imagen */}
      <Modal visible={imageViewerVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.viewerContainer}
          activeOpacity={1}
          onPress={() => setImageViewerVisible(false)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    padding: 8,
    borderRadius: 18,
    marginBottom: 15,
  },
  iconBtn: { padding: 8 },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  sortBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: colors.textSecondary,
    opacity: 0.3,
  },
  smallText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  activeSortText: { color: colors.accent },
  searchInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    color: "#fff",
    marginBottom: 15,
    fontSize: 16,
  },
  chip: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    height: 40,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSecondary, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  columnWrapper: { justifyContent: "space-between" },
  card: {
    width: "48%",
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: { width: "100%", height: 180, backgroundColor: "#1e293b" },
  iconOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 6,
    borderRadius: 12,
  },
  heart: { position: "absolute", top: 10, right: 10 },
  deleteBtn: { position: "absolute", top: 10, left: 10 },
  cardInfo: { padding: 12 },
  name: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  detailsRow: { flexDirection: "row", alignItems: "center" },
  detailText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 8,
    opacity: 0.5,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  viewerImage: { width: "100%", height: "80%" },
  closeModal: { position: "absolute", top: 60, right: 25 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: colors.textSecondary, fontSize: 16 },
  // 🎨 Estilos nuevos para el modal
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
  warningIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
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
  modalButtonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 10,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  deleteModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.danger,
  },
  cancelBtnText: { color: "#fff", fontWeight: "600" },
  deleteBtnText: { color: "#fff", fontWeight: "bold" },
});