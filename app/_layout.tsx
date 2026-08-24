import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Grupo de autenticación (Login / Register) */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          
          {/* Navegación principal por pestañas */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          {/* Pantalla modal (si la utilizas) */}
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal', 
              headerShown: true, 
              title: 'Detalle' 
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}