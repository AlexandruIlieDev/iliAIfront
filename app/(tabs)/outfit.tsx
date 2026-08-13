import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useState } from "react";
import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { BASE_URL } from "../../constants/Config";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders();
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

const colors = {
  background: "#121929",
  card: "#1E293B",
  accent: "#3B82F6",
  text: "#fff",
  secondary: "#94A3B8",
  success: "#10B981",
  aiBubble: "rgba(59, 130, 246, 0.15)",
};

type ClothingItem = {
  _id: string;
  name: string;
  image: string;
  category: string;
  color: string;
};

type OutfitResponse = {
  superior: ClothingItem | null;
  inferior: ClothingItem | null;
  calzado: ClothingItem | null;
  abrigo: ClothingItem | null;
  accesorio: ClothingItem | null;
  isColorimetryMatch: boolean;
  explicacion?: string;
};

export default function OutfitScreen() {
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState<OutfitResponse[]>([]);

  const [ocasion, setOcasion] = useState("Casual");
  const [clima, setClima] = useState("Templado");

  // 🚀 "calzado" actúa como grupo maestro (Zapatillas, Zapatos, Botas)
  const [prendasDeseadas, setPrendasDeseadas] = useState<string[]>([
    "superior",
    "inferior",
    "calzado",
  ]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const toggleTipoPrenda = (tipo: string) => {
    if (prendasDeseadas.includes(tipo)) {
      if (prendasDeseadas.length <= 1) {
        showAlert("Aviso", "Debes seleccionar al menos una prenda.");
        return;
      }
      setPrendasDeseadas(prendasDeseadas.filter((item) => item !== tipo));
    } else {
      setPrendasDeseadas([...prendasDeseadas, tipo]);
    }
  };

  const generateNewOutfits = async () => {
    try {
      setLoading(true);

      const res = await api.post("/api/outfit/generar-ia", {
        ocasion,
        clima,
        prendasDeseadas,
      });

      if (res.data && res.data.outfits && res.data.outfits.length > 0) {
        setOutfits(res.data.outfits);
      } else {
        showAlert("Aviso", "No se pudieron estructurar las propuestas. Inténtalo de nuevo.");
      }
    } catch (err: any) {
      console.log("ERROR OUTFIT GEMINI:", err.response?.data || err.message);

      const errorMsg =
        err.response?.data?.mensaje ||
        "Error al conectar con la IA. Reintenta en unos segundos.";

      showAlert("Error al generar outfit", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper para poner en mayúscula la primera letra
  const formatCategoryLabel = (defaultLabel: string, item?: ClothingItem | null) => {
    if (!item || !item.category) return defaultLabel;
    const cat = item.category.trim();
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const renderOutfitCard = (outfit: OutfitResponse, index: number) => {
    // 🚀 La etiqueta de la imagen mostrará la categoría exacta de la DB (ej: "Zapatillas", "Sudadera")
    const items = [
      { data: outfit.superior, label: formatCategoryLabel("Superior", outfit.superior) },
      { data: outfit.inferior, label: formatCategoryLabel("Inferior", outfit.inferior) },
      { data: outfit.calzado, label: formatCategoryLabel("Calzado", outfit.calzado) },
      { data: outfit.abrigo, label: formatCategoryLabel("Abrigo", outfit.abrigo) },
      { data: outfit.accesorio, label: formatCategoryLabel("Accesorio", outfit.accesorio) },
    ].filter((item) => Boolean(item.data));

    return (
      <View style={styles.card} key={index}>
        <View style={styles.headerRow}>
          <Text style={styles.outfitNumber}>Propuesta #{index + 1}</Text>
          {outfit.isColorimetryMatch && (
            <View style={styles.matchBadge}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.matchText}>Match Ideal</Text>
            </View>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemsScroll}
        >
          {items.map((item, idx) => {
            const imageUri = item.data?.image;

            return (
              <View key={`${item.data?._id || idx}-${idx}`} style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <Text style={styles.itemLabel}>{item.label}</Text>
                <View
                  style={[
                    styles.colorIndicator,
                    {
                      backgroundColor:
                        item.data?.color === "beige" ? "#F5F5DC" : item.data?.color || "#333",
                    },
                  ]}
                />
              </View>
            );
          })}
        </ScrollView>

        {outfit.explicacion && (
          <View style={styles.aiExplanationBox}>
            <Ionicons name="sparkles-sharp" size={16} color={colors.accent} />
            <Text style={styles.aiExplanationText}>{outfit.explicacion}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn}>
          <Ionicons name="heart-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Estilista IA 🔥</Text>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Ocasión:</Text>
        <View style={styles.row}>
          {["Casual", "Trabajo", "Fiesta"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, ocasion === item && styles.chipActive]}
              onPress={() => setOcasion(item)}
            >
              <Text style={[styles.chipText, ocasion === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.filterTitle, { marginTop: 12 }]}>Clima:</Text>
        <View style={styles.row}>
          {["Caluroso", "Templado", "Frío"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, clima === item && styles.chipActive]}
              onPress={() => setClima(item)}
            >
              <Text style={[styles.chipText, clima === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.filterTitle, { marginTop: 12 }]}>Prendas a incluir (máx 5):</Text>
        <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
          {[
            { id: "superior", label: "Superior" },
            { id: "inferior", label: "Inferior" },
            { id: "calzado", label: "Calzado / Zapatillas" },
            { id: "abrigo", label: "Abrigo" },
            { id: "accesorio", label: "Accesorio" },
          ].map((item) => {
            const active = prendasDeseadas.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleTipoPrenda(item.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {active ? "✓ " : "+ "}{item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.generateBtn, loading && { opacity: 0.7 }]}
        onPress={generateNewOutfits}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.generateText}>Generar 3 Outfits</Text>
          </>
        )}
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Diseñando 3 propuestas personalizadas...</Text>
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => renderOutfitCard(item, index)}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="sparkles-outline" size={50} color={colors.secondary} />
              <Text style={styles.emptyText}>
                Selecciona tus filtros y pulsa "Generar 3 Outfits" para ver las opciones.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, paddingTop: 50 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 15 },
  filterContainer: { marginBottom: 15 },
  filterTitle: { color: colors.secondary, fontSize: 11, fontWeight: "bold", marginBottom: 8, textTransform: "uppercase" },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: { color: colors.secondary, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  generateBtn: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    gap: 8,
    elevation: 5,
  },
  generateText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  outfitNumber: { color: colors.secondary, fontSize: 13, fontWeight: "bold" },
  matchBadge: {
    flexDirection: "row",
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },
  matchText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  itemsScroll: { gap: 12, paddingRight: 10 },
  imageWrapper: { alignItems: "center", position: "relative" },
  image: {
    width: 100,
    height: 140,
    borderRadius: 15,
    backgroundColor: colors.background,
    marginBottom: 6,
  },
  itemLabel: { color: colors.secondary, fontSize: 10, fontWeight: "600" },
  colorIndicator: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  aiExplanationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.aiBubble,
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  aiExplanationText: {
    color: colors.text,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
    fontStyle: "italic",
  },
  saveBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 },
  loadingText: { color: colors.secondary, marginTop: 10, fontWeight: "600" },
  emptyText: { color: colors.secondary, textAlign: "center", marginTop: 20, paddingHorizontal: 20 },
});