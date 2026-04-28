import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { BASE_URL } from "../../constants/Config";

const api = axios.create({
  baseURL: BASE_URL,
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
};

type ClothingItem = {
  _id: string;
  name: string;
  image: string;
  category: string;
  color: string;
};

type OutfitResponse = {
  superior: ClothingItem;
  inferior: ClothingItem;
  calzado: ClothingItem | null;
  abrigo: ClothingItem | null;
  accesorio: ClothingItem | null;
  isColorimetryMatch: boolean;
};

export default function OutfitScreen() {
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState<OutfitResponse[]>([]);
  
  // 🔘 Estados para los filtros de categoría extra
  const [includeCoat, setIncludeCoat] = useState(false);
  const [includeAcc, setIncludeAcc] = useState(false);

  const generateNewOutfits = async () => {
    try {
      setLoading(true);
      const newOutfits: OutfitResponse[] = [];
      
      // 📡 Enviamos las preferencias como Query Params al backend
      const queryParams = `?abrigo=${includeCoat}&accesorio=${includeAcc}`;
      
      for (let i = 0; i < 5; i++) {
        const res = await api.get(`/api/outfit${queryParams}`);
        if (res.data) newOutfits.push(res.data);
      }
      
      setOutfits(newOutfits);
    } catch (err) {
      console.log("ERROR OUTFIT:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateNewOutfits();
  }, []);

  const renderOutfitCard = (outfit: OutfitResponse, index: number) => {
    // Filtramos solo los que no sean null para evitar errores de renderizado
    const items = [
      { data: outfit.superior, label: "Superior" },
      { data: outfit.inferior, label: "Inferior" },
      { data: outfit.calzado, label: "Calzado" },
      { data: outfit.abrigo, label: "Abrigo" },
      { data: outfit.accesorio, label: "Accesorio" },
    ].filter(item => item.data !== null);

    return (
      <View style={styles.card} key={index}>
        <View style={styles.headerRow}>
           <Text style={styles.outfitNumber}>Propuesta {index + 1}</Text>
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
          {items.map((item, idx) => (
            <View key={`${item.data!._id}-${idx}`} style={styles.imageWrapper}>
              <Image
                source={{ uri: item.data!.image }}
                style={styles.image}
                resizeMode="cover"
              />
              <Text style={styles.itemLabel}>{item.label}</Text>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: item.data!.color === "beige" ? "#F5F5DC" : item.data!.color },
                ]}
              />
            </View>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.saveBtn}>
          <Ionicons name="heart-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Tus Outfits 🔥</Text>

      {/* 🛠 SECCIÓN DE FILTROS */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Añadir a la combinación:</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.chip, includeCoat && styles.chipActive]} 
            onPress={() => setIncludeCoat(!includeCoat)}
          >
            <Ionicons name="thermometer-outline" size={16} color={includeCoat ? "#fff" : colors.secondary} />
            <Text style={[styles.chipText, includeCoat && styles.chipTextActive]}>Abrigo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.chip, includeAcc && styles.chipActive]} 
            onPress={() => setIncludeAcc(!includeAcc)}
          >
            <Ionicons name="watch-outline" size={16} color={includeAcc ? "#fff" : colors.secondary} />
            <Text style={[styles.chipText, includeAcc && styles.chipTextActive]}>Accesorios</Text>
          </TouchableOpacity>
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
            <Ionicons name="color-wand" size={18} color="#fff" />
            <Text style={styles.generateText}>Generar combinaciones</Text>
          </>
        )}
      </TouchableOpacity>

      {loading && outfits.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Mezclando tu armario...</Text>
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => renderOutfitCard(item, index)}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="shirt-outline" size={50} color={colors.secondary} />
              <Text style={styles.emptyText}>Sube prendas para empezar a combinar.</Text>
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
  
  // Estilos de los filtros (chips)
  filterContainer: { marginBottom: 20 },
  filterTitle: { color: colors.secondary, fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: { color: colors.secondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  generateBtn: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  outfitNumber: { color: colors.secondary, fontSize: 13, fontWeight: 'bold' },
  matchBadge: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
  matchText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  itemsScroll: { gap: 12, paddingRight: 10 },
  imageWrapper: { alignItems: 'center', position: "relative" },
  image: {
    width: 100,
    height: 140,
    borderRadius: 15,
    backgroundColor: colors.background,
    marginBottom: 6,
  },
  itemLabel: { color: colors.secondary, fontSize: 10, fontWeight: '600' },
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
  saveBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  loadingText: { color: colors.secondary, marginTop: 10, fontWeight: '600' },
  emptyText: { color: colors.secondary, textAlign: "center", marginTop: 20 },
});