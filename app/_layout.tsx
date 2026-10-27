import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { db } from '../db/client';
import migrations from '../drizzle/migrations';

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}><Text>Error DB: {error.message}</Text></View>;
  }

  if (isLoading || !success) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" options={{ title: 'Inventario' }} />
        <Stack.Screen name="producto" options={{ title: 'Producto', presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: 'Registro' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}