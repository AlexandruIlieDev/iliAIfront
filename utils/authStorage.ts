import { Platform } from "react-native";

const TOKEN_KEY = "token";
const isWeb = Platform.OS === "web";

/**
 * Almacenamiento del token de sesión.
 *
 * - iOS / Android: expo-secure-store (Keychain / Keystore, cifrado por el sistema).
 * - Web: expo-secure-store NO está soportado en web (sus métodos fallan), así que
 *   se usa localStorage, igual que hacía AsyncStorage antes. OJO: en web el token
 *   queda legible por cualquier script de la página (riesgo XSS). Para reforzarlo
 *   más adelante: tokens de vida más corta + refresh, o cookie httpOnly.
 *
 * El require de expo-secure-store es perezoso (solo en nativo) para que el bundle
 * web nunca ejecute ese módulo.
 */
const secureStore = () =>
  require("expo-secure-store") as typeof import("expo-secure-store");

export async function getToken(): Promise<string | null> {
  if (isWeb) {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null; // SSR / almacenamiento bloqueado
    }
  }
  return secureStore().getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await secureStore().setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nada que borrar */
    }
    return;
  }
  await secureStore().deleteItemAsync(TOKEN_KEY);
}