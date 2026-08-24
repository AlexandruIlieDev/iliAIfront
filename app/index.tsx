import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { getToken } from "../utils/authStorage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        // Si el token existe y es válido, marcamos como logueado
        if (token && token !== "" && token !== "undefined") {
          setHasToken(true);
        } else {
          setHasToken(false);
        }
      } catch (e) {
        setHasToken(false);
      } finally {
        setIsReady(true);
      }
    };
    checkToken();
  }, []);

  // Mientras decide, mostramos fondo oscuro para que no haya parpadeo blanco
  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#121929", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // AQUÍ ESTÁ LA MAGIA: 
  // Si tiene token -> Directo al Home
  // Si NO tiene token -> Directo al Login
  return hasToken ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}