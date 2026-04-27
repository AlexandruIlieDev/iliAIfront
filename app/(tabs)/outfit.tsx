import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import axios, { AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// 🚀 IMPORTACIÓN CENTRALIZADA
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
};

// --- LÓGICA DE COLORES ---
const neutralColors = ["black", "white", "grey", "beige"];
const colorMatches: Record<string, string[]> = {
  black: ["white", "grey", "beige", "blue", "red"],
  white: ["black", "blue", "grey", "green"],
  blue: ["white", "black", "beige"],
  beige: ["white", "brown", "black"],
  red: ["black", "white"],
  green: ["white", "beige"],
};

const matchColors = (base: string, candidate: string) => {
  if (neutralColors.includes(base) || neutralColors.includes(candidate))
    return true;
  return colorMatches[base]?.includes(candidate);
};

type ClothingItem = {
  _id: string;
  name: string;
  image: string; // URL de Cloudinary
  category: string;
  color: string;
};

type Outfit = {
  id: string;
  items: ClothingItem[];
};

export default function OutfitScreen() {
  const [loading, setLoading] = useState(true);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  const getClothes = async () => {
    try {
      setLoading(true);
      // Al usar la instancia 'api', ya sabe que debe ir a BASE_URL + /api/clothing
      const res = await api.get("/api/clothing");
      generateSmartOutfits(res.data);
    } catch (err) {
      console.log("ERROR OUTFIT:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartOutfits = (clothes: ClothingItem[]) => {
    const tops = clothes.filter((c) => c.category === "superior");
    const bottoms = clothes.filter((c) => c.category === "inferior");
    const shoes = clothes.filter((c) => c.category === "calzado");

    const newOutfits: Outfit[] = [];

    for (let i = 0; i < 8; i++) {
      if (tops.length === 0 || bottoms.length === 0) break;

      const randomTop = tops[Math.floor(Math.random() * tops.length)];

      const compatibleBottoms = bottoms.filter((b) =>
        matchColors(randomTop.color, b.color),
      );
      const randomBottom =
        compatibleBottoms.length > 0
          ? compatibleBottoms[
              Math.floor(Math.random() * compatibleBottoms.length)
            ]
          : bottoms[Math.floor(Math.random() * bottoms.length)];

      const compatibleShoes = shoes.filter((s) =>
        matchColors(randomBottom.color, s.color),
      );
      const randomShoes =
        compatibleShoes.length > 0
          ? compatibleShoes[Math.floor(Math.random() * compatibleShoes.length)]
          : shoes[Math.floor(Math.random() * shoes.length)];

      const items = [randomTop, randomBottom, randomShoes].filter(Boolean);

      if (items.length >= 2) {
        newOutfits.push({
          id: Math.random().toString(),
          items,
        });
      }
    }
    setOutfits(newOutfits);
  };

  useEffect(() => {
    getClothes();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Tus Outfits 🔥</Text>

      <TouchableOpacity style={styles.generateBtn} onPress={getClothes}>
        <Ionicons name="sparkles" size={18} color="#fff" />
        <Text style={styles.generateText}>Re-generar combinaciones</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Mezclando tu armario...</Text>
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.itemsRow}>
                {item.items.map((cloth) => {
                  const imageUrl = cloth.image;

                  return (
                    <View key={cloth._id} style={styles.imageWrapper}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={(e) =>
                          console.log("Error en outfit img:", imageUrl)
                        }
                      />
                      <View
                        style={[
                          styles.colorIndicator,
                          {
                            backgroundColor:
                              cloth.color === "beige" ? "#F5F5DC" : cloth.color,
                          },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
              <TouchableOpacity style={styles.saveBtn}>
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Sube más prendas para generar outfits
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingTop: 50,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 15,
  },
  generateBtn: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 8,
    elevation: 4,
  },
  generateText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  itemsRow: { flex: 1, flexDirection: "row", gap: 10 },
  imageWrapper: { position: "relative" },
  image: {
    width: 85,
    height: 110,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  colorIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  saveBtn: {
    padding: 10,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: colors.secondary, marginTop: 10, fontSize: 16 },
  emptyText: { color: colors.secondary, textAlign: "center", marginTop: 50 },
});
