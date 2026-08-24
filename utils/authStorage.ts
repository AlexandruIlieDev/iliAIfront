import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";

/**
 * SecureStore cifra el valor usando Keychain (iOS) / Keystore (Android),
 * a diferencia de AsyncStorage que lo guarda en texto plano.
 * En web no hay Keychain/Keystore nativo: SecureStore usa localStorage
 * como fallback igual que hacía AsyncStorage, así que en web el
 * comportamiento no cambia (si más adelante quieres reforzarlo en web
 * también, habría que mirar una solución de cookies httpOnly en el backend).
 */

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}