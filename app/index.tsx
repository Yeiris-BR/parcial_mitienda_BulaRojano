import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { syncProducts } from '../services/sync';

export default function InventarioScreen() {
  const { session, signOut } = useAuth();
  const { products, totalUnits, totalValue, pendingCount, remove } = useProducts();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!session?.user) return;
    setSyncing(true);
    try {
      const res = await syncProducts(session.user.id);
      Alert.alert('Sincronización', `${res.subidos} subidos, ${res.bajados} bajados.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No hay conexión a internet.');
    } finally {
      setSyncing(false);
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro que deseas eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Tienda</Text>
        <Pressable onPress={signOut}><Text style={styles.logout}>Salir</Text></Pressable>
      </View>

      <View style={styles.summary}>
        <Text>Total Unidades: {totalUnits}</Text>
        <Text>Valor Total: ${totalValue}</Text>
        <Text>Pendientes por subir: {pendingCount}</Text>
        
        <Pressable style={styles.syncBtn} onPress={handleSync} disabled={syncing}>
          <Text style={styles.syncText}>{syncing ? 'Sincronizando...' : 'Sincronizar'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>No hay productos. Agrega uno.</Text>}
        renderItem={({ item }) => {
          const isPending = !item.syncedAt || item.syncedAt < item.updatedAt;
          return (
            <Pressable 
              style={styles.row} 
              onPress={() => router.push({ pathname: '/producto', params: { id: String(item.id) } })}
              onLongPress={() => confirmDelete(item.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>Cantidad: {item.quantity} | Precio: ${item.price}</Text>
              </View>
              <Text style={{ color: isPending ? 'orange' : 'green' }}>
                {isPending ? '⏳ Pendiente' : '✅ En nube'}
              </Text>
            </Pressable>
          );
        }}
      />

      <Link href="/producto" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold' },
  logout: { color: 'red', fontSize: 16 },
  summary: { padding: 20, backgroundColor: '#f9f9f9', gap: 5 },
  syncBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  syncText: { color: 'white', fontWeight: 'bold' },
  row: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, backgroundColor: '#007AFF', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
});